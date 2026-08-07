import { ImageIcon, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

import { SETTINGS_PERMISSIONS } from '../constants';
import { useRemoveLogo, useUploadLogo } from '../hooks/useSettings';

const MAX_BYTES = 1024 * 1024; // 1 MB — must match the backend rule
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/**
 * School logo upload. Appears on reports, receipts and the sign-in screen, so
 * the preview is rendered on both light and dark backgrounds — a logo with a
 * baked-in white background is the usual nasty surprise here.
 */
export function LogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const removeDialog = useDisclosure();

  const uploadLogo = useUploadLogo();
  const removeLogo = useRemoveLogo();
  const canUpdate = useAuthStore((state) => state.hasPermission)(SETTINGS_PERMISSIONS.update);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error('Unsupported file', 'Choose a PNG, JPG, WebP or SVG image.');
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error('Image too large', 'Choose an image under 1 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    uploadLogo.mutate(file, {
      onSettled: () => {
        URL.revokeObjectURL(objectUrl);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  };

  const source = preview ?? logoUrl;

  return (
    <Card>
      <CardHeader
        title="Logo"
        description="Shown on the sign-in screen, reports and printed receipts."
      />

      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {(['bg-white', 'bg-slate-800'] as const).map((background) => (
            <div
              key={background}
              className={`flex size-28 items-center justify-center rounded-lg border border-slate-200 p-3 ${background}`}
            >
              {source ? (
                <img
                  src={source}
                  alt="School logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <ImageIcon className="size-7 text-slate-300" aria-hidden />
              )}
            </div>
          ))}

          <p className="max-w-48 self-center text-xs text-slate-500">
            Previewed on light and dark backgrounds. A transparent PNG or SVG works best.
          </p>
        </div>

        {canUpdate && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            <Button
              variant="outline"
              size="sm"
              isLoading={uploadLogo.isPending}
              onClick={() => inputRef.current?.click()}
              leftIcon={<Upload className="size-4" />}
            >
              {logoUrl ? 'Replace logo' : 'Upload logo'}
            </Button>

            {logoUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={removeDialog.open}
                leftIcon={<Trash2 className="size-4" />}
              >
                Remove
              </Button>
            )}

            <span className="text-xs text-slate-500">PNG, JPG, WebP or SVG. Max 1 MB.</span>
          </div>
        )}
      </CardBody>

      <ConfirmDialog
        isOpen={removeDialog.isOpen}
        onClose={removeDialog.close}
        onConfirm={() => removeLogo.mutate(undefined, { onSuccess: () => removeDialog.close() })}
        isLoading={removeLogo.isPending}
        isDestructive
        title="Remove the logo?"
        message="Reports and receipts will fall back to the school name until a new logo is uploaded."
        confirmLabel="Remove logo"
      />
    </Card>
  );
}

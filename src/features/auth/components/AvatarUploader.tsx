import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/toastStore';
import type { AuthUser } from '@/types/auth';

import { useUpdateAvatar } from '../hooks/useProfile';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — must match the backend rule
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Profile photo upload. Validates type and size client-side so an obvious
 * rejection does not cost a round trip; the backend re-validates regardless.
 */
export function AvatarUploader({ user }: { user: AuthUser }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const updateAvatar = useUpdateAvatar();

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error('Unsupported file', 'Choose a JPG, PNG or WebP image.');
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error('Image too large', 'Choose an image under 2 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    updateAvatar.mutate(file, {
      // Release the object URL either way; the server URL takes over on success.
      onSettled: () => {
        URL.revokeObjectURL(objectUrl);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar name={user.name} src={preview ?? user.avatar_url} size="lg" online />

      <div>
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
          isLoading={updateAvatar.isPending}
          onClick={() => inputRef.current?.click()}
          leftIcon={<Camera className="size-4" />}
        >
          Change photo
        </Button>

        <p className="mt-1.5 text-xs text-slate-500">JPG, PNG or WebP. Max 2 MB.</p>
      </div>
    </div>
  );
}

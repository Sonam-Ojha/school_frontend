import { Lightbulb } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

import { CONFIDENCE_LABELS, CONFIDENCE_TONES } from '../constants';
import type { Confidence, Insight } from '../types';

const TONE: Record<ToneName, string> = {
  neutral: 'border-slate-200',
  info: 'border-brand-200 bg-brand-50/40',
  success: 'border-emerald-200 bg-emerald-50/40',
  warning: 'border-amber-200 bg-amber-50/50',
  danger: 'border-red-200 bg-red-50/50',
};

interface InsightListProps {
  insights: Insight[];
  method: string;
  sampleSize: number;
  confidence: Confidence;
}

/**
 * The findings, with what they rest on.
 *
 * The method line and the sample size are not decoration and are not
 * collapsible: a coefficient printed on its own invites a school to
 * reorganise around eleven students, and the only defence is putting the
 * denominator in the same breath as the claim.
 */
export function InsightList({ insights, method, sampleSize, confidence }: InsightListProps) {
  return (
    <Card>
      <CardHeader
        title="What the numbers say"
        description={method}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">n = {sampleSize}</Badge>
            <Badge tone={CONFIDENCE_TONES[confidence]} withDot>
              {CONFIDENCE_LABELS[confidence]}
            </Badge>
          </div>
        }
      />

      <CardBody className="space-y-2">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
            <Lightbulb className="size-6" />
            <p className="text-sm">Nothing stood out in this data.</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.key}
              className={cn('rounded-lg border p-3', TONE[insight.tone])}
            >
              <p className="text-sm font-medium text-slate-900">{insight.headline}</p>
              <p className="mt-0.5 text-sm text-slate-600">{insight.detail}</p>
              <p className="mt-1 text-xs text-slate-400">{insight.evidence}</p>
            </div>
          ))
        )}

        {confidence === 'low' && insights.length > 0 && (
          <p className="pt-1 text-xs text-slate-500">
            Treat these as a prompt to look, not as a conclusion — the sample is small enough
            that a handful of students could move any of them.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

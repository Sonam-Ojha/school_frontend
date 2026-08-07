import { CalendarCheck, GraduationCap, LayoutGrid, Wallet, type LucideIcon } from 'lucide-react';

import type { Option, ToneName } from '@/types/common';

import type { AnalysisKey, AnalyticsDomain, Confidence, ProviderStatus } from './types';

/**
 * Analytics reads across every module and changes nothing, so `read` and
 * `export` are the whole set — there is no create, update or delete because
 * an analysis is derived and nobody edits one. It rides on the reports
 * resource rather than adding a second one: a school that lets somebody see
 * the fee report is not a school that wants a separate right for the fee
 * analysis of the same numbers.
 */
export const ANALYTICS_PERMISSIONS = {
  read: 'reports.read',
  export: 'reports.export',
} as const;

export interface DomainDefinition {
  key: AnalyticsDomain;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ANALYTICS_DOMAINS: DomainDefinition[] = [
  {
    key: 'performance',
    label: 'Performance',
    description: 'What actually moves results, and who is falling behind.',
    icon: GraduationCap,
  },
  {
    key: 'attendance',
    label: 'Attendance',
    description: 'The shape of absence — which days, which children, how chronic.',
    icon: CalendarCheck,
  },
  {
    key: 'fees',
    label: 'Collection',
    description: 'How arrears age, and where they are concentrated.',
    icon: Wallet,
  },
  {
    key: 'cohorts',
    label: 'Cohorts',
    description: 'Class against class, on one scale.',
    icon: LayoutGrid,
  },
];

export const DOMAIN_KEYS = ANALYTICS_DOMAINS.map((domain) => domain.key);

export const isDomain = (value: string | undefined): value is AnalyticsDomain =>
  value !== undefined && (DOMAIN_KEYS as string[]).includes(value);

export const domainOf = (key: AnalyticsDomain) =>
  ANALYTICS_DOMAINS.find((domain) => domain.key === key)!;

export interface AnalysisDefinition {
  key: AnalysisKey;
  domain: AnalyticsDomain;
  title: string;
  /** The question it answers, in the words somebody would ask it. */
  question: string;
  /** Filter controls, reusing the reports module's parameter vocabulary. */
  params: ('month' | 'year' | 'class' | 'exam')[];
}

/**
 * The catalogue.
 *
 * A frontend registry for the same reason the reports one is: it describes
 * the screen — what an analysis is called and which controls to draw — while
 * the API owns the numbers.
 */
export const ANALYSIS_CATALOGUE: AnalysisDefinition[] = [
  {
    key: 'performance-drivers',
    domain: 'performance',
    title: 'What moves results',
    question: 'Does turning up actually change the marks, and by how much?',
    params: ['exam', 'month'],
  },
  {
    key: 'at-risk-students',
    domain: 'performance',
    title: 'Students at risk',
    question: 'Who is on a trajectory somebody should interrupt?',
    params: ['class', 'month'],
  },
  {
    key: 'attendance-patterns',
    domain: 'attendance',
    title: 'The shape of absence',
    question: 'Which days lose children, and who is chronically away?',
    params: ['month', 'class'],
  },
  {
    key: 'collection-health',
    domain: 'fees',
    title: 'How arrears age',
    question: 'Is the money late, or is it not coming?',
    params: ['class'],
  },
  {
    key: 'cohort-comparison',
    domain: 'cohorts',
    title: 'Class against class',
    question: 'Which classes are outliers, on attendance, marks or money?',
    params: ['month'],
  },
];

export const analysesOf = (domain: AnalyticsDomain) =>
  ANALYSIS_CATALOGUE.filter((analysis) => analysis.domain === domain);

export const findAnalysis = (key: string | undefined) =>
  ANALYSIS_CATALOGUE.find((analysis) => analysis.key === key) ?? null;

// --- presentation -----------------------------------------------------------

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  low: 'Low confidence',
  moderate: 'Moderate confidence',
  high: 'High confidence',
};

export const CONFIDENCE_TONES: Record<Confidence, ToneName> = {
  low: 'neutral',
  moderate: 'info',
  high: 'success',
};

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  ready: 'Ready',
  disabled: 'Switched off',
  not_configured: 'Not configured',
  unavailable: 'Not available in this build',
};

export const PROVIDER_STATUS_TONES: Record<ProviderStatus, ToneName> = {
  ready: 'success',
  disabled: 'warning',
  not_configured: 'warning',
  unavailable: 'neutral',
};

export const CAPABILITY_LABELS: Record<string, string> = {
  explain: 'Explain a finding in plain language',
  forecast: 'Project a measure forward',
  summarise: 'Summarise an analysis',
  recommend: 'Suggest what to do next',
};

// --- policy -----------------------------------------------------------------

/**
 * How the risk score is weighted.
 *
 * Attendance dominates because it is both the strongest single predictor and
 * the one a school can actually do something about the same week. Money is in
 * there because a child whose fees are months behind is a child under a
 * pressure that shows up in the other three.
 *
 * Missing parts are dropped and the rest renormalised — see `weightedScore`.
 * A new admission with no marks yet is not a child who scored nothing.
 */
export const RISK_WEIGHTS = {
  attendance: 0.4,
  marks: 0.3,
  homework: 0.2,
  fees: 0.1,
} as const;

/** At or above this, a student is on the list. */
export const RISK_THRESHOLD = 45;

/** Rows a cohort table shows before it stops being a preview. */
export const COHORT_PREVIEW_SIZE = 25;

/** Absent this share of the month or worse is chronic rather than incidental. */
export const CHRONIC_ABSENCE_PERCENT = 20;

/** Ageing buckets for arrears, in days past the due date. */
export const AGEING_BUCKETS = [
  { label: 'Not yet due', upTo: 0 },
  { label: '1–30 days', upTo: 30 },
  { label: '31–60 days', upTo: 60 },
  { label: '61–90 days', upTo: 90 },
  { label: 'Over 90 days', upTo: Number.POSITIVE_INFINITY },
] as const;

export const EXPORT_FORMATS: Option<string>[] = [
  { label: 'Excel', value: 'excel' },
  { label: 'PDF', value: 'pdf' },
];

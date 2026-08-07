import type { ReportSeries } from '@/features/reports/types';
import type { ToneName } from '@/types/common';

/**
 * Analytics.
 *
 * Deliberately not the reports module, and the line between them is the whole
 * design. A **report** answers a question you came to ask: how many, how
 * much, this month against last. Descriptive, and already built. An
 * **analysis** answers what you did not know to ask — that attendance and
 * marks move together and by how much, which classes are outliers, which
 * forty children are on a trajectory somebody should interrupt.
 *
 * The difference shows in the output. A report returns rows; an analysis
 * returns *findings* — each with its evidence, its sample size and how much
 * of it to believe — plus a **cohort**, because an insight nobody can act on
 * is trivia.
 */

export type AnalysisKey =
  | 'performance-drivers'
  | 'at-risk-students'
  | 'attendance-patterns'
  | 'collection-health'
  | 'cohort-comparison';

export type AnalyticsDomain = 'performance' | 'attendance' | 'fees' | 'cohorts';

/**
 * How much of a finding to believe.
 *
 * Carried on every analysis and shown next to every headline, because a
 * coefficient printed without its sample size is how a school ends up
 * reorganising around eleven students.
 */
export type Confidence = 'low' | 'moderate' | 'high';

/** One finding. The sentence a head would repeat in a meeting. */
export interface Insight {
  key: string;
  headline: string;
  detail: string;
  tone: ToneName;
  /** What it was measured on — "38 students who sat both". */
  evidence: string;
  /** Sorts the list. The biggest effect first, not the first computed. */
  magnitude: number;
}

/** A row of the cohort an analysis produces — the people to do something about. */
export interface CohortMember {
  id: string;
  name: string;
  identifier: string;
  detail: string | null;
  /** The measure that put them on the list, already formatted. */
  metrics: Record<string, number | null>;
  tone: ToneName;
  to: string | null;
}

export interface Cohort {
  key: string;
  title: string;
  description: string;
  /** Column order and labels, so the table needs no per-analysis component. */
  columns: { key: string; label: string; format: 'number' | 'percent' | 'money' }[];
  members: CohortMember[];
  /** How many matched in total, when the list is a preview of a longer one. */
  total: number;
}

export interface ScatterSeries {
  x_label: string;
  y_label: string;
  x_is_percent: boolean;
  y_is_percent: boolean;
  points: { x: number; y: number; label: string }[];
  /** Null where a regression would assert a relationship that is not there. */
  trend: { slope: number; intercept: number; r_squared: number } | null;
}

// --- the AI-ready seam ------------------------------------------------------

/**
 * The machine-readable form of an analysis.
 *
 * This is what "AI ready" actually means here, and it is a data contract
 * rather than a promise: every analysis emits the same feature matrix it drew
 * its own conclusions from — one row per subject, named numeric columns, and
 * a named target where there is one. A model can be trained or scored on this
 * without a single screen changing, and nothing in the app has to know
 * whether one ever is.
 *
 * Deliberately flat and numeric. A vector of strings is a vector that needs
 * an encoder somebody has to keep in step with the schema.
 */
export interface FeatureVector {
  /** Bumped when a column changes meaning, so an old model fails loudly. */
  schema_version: string;
  feature_names: string[];
  /** The column a model would predict, when the analysis has one. */
  target: string | null;
  rows: {
    id: string;
    label: string;
    features: Record<string, number>;
  }[];
}

export type ProviderCapability = 'explain' | 'forecast' | 'summarise' | 'recommend';

/**
 * `unavailable` — this deployment has no integration at all;
 * `not_configured` — there is one, but no credentials;
 * `disabled` — configured and switched off;
 * `ready` — it would answer if asked.
 *
 * The same four states the communication module uses for a channel, on
 * purpose: "we could do this but nobody has set it up" is a different message
 * from "this build cannot", and both are different from an error.
 */
export type ProviderStatus = 'ready' | 'disabled' | 'not_configured' | 'unavailable';

export interface IntelligenceProvider {
  key: string;
  name: string;
  description: string;
  status: ProviderStatus;
  detail: string | null;
  capabilities: ProviderCapability[];
  /** Where it would be configured, so the screen can link somewhere useful. */
  configured_in: 'settings' | null;
}

/**
 * What a bound provider added.
 *
 * Null on every analysis until one is bound — and the screens already render
 * it, which is the point of building the seam before the model. Nothing in
 * this module generates any of it: the deterministic statistics stand on
 * their own and are labelled as such.
 */
export interface Intelligence {
  provider: string;
  generated_at: string;
  summary: string | null;
  forecast: { label: string; value: number; horizon: string }[] | null;
  recommendations: string[] | null;
}

// --- the envelope -----------------------------------------------------------

export interface Analysis {
  key: AnalysisKey;
  domain: AnalyticsDomain;
  title: string;
  subtitle: string | null;
  generated_at: string;
  params: Record<string, string>;

  /** How it was worked out, in one line. An analysis that will not say is not one. */
  method: string;
  sample_size: number;
  confidence: Confidence;

  insights: Insight[];
  /** Charts reuse the reports module's own series shape and components. */
  series: ReportSeries[];
  scatter: ScatterSeries | null;
  cohort: Cohort | null;

  features: FeatureVector;
  intelligence: Intelligence | null;

  empty_reason: string | null;
}

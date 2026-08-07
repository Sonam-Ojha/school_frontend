/** Public surface of the analytics module. */

export { AnalysisRunner } from './components/AnalysisRunner';
export { CohortTable } from './components/CohortTable';
export { InsightList } from './components/InsightList';
export { IntelligencePanel } from './components/IntelligencePanel';

export {
  AGEING_BUCKETS,
  ANALYSIS_CATALOGUE,
  ANALYTICS_DOMAINS,
  ANALYTICS_PERMISSIONS,
  CAPABILITY_LABELS,
  CHRONIC_ABSENCE_PERCENT,
  COHORT_PREVIEW_SIZE,
  CONFIDENCE_LABELS,
  CONFIDENCE_TONES,
  DOMAIN_KEYS,
  PROVIDER_STATUS_LABELS,
  PROVIDER_STATUS_TONES,
  RISK_THRESHOLD,
  RISK_WEIGHTS,
  analysesOf,
  domainOf,
  findAnalysis,
  isDomain,
  type AnalysisDefinition,
  type DomainDefinition,
} from './constants';

export {
  analyticsKeys,
  useAnalysis,
  useExportCohort,
  useFeatureVector,
  useIntelligenceProviders,
} from './hooks/useAnalytics';

export { analyticsService, type AnalysisParams } from './services/analyticsService';

export type {
  Analysis,
  AnalysisKey,
  AnalyticsDomain,
  Cohort,
  CohortMember,
  Confidence,
  FeatureVector,
  Insight,
  Intelligence,
  IntelligenceProvider,
  ProviderCapability,
  ProviderStatus,
  ScatterSeries,
} from './types';

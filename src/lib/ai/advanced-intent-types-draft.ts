
// Existing imports...
import { BaseIntent, Filter } from './intent-types';

export interface CompareMetricIntent extends BaseIntent {
    type: 'COMPARE_METRIC';
    metricColumn: string;
    dateColumn: string;
    period: 'year_over_year' | 'month_over_month' | 'previous_period';
    filters: Filter[];
}

export interface CohortAnalysisIntent extends BaseIntent {
    type: 'COHORT_ANALYSIS';
    dateColumn: string; // The "Start Date" (e.g. signup date)
    metricColumn?: string; // Optional: specific metric to track (default is retention/count)
    interval: 'day' | 'week' | 'month'; // Cohort bucket size
    filters: Filter[];
}

// Update the Union Type
// export type AnalysisIntent = ... | CompareMetricIntent | CohortAnalysisIntent;

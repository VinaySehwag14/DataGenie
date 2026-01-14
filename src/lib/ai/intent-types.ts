
export type Operator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'ilike';

export type Filter = {
    column: string;
    operator: Operator;
    value: string | number | boolean;
};

export type AggregateFunction = 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';

export type IntentType = 'AGGREGATE_METRIC' | 'TREND_ANALYSIS' | 'TOP_LIST' | 'DISTRIBUTION' | 'COMPARE_METRIC' | 'COHORT_ANALYSIS' | 'UNKNOWN';

export interface BaseIntent {
    type: IntentType;
    confidence: number; // 0-1
    reasoning: string;
}

export interface AggregateMetricIntent extends BaseIntent {
    type: 'AGGREGATE_METRIC';
    metricColumn: string;
    aggregateFunction: AggregateFunction;
    groupByColumn?: string;
    filters: Filter[];
}

export interface TrendAnalysisIntent extends BaseIntent {
    type: 'TREND_ANALYSIS';
    metricColumn: string; // The value to measure over time
    dateColumn: string;   // The time dimension
    aggregateFunction: AggregateFunction;
    timeGrain: 'day' | 'week' | 'month' | 'year';
    filters: Filter[];
}

export interface TopListIntent extends BaseIntent {
    type: 'TOP_LIST';
    metricColumn: string;
    dimensionColumn: string; // what we are listing (e.g. "Products")
    limit: number;
    order: 'desc' | 'asc';
    filters: Filter[];
}

export interface DistributionIntent extends BaseIntent {
    type: 'DISTRIBUTION';
    metricColumn: string; // e.g. Count of users
    dimensionColumn: string; // e.g. by Country
    filters: Filter[];
}

export interface CompareMetricIntent extends BaseIntent {
    type: 'COMPARE_METRIC';
    metricColumn: string;
    dateColumn: string;
    period: 'year_over_year' | 'month_over_month' | 'previous_period';
    filters: Filter[];
}

export interface CohortAnalysisIntent extends BaseIntent {
    type: 'COHORT_ANALYSIS';
    dateColumn: string;
    metricColumn?: string;
    interval: 'day' | 'week' | 'month';
    filters: Filter[];
}

export interface UnknownIntent extends BaseIntent {
    type: 'UNKNOWN';
}

export type AnalysisIntent =
    | AggregateMetricIntent
    | TrendAnalysisIntent
    | TopListIntent
    | DistributionIntent
    | CompareMetricIntent
    | CohortAnalysisIntent
    | UnknownIntent;

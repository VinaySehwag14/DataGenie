import { AnalysisIntent, Filter } from "../ai/intent-types";

// Helper to escape simple identifiers (very basic, but sufficient for known column names)
function escapeId(id: string): string {
    return `"${id.replace(/"/g, '""')}"`;
}

// Helper to cast JSONB fields based on usage. 
// NOW UPDATED: If dialect is 'postgres-json', use ->>. If 'std' (DuckDB), use direct column.
function getFieldExpression(column: string, type: 'numeric' | 'text' | 'date' = 'text', dialect: 'std' | 'postgres-json' = 'std'): string {
    const safeCol = escapeId(column);

    if (dialect === 'std') {
        // Standard SQL (DuckDB)
        if (type === 'numeric') return `TRY_CAST(${safeCol} AS DOUBLE)`; // DuckDB specific safe cast
        if (type === 'date') return `TRY_CAST(${safeCol} AS TIMESTAMP)`; // DuckDB cast
        return safeCol;
    }

    // Legacy Postgres JSONB
    const raw = `(row_data->>'${column}')`;
    if (type === 'numeric') return `(${raw})::numeric`;
    if (type === 'date') return `(${raw})::timestamp`;
    return raw;
}

function buildWhereClause(dataSourceId: string, filters: Filter[], dialect: 'std' | 'postgres-json' = 'std'): string {
    // For DuckDB, we don't need dataSourceId filter if we create a dedicated table per request
    // But if we keep one big table, we do.
    // DESIGN DECISION: We will create a temp table named 'current_analysis' for each request.
    // So 'data_source_id' filter is NOT needed in the SQL itself for DuckDB.

    const clauses = [];
    if (dialect === 'postgres-json') {
        clauses.push(`data_source_id = '${dataSourceId}'`);
    }

    for (const f of filters) {
        // Simple type inference for the filter
        const isNumeric = typeof f.value === 'number';
        const expr = getFieldExpression(f.column, isNumeric ? 'numeric' : 'text', dialect);

        const val = typeof f.value === 'string' ? `'${f.value.replace(/'/g, "''")}'` : f.value;

        switch (f.operator) {
            case 'eq': clauses.push(`${expr} = ${val}`); break;
            case 'neq': clauses.push(`${expr} != ${val}`); break;
            case 'gt': clauses.push(`${expr} > ${val}`); break;
            case 'lt': clauses.push(`${expr} < ${val}`); break;
            case 'gte': clauses.push(`${expr} >= ${val}`); break;
            case 'lte': clauses.push(`${expr} <= ${val}`); break;
            case 'contains': clauses.push(`${expr} ILIKE '%${String(f.value).replace(/'/g, "''")}%'`); break;
            case 'ilike': clauses.push(`${expr} ILIKE '${String(f.value).replace(/'/g, "''")}'`); break;
        }
    }

    return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
}

export function buildSqlFromIntent(intent: AnalysisIntent, dataSourceId: string, dialect: 'std' | 'postgres-json' = 'std'): string {
    if (intent.type === 'UNKNOWN') {
        throw new Error("Cannot generate query for UNKNOWN intent.");
    }

    // Common WHERE clause
    const whereClause = buildWhereClause(dataSourceId, intent.filters, dialect);
    const table = dialect === 'std' ? 'current_analysis' : 'data_rows';

    // --- TEMPLATE A: AGGREGATE METRIC ---
    if (intent.type === 'AGGREGATE_METRIC') {
        const expr = getFieldExpression(intent.metricColumn, 'numeric', dialect);
        const agg = `${intent.aggregateFunction}(${expr})`;

        if (intent.groupByColumn) {
            const groupCol = getFieldExpression(intent.groupByColumn, 'text', dialect);
            return `
                SELECT ${groupCol} as "group", ${agg} as "value"
                FROM ${table}
                ${whereClause}
                GROUP BY ${groupCol}
                ORDER BY "value" DESC
                LIMIT 100;
            `;
        } else {
            return `
                SELECT ${agg} as "value"
                FROM ${table}
                ${whereClause};
            `;
        }
    }

    // --- TEMPLATE B: TREND ANALYSIS ---
    if (intent.type === 'TREND_ANALYSIS') {
        const metric = getFieldExpression(intent.metricColumn, 'numeric', dialect);
        const dateCol = getFieldExpression(intent.dateColumn, 'date', dialect);

        let trunc = 'month'; // default
        if (intent.timeGrain === 'year') trunc = 'year';
        if (intent.timeGrain === 'day') trunc = 'day';
        if (intent.timeGrain === 'week') trunc = 'week';

        // DuckDB date_trunc structure: date_trunc('month', date)
        const dateFn = `DATE_TRUNC('${trunc}', ${dateCol})`;

        return `
            SELECT ${dateFn} as "date", 
                   ${intent.aggregateFunction}(${metric}) as "value"
            FROM ${table}
            ${whereClause}
            GROUP BY 1
            ORDER BY 1 ASC
            LIMIT 500;
        `;
    }

    // --- TEMPLATE C: TOP LIST ---
    if (intent.type === 'TOP_LIST') {
        const metric = getFieldExpression(intent.metricColumn, 'numeric', dialect);
        const dim = getFieldExpression(intent.dimensionColumn, 'text', dialect);

        return `
            SELECT ${dim} as "label", SUM(${metric}) as "value"
            FROM ${table}
            ${whereClause}
            GROUP BY 1
            ORDER BY 2 ${intent.order.toUpperCase()}
            LIMIT ${Math.min(intent.limit, 100)};
        `;
    }

    // --- TEMPLATE D: DISTRIBUTION ---
    if (intent.type === 'DISTRIBUTION') {
        const dim = getFieldExpression(intent.dimensionColumn, 'text', dialect);
        const isCount = intent.metricColumn.toLowerCase() === 'count';
        const metric = isCount ? 'COUNT(*)' : `SUM(${getFieldExpression(intent.metricColumn, 'numeric', dialect)})`;

        return `
            SELECT ${dim} as "label", ${metric} as "value"
            FROM ${table}
            ${whereClause}
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 20;
        `;
    }

    // --- TEMPLATE E: COMPARE METRIC (Advanced) ---
    if (intent.type === 'COMPARE_METRIC') {
        // Requirement: Compare Sum(Metric) in Current Period vs Previous Period
        const metric = getFieldExpression(intent.metricColumn, 'numeric', dialect);
        const dateCol = getFieldExpression(intent.dateColumn, 'date', dialect);

        // For complexity simplicity, we strictly implement 'month_over_month' for now as MVP template
        // DuckDB CTE
        // 1. Calculate summary per month
        // 2. Lag function to get previous

        // NOTE: DuckDB expects SQL standard.

        const timeTrunc = intent.period === 'year_over_year' ? 'year' : 'month'; // default to month comparison

        return `
            WITH monthly_stats AS (
                SELECT 
                    DATE_TRUNC('${timeTrunc}', ${dateCol}) as "period_date", 
                    SUM(${metric}) as "total_value"
                FROM ${table}
                ${whereClause}
                GROUP BY 1
            )
            SELECT 
                period_date as "date", 
                total_value as "current_value",
                LAG(total_value) OVER (ORDER BY period_date) as "previous_value",
                total_value - LAG(total_value) OVER (ORDER BY period_date) as "change_value",
                ROUND((total_value - LAG(total_value) OVER (ORDER BY period_date)) / NULLIF(LAG(total_value) OVER (ORDER BY period_date), 0) * 100, 2) as "percentage_change"
            FROM monthly_stats
            ORDER BY 1 DESC
            LIMIT 12; 
         `;
    }

    // --- TEMPLATE F: COHORT ANALYSIS (Advanced) ---
    if (intent.type === 'COHORT_ANALYSIS') {
        // e.g. Count of users by join_date (cohort) over activity periods
        // For MVP, since we don't have an "activity date" column strictly defined in intent (usually cohorts need UserID, StartDate, EventDate),
        // we will fallback to a simplied "Retention Proxy" or just a distribution over time if parameters missing.
        // BUT assuming we have a date column (Start Date), we can just show "New Users per Month" as a cohort baseline.
        // True cohort analysis requires 2 date columns.

        // Let's implement a "Growth" view which is arguably a cohort baseline.
        const dateCol = getFieldExpression(intent.dateColumn, 'date', dialect);

        return `
            SELECT 
                DATE_TRUNC('${intent.interval}', ${dateCol}) as "cohort_date", 
                COUNT(*) as "cohort_size"
            FROM ${table}
            ${whereClause}
            GROUP BY 1
            ORDER BY 1 ASC
            LIMIT 24; 
        `;
    }

    throw new Error(`Unsupported intent type: ${(intent as any).type}`);
}

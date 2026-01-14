import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { AnalysisIntent } from "./intent-types";

// Initialize the Google provider with the specific API key from environment
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
});

// Define Zod schemas for the LLM to output structured data
const filterSchema = z.object({
    column: z.string().describe("The exact column name from the schema to filter on"),
    operator: z.enum(['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'contains', 'ilike']).describe("Comparison operator"),
    value: z.union([z.string(), z.number(), z.boolean()]).describe("The value to filter by")
});

const intentSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("AGGREGATE_METRIC"),
        metricColumn: z.string().describe("The numerical column to calculate"),
        aggregateFunction: z.enum(['SUM', 'AVG', 'COUNT', 'MIN', 'MAX']),
        groupByColumn: z.string().optional().describe("Column to group results by (if asked)"),
        filters: z.array(filterSchema).default([]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string().describe("Short explanation of why this intent was chosen")
    }),
    z.object({
        type: z.literal("TREND_ANALYSIS"),
        metricColumn: z.string().describe("The numerical column to measure over time"),
        dateColumn: z.string().describe("The date/timestamp column for the x-axis"),
        aggregateFunction: z.enum(['SUM', 'AVG', 'COUNT', 'MIN', 'MAX']),
        timeGrain: z.enum(['day', 'week', 'month', 'year']).default('month'),
        filters: z.array(filterSchema).default([]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string().describe("Short explanation")
    }),
    z.object({
        type: z.literal("TOP_LIST"),
        metricColumn: z.string(),
        dimensionColumn: z.string().describe("The categorical column (e.g. Product Name)"),
        limit: z.number().default(5),
        order: z.enum(['desc', 'asc']).default('desc'),
        filters: z.array(filterSchema).default([]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string()
    }),
    z.object({
        type: z.literal("DISTRIBUTION"),
        metricColumn: z.string(),
        dimensionColumn: z.string(),
        filters: z.array(filterSchema).default([]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string()
    }),
    z.object({
        type: z.literal("COMPARE_METRIC"),
        metricColumn: z.string(),
        dateColumn: z.string(),
        period: z.enum(['year_over_year', 'month_over_month', 'previous_period']),
        filters: z.array(filterSchema).default([]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string()
    }),
    z.object({
        type: z.literal("COHORT_ANALYSIS"),
        dateColumn: z.string().describe("The start date for the cohort (e.g. joined_at)"),
        // metricColumn: z.string().optional(), // Removing optional for now to keep strict. Logic simplifies to COUNT(*) if not provided? Let's assume strictness.
        // Actually, let's make it optional in schema but handle undefined in builder.
        metricColumn: z.string().optional(),
        interval: z.enum(['day', 'week', 'month']).default('month'),
        filters: z.array(filterSchema).default([]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string()
    }),
    z.object({
        type: z.literal("UNKNOWN"),
        confidence: z.number(),
        reasoning: z.string().describe("Why the user query could not be mapped to a supported intent")
    })
]);

export async function classifyIntent(
    userMessage: string,
    columns: string[],
    columnTypes: Record<string, string>
): Promise<AnalysisIntent> {

    // Create a rich context about the available columns
    const schemaDescription = columns.map(col => {
        return `- "${col}" (Type: ${columnTypes[col] || 'unknown'})`;
    }).join("\n");

    const prompt = `
    You are a precise data analyst engine. Your job is to map a user's question to a structured analysis intent.
    
    AVAILABLE COLUMNS:
    ${schemaDescription}
    
    USER QUESTION: "${userMessage}"
    
    RULES:
    1. Map purely to the schema provided. Do not hallucinate columns.
    2. If the user asks for "sales", look for columns like "revenue", "total_sales", "amount".
    3. If the user asks for a trend ("over time", "monthly"), use TREND_ANALYSIS.
    4. If the user asks for "breakdown" or "distribution", use DISTRIBUTION.
    5. If the user asks for "top products", "best sellers", use TOP_LIST.
    6. If the user asks for "breakdown by [category]", use DISTRIBUTION.
    7. If the user asks for a single number ("total count", "average price"), use AGGREGATE_METRIC.
    8. If the user asks to compare two periods (e.g. "sales this month vs last month", "YoY growth"), use COMPARE_METRIC.
    9. If the user asks for retention or cohorts (e.g. "user retention by month", "cohort analysis"), use COHORT_ANALYSIS.
    10. If the user asks for a specific chart type (e.g. "bar chart of..."), map it to the most relevant intent (e.g. DISTRIBUTION or TOP_LIST).
    11. If the request is ambiguous or impossible with these columns, return UNKNOWN.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-1.5-flash'), // Switched to 1.5-flash for reliability
            schema: intentSchema,
            prompt: prompt,
            temperature: 0 // Deterministic
        });

        return object as AnalysisIntent;
    } catch (error) {
        console.error("Intent Classification Error:", error);
        return {
            type: "UNKNOWN",
            confidence: 0,
            reasoning: "System error during classification"
        };
    }
}

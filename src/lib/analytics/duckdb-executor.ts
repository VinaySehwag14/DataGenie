import duckdb from 'duckdb';

export class DuckDBExecutor {
    private db: duckdb.Database;

    constructor() {
        this.db = new duckdb.Database(':memory:');
    }

    /**
     * Loads JSON data into a DuckDB table.
     * DuckDB is amazing at inferring schema from JSON.
     */
    async loadData(tableName: string, data: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (data.length === 0) {
                // Create empty table if no data
                this.db.run(`CREATE TABLE ${tableName} (id INTEGER)`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
                return;
            }

            // We use a safe trick: strictly stringify the JSON and let DuckDB parse it
            const jsonString = JSON.stringify(data);

            // In a real optimized system, we'd use Arrow or Parquet. 
            // For now, passing JSON string is simplest for the "Node -> DuckDB" bridge.
            // We use a prepared statement to avoid injection, although read_json_auto usually takes a path.
            // Since we are in-memory, we might need to write to a temp file or use the insert method.

            // Approach: Create table from the first row keys (naive) or use DuckDB's JSON handling?
            // "read_json_auto" is for files. 
            // For in-memory, simpler to:
            // 1. Create Appender (fast) OR
            // 2. Just insert row by row (slow) OR
            // 3. (Best for MVP correctness) Create table with 'json' column, insert json, then unnest?
            // Actually, DuckDB Node client allows running generic SQL.

            // Let's try the most robust way for variable schemas:
            // 1. Write to a temporary virtual file (if supported) or just construct a massive INSERT
            // Warning: Huge INSERT strings are bad. 

            // BETTER: Use `json_structure` if we could. 

            // LET'S GO SIMPLE:
            // We know the columns from the first row roughly.
            // Let's rely on the fact that we can construct a tailored CREATE TABLE statement.

            const columns = Object.keys(data[0]);
            // Naive type inference
            const schema = columns.map(col => {
                const val = data[0][col];
                let type = 'VARCHAR';
                if (typeof val === 'number') type = 'DOUBLE';
                if (typeof val === 'boolean') type = 'BOOLEAN';
                // Sanitize column name
                return `"${col}" ${type}`;
            }).join(', ');

            const createTableMsg = `CREATE TABLE ${tableName} (${schema})`;

            this.db.run(createTableMsg, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Prepared statement for insertion
                const placeholders = columns.map(() => '?').join(', ');
                const stmt = this.db.prepare(`INSERT INTO ${tableName} VALUES (${placeholders})`);

                // Bulk insert
                // This is synchronous in the node binding for the loop, but execution is fast
                try {
                    for (const row of data) {
                        const values = columns.map(col => {
                            const v = row[col];
                            // basic sanitization
                            if (v === undefined) return null;
                            return v;
                        });
                        stmt.run(...values);
                    }
                    stmt.finalize();
                    resolve();
                } catch (insertErr) {
                    reject(insertErr);
                }
            });
        });
    }

    async executeQuery(sql: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

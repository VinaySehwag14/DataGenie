export class DuckDBExecutor {
    private db: any; // Using any to avoid top-level type import issues during build

    constructor() {
        // Lazy load duckdb to prevent build-time execution errors with native bindings
        // This ensures it only loads when the code is actually run (runtime), not when Next.js is building/linting
        const duckdb = require('duckdb');
        this.db = new duckdb.Database(':memory:');
    }

    /**
     * Loads JSON data into a DuckDB table.
     */
    async loadData(tableName: string, data: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (data.length === 0) {
                this.db.run(`CREATE TABLE ${tableName} (id INTEGER)`, (err: any) => {
                    if (err) reject(err);
                    else resolve();
                });
                return;
            }

            const columns = Object.keys(data[0]);
            // Naive type inference
            const schema = columns.map(col => {
                const val = data[0][col];
                let type = 'VARCHAR';
                // DuckDB is robust, but basic hints help
                if (typeof val === 'number') type = 'DOUBLE';
                if (typeof val === 'boolean') type = 'BOOLEAN';
                return `"${col}" ${type}`;
            }).join(', ');

            const createTableMsg = `CREATE TABLE ${tableName} (${schema})`;

            this.db.run(createTableMsg, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                const placeholders = columns.map(() => '?').join(', ');
                const stmt = this.db.prepare(`INSERT INTO ${tableName} VALUES (${placeholders})`);

                try {
                    for (const row of data) {
                        const values = columns.map(col => {
                            const v = row[col];
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
            this.db.all(sql, (err: any, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

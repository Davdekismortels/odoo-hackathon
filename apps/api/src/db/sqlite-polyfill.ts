import { DatabaseSync } from "node:sqlite";

export default class Database extends DatabaseSync {
  constructor(path: string) {
    super(path);
  }

  pragma(sql: string) {
    return this.exec(`PRAGMA ${sql}`);
  }

  prepare(sql: string) {
    const stmt = super.prepare(sql) as any;
    stmt.raw = function() {
      if (typeof stmt.setReturnArrays === 'function') {
        stmt.setReturnArrays(true);
      }
      return stmt;
    };
    return stmt;
  }
}

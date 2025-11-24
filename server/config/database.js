const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/msitumum.db');

class DatabaseWrapper {
  constructor() {
    try {
      this.db = new Database(dbPath);
      console.log('Connected to SQLite database');
    } catch (err) {
      console.error('Database connection error:', err.message);
    }
  }

  query(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  }

  run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      return { id: result.lastInsertRowid, changes: result.changes };
    } catch (err) {
      console.error('Run error:', err);
      throw err;
    }
  }

  get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(...params);
    } catch (err) {
      console.error('Get error:', err);
      throw err;
    }
  }

  close() {
    this.db.close();
  }
}

module.exports = new DatabaseWrapper();

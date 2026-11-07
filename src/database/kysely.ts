import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {
  Kysely,
  Driver,
  DatabaseConnection,
  CompiledQuery,
  QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  Dialect,
} from 'kysely';
import { Database } from '../types';
import { INITIAL_SCHEMA_SQL } from './schema';

const STORAGE_KEY = 'sort_a_lazy_cronos_sqlite_db';

let rawDb: SqlJsDatabase | null = null;
let kyselyInstance: Kysely<Database> | null = null;
let dbInitPromise: Promise<Kysely<Database>> | null = null;

// Salva o banco SQLite em IndexedDB de forma assíncrona
export async function persistDatabase(): Promise<void> {
  if (!rawDb) return;
  try {
    const binaryArray = rawDb.export();
    await saveToIndexedDB(binaryArray);
  } catch (error) {
    console.error('Erro ao persistir banco SQLite:', error);
  }
}

// Helpers do IndexedDB para armazenamento binário do arquivo .sqlite local
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB não disponível'));
    }
    const req = indexedDB.open('sort_a_lazy_cronos_db', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('sqlite_store');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('sqlite_store', 'readwrite');
      tx.objectStore('sqlite_store').put(data, STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback silencioso caso IndexedDB esteja desativado (ex: modo anônimo)
  }
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction('sqlite_store', 'readonly');
      const req = tx.objectStore('sqlite_store').get(STORAGE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

class SqlJsConnection implements DatabaseConnection {
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this.db = db;
  }

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;
    const isMutation = /^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(sql.trim());

    try {
      if (isMutation) {
        this.db.run(sql, parameters as any[]);

        let insertId: bigint | undefined = undefined;
        let numAffectedRows: bigint | undefined = undefined;

        try {
          const res = this.db.exec("SELECT last_insert_rowid() as id, changes() as changes;");
          if (res.length > 0 && res[0].values.length > 0) {
            insertId = BigInt(res[0].values[0][0] as number);
            numAffectedRows = BigInt(res[0].values[0][1] as number);
          }
        } catch {
          // Ignora erros de last_insert_rowid em comandos DDL
        }

        // Salva após mutação
        persistDatabase().catch(console.error);

        return {
          rows: [],
          numAffectedRows,
          insertId,
        };
      }

      // Consulta de leitura (SELECT)
      const stmt = this.db.prepare(sql);
      stmt.bind(parameters as any[]);

      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();

      return {
        rows: rows as R[],
      };
    } catch (err: any) {
      console.error('Erro executando SQL:', sql, parameters, err);
      throw err;
    }
  }

  async *streamQuery<R>(compiledQuery: CompiledQuery): AsyncIterableIterator<QueryResult<R>> {
    const result = await this.executeQuery<R>(compiledQuery);
    yield result;
  }
}

class SqlJsDriver implements Driver {
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this.db = db;
  }

  async init(): Promise<void> {}
  async acquireConnection(): Promise<DatabaseConnection> {
    return new SqlJsConnection(this.db);
  }
  async beginTransaction(): Promise<void> {
    this.db.run('BEGIN TRANSACTION;');
  }
  async commitTransaction(): Promise<void> {
    this.db.run('COMMIT;');
    await persistDatabase();
  }
  async rollbackTransaction(): Promise<void> {
    this.db.run('ROLLBACK;');
  }
  async releaseConnection(): Promise<void> {}
  async destroy(): Promise<void> {}
}

class SqlJsDialect implements Dialect {
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this.db = db;
  }

  createDriver(): Driver {
    return new SqlJsDriver(this.db);
  }

  createQueryCompiler(): SqliteQueryCompiler {
    return new SqliteQueryCompiler();
  }

  createAdapter(): SqliteAdapter {
    return new SqliteAdapter();
  }

  createIntrospector(db: Kysely<any>): SqliteIntrospector {
    return new SqliteIntrospector(db);
  }
}

// Inicializador singleton do banco SQLite com carregamento seguro
export function getDatabase(): Promise<Kysely<Database>> {
  if (kyselyInstance) {
    return Promise.resolve(kyselyInstance);
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = (async () => {
    try {
      const initFn = typeof initSqlJs === 'function' ? initSqlJs : (initSqlJs as any).default;
      
      const SQL = await initFn({
        locateFile: () => sqlWasmUrl,
      });

      const savedData = await loadFromIndexedDB();
      const db = savedData ? new SQL.Database(savedData) : new SQL.Database();
      rawDb = db;

      // Executa o schema inicial com todas as tabelas
      db.run(INITIAL_SCHEMA_SQL);

      // Inicializa configurações padrão se ainda não existirem
      const settingsCheck = db.exec(
        "SELECT COUNT(*) as count FROM app_settings WHERE key = 'free_time_custom_label';"
      );
      if (!settingsCheck.length || (settingsCheck[0].values[0][0] as number) === 0) {
        db.run(
          "INSERT OR IGNORE INTO app_settings (key, value) VALUES ('free_time_custom_label', 'Tempo Livre');"
        );
        db.run("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('theme', 'dark');");
        db.run("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('weekly_review_day', '0');");
        db.run("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('auto_start_desktop', '0');");
        db.run("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('bank_balance_minutes', '0');");
      }

      await persistDatabase();

      const dialect = new SqlJsDialect(db);
      kyselyInstance = new Kysely<Database>({
        dialect,
      });

      return kyselyInstance;
    } catch (error) {
      console.error('Falha ao inicializar o banco SQLite local:', error);
      dbInitPromise = null;
      throw error;
    }
  })();

  return dbInitPromise;
}

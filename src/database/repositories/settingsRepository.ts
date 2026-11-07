import { getDatabase } from '../kysely';

export const settingsRepository = {
  async get(key: string, defaultValue: string = ''): Promise<string> {
    const db = await getDatabase();
    const row = await db.selectFrom('app_settings')
      .select('value')
      .where('key', '=', key)
      .executeTakeFirst();

    return row ? row.value : defaultValue;
  },

  async set(key: string, value: string): Promise<void> {
    const db = await getDatabase();
    await db.insertInto('app_settings')
      .values({ key, value })
      .onConflict((oc) => oc.column('key').doUpdateSet({ value }))
      .execute();
  },

  async getAll(): Promise<Record<string, string>> {
    const db = await getDatabase();
    const rows = await db.selectFrom('app_settings')
      .selectAll()
      .execute();

    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  },
};

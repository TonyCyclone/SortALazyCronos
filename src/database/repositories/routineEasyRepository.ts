import { getDatabase } from '../kysely';
import { RoutineEasyTable } from '../../types';

export const routineEasyRepository = {
  async getAll(): Promise<RoutineEasyTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('routine_easy_activities')
      .selectAll()
      .orderBy('start_time_planned', 'asc')
      .execute();
  },

  async getActive(): Promise<RoutineEasyTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('routine_easy_activities')
      .selectAll()
      .where('is_active', '=', 1)
      .orderBy('start_time_planned', 'asc')
      .execute();
  },

  async getById(id: string): Promise<RoutineEasyTable | undefined> {
    const db = await getDatabase();
    return await db.selectFrom('routine_easy_activities')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  async create(data: Omit<RoutineEasyTable, 'created_at'> & { created_at?: string }): Promise<RoutineEasyTable> {
    const db = await getDatabase();
    const newRecord: RoutineEasyTable = {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    };

    await db.insertInto('routine_easy_activities')
      .values(newRecord)
      .execute();

    return newRecord;
  },

  async update(id: string, data: Partial<Omit<RoutineEasyTable, 'id'>>): Promise<void> {
    const db = await getDatabase();
    await db.updateTable('routine_easy_activities')
      .set(data)
      .where('id', '=', id)
      .execute();
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.deleteFrom('routine_easy_activities')
      .where('id', '=', id)
      .execute();
  },
};

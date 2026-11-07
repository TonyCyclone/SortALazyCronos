import { getDatabase } from '../kysely';
import { RoutineFlexibleTable } from '../../types';

export const routineFlexibleRepository = {
  async getAll(): Promise<RoutineFlexibleTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('routine_flexible_activities')
      .selectAll()
      .orderBy('name', 'asc')
      .execute();
  },

  async getActive(): Promise<RoutineFlexibleTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('routine_flexible_activities')
      .selectAll()
      .where('is_active', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  },

  async getById(id: string): Promise<RoutineFlexibleTable | undefined> {
    const db = await getDatabase();
    return await db.selectFrom('routine_flexible_activities')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  async create(data: Omit<RoutineFlexibleTable, 'created_at'> & { created_at?: string }): Promise<RoutineFlexibleTable> {
    const db = await getDatabase();
    const newRecord: RoutineFlexibleTable = {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    };

    await db.insertInto('routine_flexible_activities')
      .values(newRecord)
      .execute();

    return newRecord;
  },

  async update(id: string, data: Partial<Omit<RoutineFlexibleTable, 'id'>>): Promise<void> {
    const db = await getDatabase();
    await db.updateTable('routine_flexible_activities')
      .set(data)
      .where('id', '=', id)
      .execute();
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.deleteFrom('routine_flexible_activities')
      .where('id', '=', id)
      .execute();
  },
};

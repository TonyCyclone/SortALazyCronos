import { getDatabase } from '../kysely';
import { NoDeadlineActivityTable } from '../../types';

export const noDeadlineRepository = {
  async getAll(): Promise<NoDeadlineActivityTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('no_deadline_activities')
      .selectAll()
      .orderBy('name', 'asc')
      .execute();
  },

  async getPending(): Promise<NoDeadlineActivityTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('no_deadline_activities')
      .selectAll()
      .where('is_completed', '=', 0)
      .orderBy('name', 'asc')
      .execute();
  },

  async getById(id: string): Promise<NoDeadlineActivityTable | undefined> {
    const db = await getDatabase();
    return await db.selectFrom('no_deadline_activities')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  async create(data: Omit<NoDeadlineActivityTable, 'created_at'> & { created_at?: string }): Promise<NoDeadlineActivityTable> {
    const db = await getDatabase();
    const newRecord: NoDeadlineActivityTable = {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    };

    await db.insertInto('no_deadline_activities')
      .values(newRecord)
      .execute();

    return newRecord;
  },

  async update(id: string, data: Partial<Omit<NoDeadlineActivityTable, 'id'>>): Promise<void> {
    const db = await getDatabase();
    await db.updateTable('no_deadline_activities')
      .set(data)
      .where('id', '=', id)
      .execute();
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.deleteFrom('no_deadline_activities')
      .where('id', '=', id)
      .execute();
  },
};

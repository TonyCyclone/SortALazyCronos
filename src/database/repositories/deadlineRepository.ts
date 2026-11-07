import { getDatabase } from '../kysely';
import { DeadlineActivityTable } from '../../types';

export const deadlineRepository = {
  async getAll(): Promise<DeadlineActivityTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('deadline_activities')
      .selectAll()
      .orderBy('deadline_date', 'asc')
      .execute();
  },

  async getPending(): Promise<DeadlineActivityTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('deadline_activities')
      .selectAll()
      .where('is_completed', '=', 0)
      .orderBy('deadline_date', 'asc')
      .execute();
  },

  async getById(id: string): Promise<DeadlineActivityTable | undefined> {
    const db = await getDatabase();
    return await db.selectFrom('deadline_activities')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  },

  async create(data: Omit<DeadlineActivityTable, 'created_at'> & { created_at?: string }): Promise<DeadlineActivityTable> {
    const db = await getDatabase();
    const newRecord: DeadlineActivityTable = {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
    };

    await db.insertInto('deadline_activities')
      .values(newRecord)
      .execute();

    return newRecord;
  },

  async update(id: string, data: Partial<Omit<DeadlineActivityTable, 'id'>>): Promise<void> {
    const db = await getDatabase();
    await db.updateTable('deadline_activities')
      .set(data)
      .where('id', '=', id)
      .execute();
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.deleteFrom('deadline_activities')
      .where('id', '=', id)
      .execute();
  },
};

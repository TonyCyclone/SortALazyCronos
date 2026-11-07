import { getDatabase } from '../kysely';
import { DaysScheduleTable, ScheduledBlocksTable } from '../../types';

export const scheduleRepository = {
  async getDay(date: string): Promise<DaysScheduleTable | undefined> {
    const db = await getDatabase();
    return await db.selectFrom('days_schedule')
      .selectAll()
      .where('date', '=', date)
      .executeTakeFirst();
  },

  async ensureDay(date: string): Promise<DaysScheduleTable> {
    const db = await getDatabase();
    let day = await this.getDay(date);
    if (!day) {
      day = {
        date,
        is_locked: 0,
        locked_at: null,
        review_status: 'pending',
      };
      await db.insertInto('days_schedule')
        .values(day)
        .execute();
    }
    return day;
  },

  async getDaysRange(startDate: string, endDate: string): Promise<DaysScheduleTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('days_schedule')
      .selectAll()
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .execute();
  },

  async setDayLock(date: string, isLocked: boolean): Promise<void> {
    const db = await getDatabase();
    await this.ensureDay(date);
    await db.updateTable('days_schedule')
      .set({
        is_locked: isLocked ? 1 : 0,
        locked_at: isLocked ? new Date().toISOString() : null,
      })
      .where('date', '=', date)
      .execute();
  },

  async getBlocksForDate(date: string): Promise<ScheduledBlocksTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('scheduled_blocks')
      .selectAll()
      .where('date', '=', date)
      .orderBy('start_time', 'asc')
      .execute();
  },

  async getBlocksForRange(startDate: string, endDate: string): Promise<ScheduledBlocksTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('scheduled_blocks')
      .selectAll()
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .orderBy('start_time', 'asc')
      .execute();
  },

  async createBlock(block: Omit<ScheduledBlocksTable, 'created_at' | 'id'> & { id?: string; created_at?: string }): Promise<ScheduledBlocksTable> {
    const db = await getDatabase();
    await this.ensureDay(block.date);
    const newBlock: ScheduledBlocksTable = {
      ...block,
      id: block.id || crypto.randomUUID(),
      created_at: block.created_at || new Date().toISOString(),
    };

    await db.insertInto('scheduled_blocks')
      .values(newBlock)
      .execute();

    return newBlock;
  },

  async updateBlock(id: string, data: Partial<Omit<ScheduledBlocksTable, 'id'>>): Promise<void> {
    const db = await getDatabase();
    await db.updateTable('scheduled_blocks')
      .set(data)
      .where('id', '=', id)
      .execute();
  },

  async deleteBlock(id: string): Promise<void> {
    const db = await getDatabase();
    await db.deleteFrom('scheduled_blocks')
      .where('id', '=', id)
      .execute();
  },

  async deleteBlocksForDate(date: string): Promise<void> {
    const db = await getDatabase();
    await db.deleteFrom('scheduled_blocks')
      .where('date', '=', date)
      .execute();
  },
};

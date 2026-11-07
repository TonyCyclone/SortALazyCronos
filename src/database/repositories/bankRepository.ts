import { getDatabase } from '../kysely';
import { FreeHoursBankLedgerTable } from '../../types';

export const bankRepository = {
  async getBalance(): Promise<number> {
    const db = await getDatabase();
    const setting = await db.selectFrom('app_settings')
      .select('value')
      .where('key', '=', 'bank_balance_minutes')
      .executeTakeFirst();

    return setting ? parseInt(setting.value, 10) || 0 : 0;
  },

  async addEntry(
    changeMinutes: number,
    reason: string,
    relatedBlockId?: string | null
  ): Promise<{ newBalance: number; entry: FreeHoursBankLedgerTable }> {
    const db = await getDatabase();
    const currentBalance = await this.getBalance();
    const newBalance = currentBalance + changeMinutes;

    const entry: FreeHoursBankLedgerTable = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      change_minutes: changeMinutes,
      balance_after_minutes: newBalance,
      reason,
      related_block_id: relatedBlockId || null,
    };

    await db.insertInto('free_hours_bank_ledger')
      .values(entry)
      .execute();

    await db.insertInto('app_settings')
      .values({ key: 'bank_balance_minutes', value: newBalance.toString() })
      .onConflict((oc) => oc.column('key').doUpdateSet({ value: newBalance.toString() }))
      .execute();

    return { newBalance, entry };
  },

  async getLedger(limit: number = 50): Promise<FreeHoursBankLedgerTable[]> {
    const db = await getDatabase();
    return await db.selectFrom('free_hours_bank_ledger')
      .selectAll()
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .execute();
  },
};

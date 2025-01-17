import { DataSource, QueryRunner } from 'typeorm';

export class TransactionManager {
  private queryRunner: QueryRunner;

  constructor(private dataSource: DataSource) {}

  async startTransaction() {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commit() {
    await this.queryRunner.commitTransaction();
  }

  async rollback() {
    await this.queryRunner.rollbackTransaction();
  }

  async release() {
    await this.queryRunner.release();
  }

  get manager() {
    return this.queryRunner.manager;
  }


  
  async runInTransaction(callback: (manager: any) => Promise<any>) {
    try {
      await this.startTransaction();

      const result = await callback(this.manager);

      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      await this.release();
    }
  }
}

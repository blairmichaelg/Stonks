
import { db } from "./db";
import {
  strategies,
  backtests,
  type Strategy,
  type InsertStrategy,
  type Backtest,
  type InsertBacktest,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Strategy methods
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  getStrategies(): Promise<Strategy[]>;
  
  // Backtest methods
  createBacktest(backtest: InsertBacktest): Promise<Backtest>;
  getBacktest(id: number): Promise<Backtest | undefined>;
  getBacktestsByStrategyId(strategyId: number): Promise<Backtest[]>;
  updateBacktest(id: number, updates: Partial<Backtest>): Promise<Backtest>;
}

export class DatabaseStorage implements IStorage {
  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const [newStrategy] = await db.insert(strategies).values(strategy).returning();
    return newStrategy;
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
    return strategy;
  }

  async getStrategies(): Promise<Strategy[]> {
    return await db.select().from(strategies).orderBy(desc(strategies.createdAt));
  }

  async createBacktest(backtest: InsertBacktest): Promise<Backtest> {
    const [newBacktest] = await db.insert(backtests).values(backtest).returning();
    return newBacktest;
  }

  async getBacktest(id: number): Promise<Backtest | undefined> {
    const [backtest] = await db.select().from(backtests).where(eq(backtests.id, id));
    return backtest;
  }

  async getBacktestsByStrategyId(strategyId: number): Promise<Backtest[]> {
    return await db
      .select()
      .from(backtests)
      .where(eq(backtests.strategyId, strategyId))
      .orderBy(desc(backtests.createdAt));
  }

  async updateBacktest(id: number, updates: Partial<Backtest>): Promise<Backtest> {
    const [updatedBacktest] = await db
      .update(backtests)
      .set(updates)
      .where(eq(backtests.id, id))
      .returning();
    return updatedBacktest;
  }
}

export const storage = new DatabaseStorage();


import { db } from "./db";
import {
  strategies,
  backtests,
  aiAgents,
  complianceLogs,
  securityThreats,
  type Strategy,
  type InsertStrategy,
  type Backtest,
  type InsertBacktest,
  type AiAgent,
  type InsertAiAgent,
  type ComplianceLog,
  type InsertComplianceLog,
  type SecurityThreat,
  type InsertSecurityThreat,
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

  // AI Agent methods
  getAiAgents(): Promise<AiAgent[]>;
  createAiAgent(agent: InsertAiAgent): Promise<AiAgent>;

  // Compliance methods
  getComplianceLogs(): Promise<ComplianceLog[]>;
  createComplianceLog(log: InsertComplianceLog): Promise<ComplianceLog>;

  // Security methods
  getSecurityThreats(): Promise<SecurityThreat[]>;
  createSecurityThreat(threat: InsertSecurityThreat): Promise<SecurityThreat>;
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

  async getAiAgents(): Promise<AiAgent[]> {
    return await db.select().from(aiAgents).orderBy(desc(aiAgents.createdAt));
  }

  async createAiAgent(agent: InsertAiAgent): Promise<AiAgent> {
    const [newAgent] = await db.insert(aiAgents).values(agent).returning();
    return newAgent;
  }

  async getComplianceLogs(): Promise<ComplianceLog[]> {
    return await db.select().from(complianceLogs).orderBy(desc(complianceLogs.timestamp));
  }

  async createComplianceLog(log: InsertComplianceLog): Promise<ComplianceLog> {
    const [newLog] = await db.insert(complianceLogs).values(log).returning();
    return newLog;
  }

  async getSecurityThreats(): Promise<SecurityThreat[]> {
    return await db.select().from(securityThreats).orderBy(desc(securityThreats.detectedAt));
  }

  async createSecurityThreat(threat: InsertSecurityThreat): Promise<SecurityThreat> {
    const [newThreat] = await db.insert(securityThreats).values(threat).returning();
    return newThreat;
  }
}

export const storage = new DatabaseStorage();

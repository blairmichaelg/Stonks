
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  nlpInput: text("nlp_input").notNull(), // The natural language query
  parsedJson: jsonb("parsed_json").notNull(), // The AI-parsed logic
  assetType: text("asset_type").notNull(), // 'stock' | 'crypto' | 'option'
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(), // 'daily' | 'weekly' | 'hourly'
  initialCapital: doublePrecision("initial_capital").default(10000).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'risk', 'execution', 'compliance'
  status: text("status").notNull(), // 'active', 'idle', 'warning'
  riskScore: integer("risk_score").notNull().default(0),
  lastAction: text("last_action"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceLogs = pgTable("compliance_logs", {
  id: serial("id").primaryKey(),
  regulation: text("regulation").notNull(), // 'DORA', 'MiCA', 'GDPR'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

export const securityThreats = pgTable("security_threats", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'phishing', 'deepfake', 'lateral_movement'
  source: text("source").notNull(),
  status: text("status").notNull(), // 'blocked', 'investigating', 'remediated'
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const backtests = pgTable("backtests", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => strategies.id).notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'running' | 'complete' | 'error'
  metrics: jsonb("metrics"), // { returns, sharpe, maxDrawdown, winRate, etc. }
  equityCurve: jsonb("equity_curve"), // Array of { date, equity }
  trades: jsonb("trades"), // Array of executed trades
  error: text("error"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertStrategySchema = createInsertSchema(strategies).omit({ 
  id: true, 
  createdAt: true 
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({ 
  id: true, 
  createdAt: true 
});

export const insertComplianceLogSchema = createInsertSchema(complianceLogs).omit({ 
  id: true, 
  timestamp: true 
});

export const insertSecurityThreatSchema = createInsertSchema(securityThreats).omit({ 
  id: true, 
  detectedAt: true 
});

export const insertBacktestSchema = createInsertSchema(backtests).omit({ 
  id: true, 
  createdAt: true,
  completedAt: true 
});

// === TYPES ===

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;

export type ComplianceLog = typeof complianceLogs.$inferSelect;
export type InsertComplianceLog = z.infer<typeof insertComplianceLogSchema>;

export type SecurityThreat = typeof securityThreats.$inferSelect;
export type InsertSecurityThreat = z.infer<typeof insertSecurityThreatSchema>;

export type Backtest = typeof backtests.$inferSelect;
export type InsertBacktest = z.infer<typeof insertBacktestSchema>;

// Request types
export type CreateStrategyRequest = InsertStrategy;
export type RunBacktestRequest = { strategyId: number };

// AI Parsing types (used in route contract)
export const parseStrategyRequestSchema = z.object({
  prompt: z.string(),
});

export const parseStrategyResponseSchema = z.object({
  entry: z.object({
    indicators: z.array(z.any()),
    logic: z.string(),
  }),
  exit: z.object({
    conditions: z.array(z.any()),
    logic: z.string(),
  }),
  timeframe: z.string(),
  riskLevel: z.string(),
});

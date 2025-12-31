
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

export const insertBacktestSchema = createInsertSchema(backtests).omit({ 
  id: true, 
  createdAt: true,
  completedAt: true 
});

// === TYPES ===

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

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

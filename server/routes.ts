
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { aiService } from "./services/ai";
import { backtestEngine } from "./services/backtest";
import { insertAiAgentSchema, insertComplianceLogSchema, insertSecurityThreatSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Strategy Routes ===

  app.get(api.strategies.list.path, async (req, res) => {
    const strategies = await storage.getStrategies();
    res.json(strategies);
  });

  app.get(api.strategies.get.path, async (req, res) => {
    const strategy = await storage.getStrategy(Number(req.params.id));
    if (!strategy) {
      return res.status(404).json({ message: "Strategy not found" });
    }
    res.json(strategy);
  });

  app.post(api.strategies.create.path, async (req, res) => {
    try {
      console.log("POST /api/strategies - Body:", req.body);
      
      // Auto-parse NLP input if parsedJson is missing
      let parsedJson = req.body.parsedJson;
      if (!parsedJson && req.body.nlpInput) {
        console.log("NLP input detected, parsing strategy via AI service...");
        try {
          parsedJson = await aiService.parseStrategy(req.body.nlpInput);
          console.log("AI Parsed Result:", JSON.stringify(parsedJson));
        } catch (aiErr) {
          console.error("AI Service Error:", aiErr);
          parsedJson = { 
            entry: { indicators: [{ type: "RSI", condition: "<", value: 35 }], logic: "AND" }, 
            exit: { conditions: [{ type: "Profit", value: 0.10 }, { type: "Loss", value: 0.05 }], logic: "OR" },
            timeframe: "daily",
            riskLevel: "medium"
          };
        }
      }

      const strategy = await storage.createStrategy({
        name: req.body.name || "Unnamed Strategy",
        description: req.body.description || "",
        nlpInput: req.body.nlpInput || "",
        symbol: req.body.symbol || "SPY",
        assetType: req.body.assetType || "stock",
        timeframe: req.body.timeframe || "daily",
        initialCapital: Number(req.body.initialCapital) || 10000,
        parsedJson: parsedJson || { entry: { indicators: [], logic: "AND" }, exit: { conditions: [], logic: "OR" } },
      });
      
      console.log("Strategy created successfully with ID:", strategy.id);
      res.status(201).json(strategy);
    } catch (err) {
      console.error("Strategy creation error:", err);
      res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
  });

  app.post(api.strategies.parse.path, async (req, res) => {
    try {
      const { prompt } = api.strategies.parse.input.parse(req.body);
      
      // Use the real AI service
      const parsedStrategy = await aiService.parseStrategy(prompt);
      
      res.json(parsedStrategy);
    } catch (err) {
      console.error("AI Parse error:", err);
      res.status(500).json({ message: "Failed to parse strategy. Please check API keys." });
    }
  });

  // === Backtest Routes ===

  app.post(api.backtests.run.path, async (req, res) => {
    try {
      const { strategyId } = api.backtests.run.input.parse(req.body);
      const strategy = await storage.getStrategy(strategyId);
      
      if (!strategy) {
        return res.status(404).json({ message: "Strategy not found" });
      }

      // Create a pending backtest
      const backtest = await storage.createBacktest({
        strategyId,
        status: "running",
        metrics: {},
        equityCurve: [],
        trades: []
      });

      // Run backtest asynchronously
      // In a real app, this should be a job queue.
      // We run it here but don't await the result to return response quickly.
      runBacktestAsync(backtest.id, strategy);

      res.status(201).json(backtest);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.backtests.get.path, async (req, res) => {
    const backtest = await storage.getBacktest(Number(req.params.id));
    if (!backtest) {
      return res.status(404).json({ message: "Backtest not found" });
    }
    res.json(backtest);
  });

  app.get(api.backtests.listByStrategy.path, async (req, res) => {
    const backtests = await storage.getBacktestsByStrategyId(Number(req.params.strategyId));
    res.json(backtests);
  });

  // === Institutional Ecosystem Routes ===
  app.get("/api/ai-agents", async (_req, res) => {
    const agents = await storage.getAiAgents();
    res.json(agents);
  });

  app.post("/api/ai-agents", async (req, res) => {
    const parsed = insertAiAgentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const agent = await storage.createAiAgent(parsed.data);
    res.json(agent);
  });

  app.get("/api/compliance-logs", async (_req, res) => {
    const logs = await storage.getComplianceLogs();
    res.json(logs);
  });

  app.post("/api/compliance-logs", async (req, res) => {
    const parsed = insertComplianceLogSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const log = await storage.createComplianceLog(parsed.data);
    res.json(log);
  });

  app.get("/api/security-threats", async (_req, res) => {
    const threats = await storage.getSecurityThreats();
    res.json(threats);
  });

  app.post("/api/security-threats", async (req, res) => {
    const parsed = insertSecurityThreatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const threat = await storage.createSecurityThreat(parsed.data);
    res.json(threat);
  });

  return httpServer;
}

// Async wrapper for the backtest engine
async function runBacktestAsync(backtestId: number, strategy: any) {
  try {
    const results = await backtestEngine.run(strategy);
    
    await storage.updateBacktest(backtestId, {
      ...results,
      status: "complete"
    });
  } catch (error: any) {
    console.error("Backtest failed:", error);
    await storage.updateBacktest(backtestId, {
      status: "error",
      error: error.message || "Unknown error"
    });
  }
}

// Seed data function (Updated to match new flow)
export async function seedDatabase() {
  console.log("Seeding database...");
  const existing = await storage.getStrategies();
  if (existing.length === 0) {
    await storage.createStrategy({
      name: "RSI Momentum Strategy",
      description: "Classic mean reversion strategy with profit targets and stop losses",
      nlpInput: "Buy when RSI < 35, Sell at 10% profit or 5% loss",
      parsedJson: {
        entry: { indicators: [{ type: "RSI", condition: "<", value: 35 }], logic: "AND" },
        exit: { conditions: [{ type: "Profit", value: 0.10 }, { type: "Loss", value: 0.05 }], logic: "OR" },
        timeframe: "daily",
        riskLevel: "medium"
      },
      assetType: "stock",
      symbol: "SPY",
      timeframe: "daily",
      initialCapital: 10000
    });
  }

  const existingAgents = await storage.getAiAgents();
  if (existingAgents.length === 0) {
    await storage.createAiAgent({
      name: "Risk Guardian",
      type: "risk",
      status: "active",
      riskScore: 12,
      lastAction: "Adjusted max drawdown limits for volatility spike",
      metadata: {}
    });
    await storage.createAiAgent({
      name: "Execution Mesh Node",
      type: "execution",
      status: "active",
      riskScore: 5,
      lastAction: "RDMA tunnel established to NYSE colocation",
      metadata: {}
    });
  }

  const existingCompliance = await storage.getComplianceLogs();
  if (existingCompliance.length === 0) {
    await storage.createComplianceLog({
      regulation: "DORA",
      severity: "low",
      message: "Continuous resilience testing completed for Q1",
      metadata: {}
    });
    await storage.createComplianceLog({
      regulation: "MiCA",
      severity: "medium",
      message: "Stablecoin reserve attestation verified on-chain",
      metadata: {}
    });
  }

  const existingThreats = await storage.getSecurityThreats();
  if (existingThreats.length === 0) {
    await storage.createSecurityThreat({
      type: "Lateral Movement Attempt",
      source: "Suspicious API Node (IP: 192.168.1.45)",
      status: "blocked"
    });
  }
  console.log("Institutional Seed data created.");
}

// Call seedDatabase on startup
seedDatabase().catch(console.error);

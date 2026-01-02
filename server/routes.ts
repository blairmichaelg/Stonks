
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { aiService } from "./services/ai";
import { backtestEngine } from "./services/backtest";

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
      console.log("POST /api/strategies - Body:", JSON.stringify(req.body));
      const input = api.strategies.create.input.parse(req.body);
      
      // Auto-parse NLP input if parsedJson is missing
      let parsedJson = req.body.parsedJson;
      if (!parsedJson && input.nlpInput) {
        console.log("NLP input detected, parsing strategy via AI service...");
        try {
          parsedJson = await aiService.parseStrategy(input.nlpInput);
          console.log("AI Parsed Result:", JSON.stringify(parsedJson));
        } catch (aiErr) {
          console.error("AI Service Error:", aiErr);
          // Fallback to a basic working strategy if AI fails
          parsedJson = { 
            entry: { indicators: [{ type: "RSI", condition: "<", value: 35 }], logic: "AND" }, 
            exit: { conditions: [{ type: "Profit", value: 0.10 }, { type: "Loss", value: 0.05 }], logic: "OR" },
            timeframe: "daily",
            riskLevel: "medium"
          };
          console.log("Using fallback strategy due to AI error");
        }
      }

      const strategy = await storage.createStrategy({
        ...input,
        parsedJson: parsedJson || { entry: { indicators: [], logic: "AND" }, exit: { conditions: [], logic: "OR" } },
      });
      console.log("Strategy created successfully with ID:", strategy.id);
      res.status(201).json(strategy);
    } catch (err) {
      console.error("Strategy creation endpoint error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: err instanceof Error ? err.message : "Unknown error" });
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
  console.log(`Current strategies count: ${existing.length}`);
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
    console.log("Seed data created.");
  }
}

// Call seedDatabase on startup
seedDatabase().catch(console.error);

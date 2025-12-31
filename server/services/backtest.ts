
import { Strategy, Backtest, InsertBacktest } from "@shared/schema";
import { marketDataService, OHLCV } from "./marketData";
import { RSI, MACD, SMA } from "technicalindicators";

export class BacktestEngine {
  
  async run(strategy: Strategy): Promise<Partial<Backtest>> {
    const prices = await marketDataService.getHistoricalData(strategy.symbol, strategy.assetType, strategy.timeframe);
    
    if (prices.length === 0) {
      throw new Error("No historical data available");
    }

    const { trades, equityCurve, finalCapital } = this.simulate(prices, strategy);
    
    const totalReturn = ((finalCapital - strategy.initialCapital) / strategy.initialCapital) * 100;
    const wins = trades.filter(t => t.profit > 0);
    const losses = trades.filter(t => t.profit <= 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    
    // Calculate Max Drawdown
    let maxDrawdown = 0;
    let peak = -Infinity;
    for (const point of equityCurve) {
      if (point.equity > peak) peak = point.equity;
      const dd = (peak - point.equity) / peak * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    return {
      status: "complete",
      metrics: {
        totalReturn,
        sharpeRatio: this.calculateSharpeRatio(equityCurve), // Simplified
        maxDrawdown,
        winRate,
        profitFactor: losses.length > 0 ? (wins.reduce((a, b) => a + b.profit, 0) / Math.abs(losses.reduce((a, b) => a + b.profit, 0))) : 999,
        tradesCount: trades.length
      },
      equityCurve,
      trades,
      completedAt: new Date()
    };
  }

  private simulate(prices: OHLCV[], strategy: Strategy) {
    let capital = strategy.initialCapital;
    let position: { entryPrice: number; size: number; entryTime: number } | null = null;
    const trades: any[] = [];
    const equityCurve: any[] = [];

    // Pre-calculate indicators
    const closes = prices.map(p => p.close);
    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const macdValues = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    const sma20 = SMA.calculate({ values: closes, period: 20 });
    const sma50 = SMA.calculate({ values: closes, period: 50 });
    
    // Align indicators
    const rsiOffset = 14;
    const macdOffset = 26;
    const smaOffset = 50;
    const startIdx = Math.max(rsiOffset, macdOffset, smaOffset);

    for (let i = startIdx; i < prices.length; i++) {
      const price = prices[i];
      // Get indicator values for this candle (approximate alignment)
      const rsi = rsiValues[i - 14] || 50; 
      const macd = macdValues[i - 26];
      const smaS = sma20[i - 20];
      const smaL = sma50[i - 50];
      
      // Equity tracking
      const currentEquity = capital + (position ? (price.close - position.entryPrice) * position.size : 0);
      equityCurve.push({ date: new Date(price.time).toISOString(), equity: currentEquity });

      const parsed = strategy.parsedJson as any;
      const entryRules = parsed.entry?.indicators || [];
      const exitRules = parsed.exit?.conditions || [];

      // Check Entry
      if (!position) {
        let shouldBuy = false;
        
        // Evaluate Rules
        // This is a simplified evaluator. A production one would build an expression tree.
        const ruleResults = entryRules.map((r: any) => {
           if (r.type === 'RSI') {
             if (r.condition === '<' && rsi < r.value) return true;
             if (r.condition === '>' && rsi > r.value) return true;
           }
           if (r.type === 'MACD') {
             if (r.condition === 'positive' && macd && macd.histogram && macd.histogram > 0) return true;
             if (r.condition === 'cross_above' && macd && macd.histogram && macd.histogram > 0 && macdValues[i-27] && macdValues[i-27].histogram && macdValues[i-27].histogram <= 0) return true;
           }
           if (r.type === 'SMA') {
             if (r.condition === 'cross_above' && smaS > smaL) return true; // Golden Cross
           }
           return false;
        });

        if (parsed.entry?.logic === 'OR') {
          shouldBuy = ruleResults.some((r: boolean) => r);
        } else {
          // Default AND
          shouldBuy = ruleResults.length > 0 && ruleResults.every((r: boolean) => r);
        }

        if (shouldBuy) {
          // Buy 100% equity
          const size = capital / price.close; // Simplified, no fees
          position = { entryPrice: price.close, size, entryTime: price.time };
          capital -= size * price.close; // Exchange money for asset
        }
      } 
      // Check Exit
      else {
        let shouldSell = false;
        const currentProfitPct = (price.close - position.entryPrice) / position.entryPrice;
        
        // Profit Target / Stop Loss
        const profitRule = exitRules.find((r: any) => r.type === 'Profit');
        if (profitRule && currentProfitPct >= profitRule.value) shouldSell = true;

        const rsiRule = exitRules.find((r: any) => r.type === 'RSI');
        if (rsiRule && rsi > rsiRule.value) shouldSell = true;

        if (shouldSell) {
          const exitValue = position.size * price.close;
          const profit = exitValue - (position.size * position.entryPrice);
          capital += exitValue;
          
          trades.push({
            entryDate: new Date(position.entryTime).toISOString(),
            exitDate: new Date(price.time).toISOString(),
            entryPrice: position.entryPrice,
            exitPrice: price.close,
            profit,
            returnPct: currentProfitPct * 100
          });
          
          position = null;
        }
      }
    }

    if (position) {
      // Close final position
      const finalPrice = prices[prices.length - 1].close;
      capital += position.size * finalPrice;
    }

    return { trades, equityCurve, finalCapital: capital };
  }

  private calculateSharpeRatio(equityCurve: any[]): number {
    if (equityCurve.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      returns.push((equityCurve[i].equity - equityCurve[i-1].equity) / equityCurve[i-1].equity);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    // Annualized Sharpe (assuming daily)
    return stdDev === 0 ? 0 : (mean / stdDev) * Math.sqrt(252);
  }
}

export const backtestEngine = new BacktestEngine();

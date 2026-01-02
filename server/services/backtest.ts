
import { Strategy, Backtest } from "@shared/schema";
import { marketDataService, OHLCV } from "./marketData";
import { RSI, MACD, SMA, ATR, BollingerBands } from "technicalindicators";

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
        sharpeRatio: this.calculateSharpeRatio(equityCurve),
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

    // Realistic modeling
    const commission = 0.001; // 0.1%
    const slippage = 0.0005; // 0.05%

    // Pre-calculate indicators
    const closes = prices.map(p => p.close);
    const highs = prices.map(p => p.high);
    const lows = prices.map(p => p.low);

    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const macdValues = MACD.calculate({ 
      values: closes, 
      fastPeriod: 12, 
      slowPeriod: 26, 
      signalPeriod: 9, 
      SimpleMAOscillator: false, 
      SimpleMASignal: false 
    });
    const sma20 = SMA.calculate({ values: closes, period: 20 });
    const sma50 = SMA.calculate({ values: closes, period: 50 });
    const bbValues = BollingerBands.calculate({ values: closes, period: 20, stdDev: 2 });
    
    // Alignment
    const startIdx = Math.max(14, 26, 50, 20);

    for (let i = startIdx; i < prices.length; i++) {
      const price = prices[i];
      const rsi = rsiValues[i - 14] || 50; 
      const macd = macdValues[i - 26];
      const sS = sma20[i - 20];
      const sL = sma50[i - 50];
      const bb = bbValues[i - 20];
      
      const currentEquity = capital + (position ? (price.close - position.entryPrice) * position.size : 0);
      equityCurve.push({ date: new Date(price.time).toISOString(), equity: currentEquity });

      const parsed = strategy.parsedJson as any;
      const entryRules = (parsed?.entry?.indicators || []).length > 0 ? parsed.entry.indicators : [{ type: 'RSI', condition: '<', value: 35 }];
      const exitRules = (parsed?.exit?.conditions || []).length > 0 ? parsed.exit.conditions : [{ type: 'Profit', value: 0.10 }, { type: 'Loss', value: 0.05 }];

      if (!position) {
        let shouldBuy = false;
        const ruleResults = entryRules.map((r: any) => {
           if (r.type === 'RSI') {
             if (r.condition === '<' && rsi < r.value) return true;
             if (r.condition === '>' && rsi > r.value) return true;
           }
           if (r.type === 'MACD') {
             if (r.condition === 'positive' && macd?.histogram > 0) return true;
             if (r.condition === 'cross_above' && macd?.histogram > 0 && macdValues[i-27]?.histogram <= 0) return true;
           }
           if (r.type === 'SMA') {
             if (r.condition === 'cross_above' && sS > sL && (sma20[i-21] || 0) <= (sma50[i-51] || 0)) return true;
           }
           return false;
        });

        if (parsed.entry?.logic === 'OR') {
          shouldBuy = ruleResults.some((r: boolean) => r);
        } else {
          shouldBuy = ruleResults.length > 0 && ruleResults.every((r: boolean) => r);
        }

        if (shouldBuy) {
          const executionPrice = price.close * (1 + slippage);
          const availableCapital = capital * (1 - commission);
          const size = availableCapital / executionPrice;
          position = { entryPrice: executionPrice, size, entryTime: price.time };
          capital = 0; 
        }
      } else {
        let shouldSell = false;
        const currentProfitPct = (price.close - position.entryPrice) / position.entryPrice;
        
        const exitResults = exitRules.map((r: any) => {
          if (r.type === 'Profit' && currentProfitPct >= r.value) return true;
          if (r.type === 'Loss' && currentProfitPct <= -r.value) return true;
          if (r.type === 'RSI' && rsi > r.value) return true;
          return false;
        });

        if (parsed.exit?.logic === 'OR') {
          shouldSell = exitResults.length > 0 && exitResults.some((r: boolean) => r);
        } else {
          shouldSell = exitResults.length > 0 && exitResults.every((r: boolean) => r);
        }

        if (shouldSell) {
          const executionPrice = price.close * (1 - slippage);
          const exitValue = position.size * executionPrice * (1 - commission);
          const profit = exitValue - (position.size * position.entryPrice);
          capital = exitValue;
          
          trades.push({
            entryDate: new Date(position.entryTime).toISOString(),
            exitDate: new Date(price.time).toISOString(),
            entryPrice: position.entryPrice,
            exitPrice: executionPrice,
            profit,
            returnPct: (profit / (position.size * position.entryPrice)) * 100
          });
          position = null;
        }
      }
    }

    if (position) {
      capital += position.size * prices[prices.length - 1].close * (1 - commission);
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
    return Math.sqrt(variance) === 0 ? 0 : (mean / Math.sqrt(variance)) * Math.sqrt(252);
  }
}

export const backtestEngine = new BacktestEngine();


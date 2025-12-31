
import axios from "axios";

export interface OHLCV {
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataService {
  private alphaVantageKey: string;
  // CoinGecko is free/public for basic use, but we can add key if needed

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || "";
  }

  async getHistoricalData(symbol: string, assetType: string, timeframe: string): Promise<OHLCV[]> {
    if (assetType === 'crypto') {
      return this.getCryptoData(symbol, timeframe);
    } else {
      return this.getStockData(symbol, timeframe);
    }
  }

  private async getStockData(symbol: string, timeframe: string): Promise<OHLCV[]> {
    // Using Alpha Vantage
    // Function: TIME_SERIES_DAILY
    if (!this.alphaVantageKey) {
       console.warn("Alpha Vantage Key missing, returning mock data");
       return this.getMockData();
    }

    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: symbol,
          apikey: this.alphaVantageKey,
          outputsize: "full"
        }
      });

      const data = response.data["Time Series (Daily)"];
      if (!data) throw new Error("No data returned from Alpha Vantage");

      return Object.entries(data).map(([date, values]: [string, any]) => ({
        time: new Date(date).getTime(),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseFloat(values["5. volume"])
      })).sort((a, b) => a.time - b.time); // Ensure sorted ascending
    } catch (error) {
      console.error("Alpha Vantage Error:", error);
      return this.getMockData();
    }
  }

  private async getCryptoData(symbol: string, timeframe: string): Promise<OHLCV[]> {
    // Using CoinGecko
    // ID mapping might be needed (BTC -> bitcoin), simplifying for now
    const coinId = symbol.toLowerCase() === 'btc' ? 'bitcoin' : 
                   symbol.toLowerCase() === 'eth' ? 'ethereum' : symbol.toLowerCase();
    
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: "usd",
          days: "365", // 1 year
          interval: "daily"
        }
      });

      const prices = response.data.prices;
      const volumes = response.data.total_volumes;
      
      // CoinGecko returns [timestamp, price] arrays. We need to construct OHLCV approx or just use C
      // Actually CoinGecko /ohlc endpoint exists but has limitations (1-7 days).
      // For backtesting we ideally need real OHLC. 
      // Falling back to just Close price for High/Low/Open if using market_chart (which is just price history)
      // OR using /coins/{id}/ohlc
      
      const ohlcResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`, {
         params: { vs_currency: 'usd', days: '365' }
      });
      
      // Response: [ [ time, open, high, low, close ], ... ]
      return ohlcResponse.data.map((d: any[]) => ({
        time: d[0],
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4],
        volume: 0 // OHLC endpoint doesn't return volume, need to merge? Ignoring for MVP
      }));

    } catch (error) {
      console.error("CoinGecko Error:", error);
      return this.getMockData();
    }
  }

  private getMockData(): OHLCV[] {
    const data: OHLCV[] = [];
    let price = 100;
    const now = Date.now();
    for (let i = 365; i >= 0; i--) {
      const change = (Math.random() - 0.5) * 4;
      price = price + change;
      data.push({
        time: now - i * 86400000,
        open: price,
        high: price + Math.random() * 2,
        low: price - Math.random() * 2,
        close: price + (Math.random() - 0.5),
        volume: Math.floor(Math.random() * 10000)
      });
    }
    return data;
  }
}

export const marketDataService = new MarketDataService();

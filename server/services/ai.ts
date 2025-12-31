
import axios from "axios";

// Types for the AI response
interface ParsedStrategy {
  entry: {
    indicators: any[];
    logic: string;
  };
  exit: {
    conditions: any[];
    logic: string;
  };
  timeframe: string;
  riskLevel: string;
}

export class AIService {
  private perplexityKey: string;
  private geminiKey: string;

  constructor() {
    this.perplexityKey = process.env.PERPLEXITY_API_KEY || "";
    this.geminiKey = process.env.GEMINI_API_KEY || "";
  }

  async parseStrategy(prompt: string): Promise<ParsedStrategy> {
    try {
      return await this.callPerplexity(prompt);
    } catch (error) {
      console.warn("Perplexity failed, falling back to Gemini", error);
      return await this.callGemini(prompt);
    }
  }

  private async callPerplexity(userPrompt: string): Promise<ParsedStrategy> {
    if (!this.perplexityKey) throw new Error("Perplexity API Key missing");

    const systemPrompt = `
      You are an expert trading strategy parser. 
      Convert the user's natural language trading strategy into a structured JSON format.
      
      Output format must be strictly JSON:
      {
        "entry": { "indicators": [{"type": "RSI", "period": 14, "condition": "<", "value": 30}], "logic": "AND" },
        "exit": { "conditions": [{"type": "Profit", "value": 0.05}], "logic": "OR" },
        "timeframe": "daily",
        "riskLevel": "medium"
      }
      
      Supported indicators: RSI, MACD, SMA, EMA, BollingerBands, Volume.
      Supported logic: AND, OR.
    `;

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro", // Using a strong model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${this.perplexityKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;
    return this.cleanAndParseJSON(content);
  }

  private async callGemini(userPrompt: string): Promise<ParsedStrategy> {
    if (!this.geminiKey) throw new Error("Gemini API Key missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiKey}`;
    
    const systemPrompt = `
      Parse this trading strategy into JSON. 
      Format: { "entry": ..., "exit": ..., "timeframe": ..., "riskLevel": ... }
    `;

    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nStrategy: ${userPrompt}` }]
      }]
    });

    const content = response.data.candidates[0].content.parts[0].text;
    return this.cleanAndParseJSON(content);
  }

  private cleanAndParseJSON(text: string): ParsedStrategy {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  }
}

export const aiService = new AIService();

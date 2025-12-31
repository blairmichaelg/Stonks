
import { z } from 'zod';
import { insertStrategySchema, strategies, backtests } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  strategies: {
    list: {
      method: 'GET' as const,
      path: '/api/strategies',
      responses: {
        200: z.array(z.custom<typeof strategies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/strategies/:id',
      responses: {
        200: z.custom<typeof strategies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/strategies',
      input: insertStrategySchema,
      responses: {
        201: z.custom<typeof strategies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    parse: {
      method: 'POST' as const,
      path: '/api/strategies/parse',
      input: z.object({ prompt: z.string() }),
      responses: {
        200: z.any(), // Returns the JSON structure for the strategy
        500: errorSchemas.internal,
      },
    },
  },
  backtests: {
    run: {
      method: 'POST' as const,
      path: '/api/backtests/run',
      input: z.object({ strategyId: z.number() }),
      responses: {
        201: z.custom<typeof backtests.$inferSelect>(), // Returns the initiated backtest job
        404: errorSchemas.notFound,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/backtests/:id',
      responses: {
        200: z.custom<typeof backtests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    listByStrategy: {
      method: 'GET' as const,
      path: '/api/strategies/:strategyId/backtests',
      responses: {
        200: z.array(z.custom<typeof backtests.$inferSelect>()),
      },
    }
  }
};

// ============================================
// HELPERS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPES
// ============================================
export type StrategyInput = z.infer<typeof api.strategies.create.input>;
export type ParseStrategyInput = z.infer<typeof api.strategies.parse.input>;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type StrategyInput, type ParseStrategyInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/strategies
export function useStrategies() {
  return useQuery({
    queryKey: [api.strategies.list.path],
    queryFn: async () => {
      const res = await fetch(api.strategies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch strategies");
      return api.strategies.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/strategies/:id
export function useStrategy(id: number) {
  return useQuery({
    queryKey: [api.strategies.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.strategies.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch strategy");
      return api.strategies.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/strategies
export function useCreateStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: StrategyInput) => {
      const res = await fetch(api.strategies.create.path, {
        method: api.strategies.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create strategy");
      }
      
      return api.strategies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
      toast({
        title: "Strategy Created",
        description: "Your new trading strategy has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// POST /api/strategies/parse
export function useParseStrategy() {
  return useMutation({
    mutationFn: async (data: ParseStrategyInput) => {
      const res = await fetch(api.strategies.parse.path, {
        method: api.strategies.parse.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to parse strategy logic");
      // Returns generic JSON, so we trust the structure or parse partially if strict typing needed
      return await res.json(); 
    },
  });
}

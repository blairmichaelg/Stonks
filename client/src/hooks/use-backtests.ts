import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// POST /api/backtests/run
export function useRunBacktest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (strategyId: number) => {
      const res = await fetch(api.backtests.run.path, {
        method: api.backtests.run.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to start backtest");
      return api.backtests.run.responses[201].parse(await res.json());
    },
    onSuccess: (_, strategyId) => {
      // Invalidate both the list for this strategy and any general lists
      queryClient.invalidateQueries({ 
        queryKey: [api.backtests.listByStrategy.path.replace(":strategyId", String(strategyId))] 
      });
      toast({
        title: "Backtest Started",
        description: "The simulation is running in the background.",
      });
    },
    onError: (error) => {
      toast({
        title: "Backtest Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// GET /api/strategies/:strategyId/backtests
export function useStrategyBacktests(strategyId: number) {
  return useQuery({
    queryKey: [api.backtests.listByStrategy.path.replace(":strategyId", String(strategyId))],
    queryFn: async () => {
      const url = buildUrl(api.backtests.listByStrategy.path, { strategyId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch backtests");
      return api.backtests.listByStrategy.responses[200].parse(await res.json());
    },
    enabled: !!strategyId,
  });
}

// GET /api/backtests/:id
export function useBacktest(id: number) {
  return useQuery({
    queryKey: [api.backtests.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.backtests.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch backtest details");
      return api.backtests.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    // Poll every 2 seconds if status is running/pending
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'pending' || data.status === 'running')) {
        return 2000;
      }
      return false;
    },
  });
}

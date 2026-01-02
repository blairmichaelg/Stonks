import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Strategy } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Play, Plus, Activity } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: strategies, isLoading } = useQuery<Strategy[]>({ 
    queryKey: ["/api/strategies"] 
  });

  const runBacktestMutation = useMutation({
    mutationFn: async (strategyId: number) => {
      const res = await apiRequest("POST", `/api/strategies/${strategyId}/backtest`);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      queryClient.invalidateQueries({ queryKey: [`/api/strategies/${variables}/backtests`] });
      setLocation(`/strategy/${variables}`);
    }
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Strategy Terminal</h1>
          <p className="text-muted-foreground mt-1">Manage and backtest your strategic trading plans.</p>
        </div>
        <Button onClick={() => setLocation("/builder")} size="lg" data-testid="button-create-strategy">
          <Plus className="mr-2 h-4 w-4" /> New Strategy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies?.map((strategy) => (
          <Card key={strategy.id} className="hover-elevate flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate">{strategy.name}</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{strategy.symbol}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation(`/strategy/${strategy.id}`)}
                  data-testid={`button-view-${strategy.id}`}
                >
                  View Details
                </Button>
                <Button 
                  className="w-full"
                  disabled={runBacktestMutation.isPending}
                  onClick={() => runBacktestMutation.mutate(strategy.id)}
                  data-testid={`button-run-${strategy.id}`}
                >
                  <Play className="mr-2 h-4 w-4" /> Run
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

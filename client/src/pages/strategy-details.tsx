import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Strategy, Backtest } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Shield, Cpu, Activity, Info, AlertCircle, Play, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StrategyDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: strategy, isLoading: loadingStrategy } = useQuery<Strategy>({
    queryKey: [`/api/strategies/${id}`]
  });

  const { data: backtests, isLoading: loadingBacktests } = useQuery<Backtest[]>({
    queryKey: [`/api/strategies/${id}/backtests`]
  });

  const runBacktestMutation = useMutation({
    mutationFn: async (strategyId: number) => {
      const res = await apiRequest("POST", "/api/backtests/run", { strategyId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/strategies/${id}/backtests`] });
      toast({ title: "Audit Triggered", description: "Monte Carlo 2.0 simulation initiated on the Agentic Mesh." });
    }
  });

  if (loadingStrategy || loadingBacktests) return <div className="p-8">Loading...</div>;
  if (!strategy) return <div className="p-8 text-rose-500">Strategy not found</div>;

  const latestBacktest = backtests?.[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="px-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{strategy.name}</h1>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">Active</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{strategy.description || strategy.nlpInput}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-muted-foreground">Symbol</div>
          <div className="text-2xl font-bold text-primary">{strategy.symbol}</div>
          <Button 
            className="mt-2"
            disabled={runBacktestMutation.isPending}
            onClick={() => runBacktestMutation.mutate(Number(id))}
          >
            <Play className="mr-2 h-4 w-4" /> Run Backtest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${Number(latestBacktest?.metrics?.totalReturn || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {latestBacktest ? `${Number(latestBacktest.metrics.totalReturn).toFixed(2)}%` : '---'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {latestBacktest ? `${Number(latestBacktest.metrics.winRate).toFixed(1)}%` : '---'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-500">
                  {latestBacktest ? `-${Number(latestBacktest.metrics.maxDrawdown).toFixed(2)}%` : '---'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Equity Curve
                </CardTitle>
                <Badge variant="secondary">Backtest Results</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[450px] p-0 pt-8">
              {latestBacktest ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={latestBacktest.equityCurve}>
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => new Date(str).toLocaleDateString()}
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorEquity)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-xs">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                    <p className="text-sm text-muted-foreground">No backtest results yet</p>
                    <Button onClick={() => runBacktestMutation.mutate(Number(id))}>Run Backtest</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Strategy Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-lg">Strategy Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Asset Type</span>
                <span className="text-sm font-medium">{strategy.assetType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timeframe</span>
                <span className="text-sm font-medium">{strategy.timeframe}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Initial Capital</span>
                <span className="text-sm font-medium">${strategy.initialCapital.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <Badge>{strategy.parsedJson?.riskLevel || 'Medium'}</Badge>
              </div>
            </CardContent>
          </Card>

          {latestBacktest && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <span className="text-sm font-medium">{Number(latestBacktest.metrics.sharpeRatio || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Trades</span>
                  <span className="text-sm font-medium">{latestBacktest.metrics.totalTrades || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profit Factor</span>
                  <span className="text-sm font-medium">{Number(latestBacktest.metrics.profitFactor || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

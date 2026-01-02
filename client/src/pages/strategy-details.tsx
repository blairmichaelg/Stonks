import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Strategy, Backtest } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StrategyDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: strategy, isLoading: loadingStrategy } = useQuery<Strategy>({
    queryKey: [`/api/strategies/${id}`]
  });

  const { data: backtests, isLoading: loadingBacktests } = useQuery<Backtest[]>({
    queryKey: [`/api/strategies/${id}/backtests`]
  });

  if (loadingStrategy || loadingBacktests) return <div className="p-8">Loading details...</div>;
  if (!strategy) return <div className="p-8">Strategy not found</div>;

  const latestBacktest = backtests?.[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{strategy.name}</h1>
          <p className="text-muted-foreground mt-1">{strategy.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground">Symbol</div>
          <div className="text-2xl font-mono font-bold">{strategy.symbol}</div>
        </div>
      </div>

      {latestBacktest ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${Number(latestBacktest.metrics.totalReturn) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(latestBacktest.metrics.totalReturn).toFixed(2)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(latestBacktest.metrics.winRate).toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sharpe Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(latestBacktest.metrics.sharpeRatio).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">-{Number(latestBacktest.metrics.maxDrawdown).toFixed(2)}%</div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latestBacktest.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString()}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center border-dashed">
          <CardContent className="space-y-4">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="text-lg font-medium">No backtest data available</div>
            <p className="text-muted-foreground">Run a backtest from the dashboard to see results.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

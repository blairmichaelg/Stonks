import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { useStrategy } from "@/hooks/use-strategies";
import { useRunBacktest, useStrategyBacktests, useBacktest } from "@/hooks/use-backtests";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "@/components/MetricsCard";
import { Play, Loader2, ArrowLeft, History } from "lucide-react";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useState } from "react";

// Helper to format currency
const formatMoney = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function StrategyDetails() {
  const params = useParams();
  const id = Number(params.id);
  const [selectedBacktestId, setSelectedBacktestId] = useState<number | null>(null);

  const { data: strategy, isLoading: loadingStrategy } = useStrategy(id);
  const { data: backtests, isLoading: loadingBacktests } = useStrategyBacktests(id);
  const runBacktest = useRunBacktest();
  
  // Use the selected backtest ID, or the most recent one if available
  const activeBacktestId = selectedBacktestId || (backtests && backtests.length > 0 ? backtests[0].id : null);
  
  const { data: activeBacktest } = useBacktest(activeBacktestId || 0);

  const handleRunBacktest = async () => {
    try {
      await runBacktest.mutateAsync(id);
      // Wait a moment for list update then select the new one (optimistic logic could improve this)
      setTimeout(() => setSelectedBacktestId(null), 1000); 
    } catch (e) {
      // Error handled in hook
    }
  };

  if (loadingStrategy || loadingBacktests) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!strategy) return <Layout>Strategy not found</Layout>;

  return (
    <Layout>
      {/* Header */}
      <div className="space-y-4">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">{strategy.name}</h1>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
                {strategy.symbol}
              </Badge>
              <Badge variant="secondary">{strategy.timeframe}</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{strategy.description || strategy.nlpInput}</p>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleRunBacktest} 
            disabled={runBacktest.isPending}
            className="shadow-lg shadow-primary/20"
          >
            {runBacktest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Run Backtest
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Backtest History */}
        <Card className="lg:col-span-1 bg-card border-border h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-4 h-4" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {backtests?.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No backtests run yet.</p>
            )}
            {backtests?.map((bt) => (
              <div
                key={bt.id}
                onClick={() => setSelectedBacktestId(bt.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                  activeBacktestId === bt.id 
                    ? "bg-accent/10 border-primary/50" 
                    : "bg-background/50 border-border"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold uppercase ${
                    bt.status === 'complete' ? 'text-emerald-400' : 
                    bt.status === 'error' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {bt.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(bt.createdAt!).toLocaleDateString()}
                  </span>
                </div>
                {bt.metrics && (
                  <div className="flex justify-between mt-2 text-sm font-mono">
                    <span className="text-muted-foreground">Return</span>
                    <span className={(bt.metrics as any).returns >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {((bt.metrics as any).returns).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content: Results */}
        <div className="lg:col-span-3 space-y-6">
          {activeBacktest ? (
             activeBacktest.status === 'pending' || activeBacktest.status === 'running' ? (
                <Card className="min-h-[400px] flex items-center justify-center border-dashed">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <h3 className="text-xl font-semibold">Simulation in progress...</h3>
                    <p className="text-muted-foreground">Processing historical data for {strategy.symbol}</p>
                  </div>
                </Card>
             ) : activeBacktest.status === 'error' ? (
                <Card className="min-h-[200px] border-destructive/50 bg-destructive/5">
                  <CardContent className="pt-6">
                    <h3 className="text-destructive font-bold mb-2">Simulation Failed</h3>
                    <p className="text-destructive-foreground">{activeBacktest.error}</p>
                  </CardContent>
                </Card>
             ) : (
               <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricsCard 
                    label="Total Return" 
                    value={`${(activeBacktest.metrics as any).returns.toFixed(2)}%`}
                    trend={(activeBacktest.metrics as any).returns}
                  />
                  <MetricsCard 
                    label="Sharpe Ratio" 
                    value={(activeBacktest.metrics as any).sharpe.toFixed(2)} 
                  />
                  <MetricsCard 
                    label="Max Drawdown" 
                    value={`${(activeBacktest.metrics as any).maxDrawdown.toFixed(2)}%`}
                    className="border-rose-500/20"
                  />
                   <MetricsCard 
                    label="Win Rate" 
                    value={`${(activeBacktest.metrics as any).winRate.toFixed(1)}%`}
                  />
                </div>

                {/* Chart */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeBacktest.equityCurve as any[]}>
                        <defs>
                          <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={12}
                          tickFormatter={(str) => new Date(str).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12}
                          tickFormatter={(val) => `$${val.toLocaleString()}`}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                          formatter={(val: number) => [formatMoney(val), "Equity"]}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="equity" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorEquity)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Trade List */}
                <Card className="bg-card border-border">
                   <CardHeader>
                    <CardTitle>Trade Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                          <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3 text-right">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeBacktest.trades as any[])?.slice(0, 10).map((trade, i) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                              <td className="px-6 py-4 font-mono">
                                {new Date(trade.date).toLocaleDateString()}
                              </td>
                              <td className={`px-6 py-4 font-bold ${trade.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {trade.type.toUpperCase()}
                              </td>
                              <td className="px-6 py-4 font-mono">
                                {formatMoney(trade.price)}
                              </td>
                              <td className={`px-6 py-4 text-right font-mono ${
                                trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-rose-400' : ''
                              }`}>
                                {trade.pnl ? formatMoney(trade.pnl) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(activeBacktest.trades as any[])?.length === 0 && (
                         <div className="p-4 text-center text-muted-foreground">No trades executed</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
               </>
             )
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a previous backtest or run a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

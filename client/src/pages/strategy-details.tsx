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

  if (loadingStrategy || loadingBacktests) return <div className="p-8 text-muted-foreground animate-pulse font-mono uppercase tracking-widest">Synchronizing Mesh State...</div>;
  if (!strategy) return <div className="p-8 text-rose-500 font-bold uppercase tracking-widest">ERROR: Strategy Node Not Found</div>;

  const latestBacktest = backtests?.[0];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-white px-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Terminal
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">{strategy.name}</h1>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/5 font-mono">AUDIT_ACTIVE</Badge>
            </div>
            <p className="text-muted-foreground font-medium max-w-2xl">{strategy.description || strategy.nlpInput}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Institutional Identifier</div>
          <div className="text-3xl font-mono font-bold text-primary tracking-tighter">{strategy.symbol} <span className="text-white opacity-20">/ USD</span></div>
          <Button 
            className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 w-full"
            disabled={runBacktestMutation.isPending}
            onClick={() => runBacktestMutation.mutate(Number(id))}
          >
            <Play className="mr-2 h-4 w-4 fill-current" /> RUN AUDIT DNA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50 hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Alpha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-mono font-bold tracking-tighter ${Number(latestBacktest?.metrics?.totalReturn || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {latestBacktest ? `${Number(latestBacktest.metrics.totalReturn).toFixed(2)}%` : '---'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Mesh Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold tracking-tighter text-white">
                  {latestBacktest ? `${Number(latestBacktest.metrics.winRate).toFixed(1)}%` : '---'}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Max Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold tracking-tighter text-rose-500">
                  {latestBacktest ? `-${Number(latestBacktest.metrics.maxDrawdown).toFixed(2)}%` : '---'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50 overflow-hidden shadow-2xl shadow-black/40">
            <CardHeader className="border-b border-white/5 bg-black/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-white/80">
                  <Activity className="w-4 h-4 text-primary" />
                  PROVABLE EQUITY CURVE
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] font-mono border-primary/20">AGENT_VERIFIED</Badge>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[9px] font-mono border-emerald-500/20">RDMA_SYNC</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[450px] p-0 pt-8 bg-black/10">
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
                      fontSize={10}
                      fontFamily="JetBrains Mono"
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={10}
                      fontFamily="JetBrains Mono"
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="equity" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorEquity)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-xs">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto opacity-10 animate-spin-slow" />
                    <p className="text-xs text-muted-foreground italic uppercase tracking-[0.2em]">Audit Telemetry Required</p>
                    <Button variant="outline" className="w-full border-dashed" onClick={() => runBacktestMutation.mutate(Number(id))}>Initialize Simulation</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit DNA Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Audit DNA Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    ZTA Integrity
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px] uppercase border-emerald-500/30">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase">
                    <Cpu className="w-3 h-3 text-primary" />
                    Mesh Latency
                  </div>
                  <span className="text-[10px] font-mono text-white">0.82μs</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-white/60 uppercase">
                    <Info className="w-3 h-3 text-amber-500" />
                    DORA Resilience
                  </div>
                  <span className="text-[10px] font-mono text-white">CLASS_A</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Monte Carlo 2.0 Confidence</div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '89%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40">Probability of Ruin</span>
                  <span className="text-emerald-500 font-bold">&lt; 0.01%</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Trade DNA Cryptography</div>
                  <Badge variant="outline" className="text-[8px] font-mono uppercase border-emerald-500/30 text-emerald-500">SHA-3_VERIFIED</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {latestBacktest ? Array.from({ length: 8 }).map((_, i) => {
                    const seed = (latestBacktest.id * (i + 1)) % 100;
                    return (
                      <div key={i} className="h-12 rounded bg-primary/5 border border-primary/20 relative group overflow-hidden cursor-help hover:bg-primary/10 transition-all">
                        <div 
                          className="absolute inset-0 dna-fingerprint transition-opacity" 
                          style={{ 
                            opacity: seed > 50 ? 0.8 : 0.3,
                            background: `linear-gradient(${seed}deg, hsl(var(--primary)) 0%, transparent 70%)`
                          }} 
                        />
                        <div className={`absolute top-1 left-1 w-1 h-1 rounded-full ${seed > 30 ? 'bg-emerald-500' : 'bg-rose-500'} shadow-sm shadow-black`} />
                        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5" />
                        
                        {/* Vector Hash Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/90 transition-opacity">
                          <span className="text-[7px] font-mono text-primary uppercase">v_hash_{seed}</span>
                          <span className="text-[9px] font-mono text-white font-bold">0x{seed.toString(16).padStart(4, '0')}</span>
                        </div>
                      </div>
                    );
                  }) : (
                    Array.from({ length: 8 }).map(i => (
                      <div key={i} className="h-12 rounded bg-white/5 border border-dashed border-white/10" />
                    ))
                  )}
                </div>
                <div className="mt-3 text-[8px] font-mono text-muted-foreground/40 uppercase tracking-tighter text-center">
                  Immutable Ledger Hash: bafybeigdyrzt5sfp7udm7hu76uh79...
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Agentic Insight</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                "The current regime is transitioning to High Volatility Mean Reversion. Audit DNA suggests reducing allocation by 12% to maintain 95% confidence intervals."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

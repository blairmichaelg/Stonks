import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Strategy, AiAgent, ComplianceLog, SecurityThreat } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Play, Plus, Activity, TrendingUp, Shield, Cpu, AlertTriangle, CheckCircle2, Search, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: strategies, isLoading: loadingStrategies } = useQuery<Strategy[]>({ 
    queryKey: ["/api/strategies"] 
  });

  const { data: agents } = useQuery<AiAgent[]>({
    queryKey: ["/api/ai-agents"]
  });

  const { data: compliance } = useQuery<ComplianceLog[]>({
    queryKey: ["/api/compliance-logs"]
  });

  const { data: threats } = useQuery<SecurityThreat[]>({
    queryKey: ["/api/security-threats"]
  });

  const runBacktestMutation = useMutation({
    mutationFn: async (strategyId: number) => {
      const res = await apiRequest("POST", "/api/backtests/run", { strategyId });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      setLocation(`/strategy/${variables}`);
    }
  });

  if (loadingStrategies) return <div className="p-8">Loading Terminal Infrastructure...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Institutional Terminal</h1>
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 animate-pulse">
              Quantum-Ready
            </Badge>
          </div>
          <p className="text-muted-foreground">Engineering the 2026 Autonomous Infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {agents?.map((agent) => (
              <div 
                key={agent.id}
                className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center ${
                  agent.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`${agent.name}: ${agent.status}`}
              >
                <Cpu className="w-4 h-4 text-white" />
              </div>
            ))}
          </div>
          <Button onClick={() => setLocation("/builder")} size="default" className="hover-elevate">
            <Plus className="mr-2 h-4 w-4" /> New Strategy
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Quantum-Safe Order Routing */}
        <Card className="col-span-12 lg:col-span-12 bg-card/50 border-border/50 shadow-2xl shadow-black/40 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-black/20 border-b border-white/5">
            <div>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary animate-spin-slow" />
                Quantum-Safe Order Routing Nexus
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground/50 font-mono mt-1 uppercase tracking-widest">LATTICE_KEM_V8 // SYNC_STATUS: ATOMIC_CLOCK_LOCKED</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">Routing Latency</span>
                <span className="text-xs font-mono font-bold text-emerald-500 tracking-tighter">0.12μs P99</span>
              </div>
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/5 uppercase tracking-tighter">QS_ENCRYPTED</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-24 w-full bg-black/40 relative flex items-center px-8 gap-8 overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 4s infinite linear' }} />
              
              <div className="flex-1 flex justify-around items-center relative">
                {['NYSE_DRK', 'IEX_CLOUD', 'COINBASE_PRO', 'BINANCE_US'].map((node, i) => (
                  <div key={node} className="flex flex-col items-center gap-2 group cursor-pointer relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all shadow-lg group-hover:shadow-primary/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-mono text-white/40 group-hover:text-white transition-colors">{node}</span>
                    {i < 3 && <div className="absolute left-[100%] top-5 w-[calc(25vw-80px)] h-[1px] bg-gradient-to-r from-emerald-500/50 to-primary/50 opacity-20" />}
                  </div>
                ))}
              </div>

              <div className="w-48 border-l border-white/5 px-6 flex flex-col justify-center">
                <div className="text-[8px] font-mono text-muted-foreground uppercase mb-1">Active Tunnels</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Microstructure Heatmap */}
        <Card className="col-span-12 lg:col-span-8 bg-card/50 border-border/50 shadow-2xl shadow-black/40 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-black/20 border-b border-white/5">
            <div>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Cross-Asset Liquidity Nexus
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground/50 font-mono mt-1 uppercase tracking-widest">Aggregate_Depth_V5 // Markets: [STOCKS, CRYPTO]</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5 uppercase tracking-tighter shadow-sm shadow-emerald-500/10">LIVE_DATA</Badge>
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/5 uppercase tracking-tighter shadow-sm shadow-primary/10">0.8μs_SYNC</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-black/10">
            <div className="grid grid-cols-12 gap-1 h-[240px]">
              {Array.from({ length: 60 }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-[1px] relative overflow-hidden transition-all duration-700 hover:scale-125 hover:z-10 cursor-help border border-white/5 shadow-inner"
                  style={{ 
                    backgroundColor: i < 30 ? (i % 7 === 0 ? 'hsl(var(--primary) / 0.9)' : i % 5 === 0 ? 'hsl(var(--primary) / 0.5)' : 'transparent') : 
                                   (i % 6 === 0 ? 'hsl(142 71% 45% / 0.6)' : i % 4 === 0 ? 'hsl(142 71% 45% / 0.3)' : 'transparent'),
                    animationDelay: `${i * 50}ms`
                  }}
                >
                  <div className="absolute inset-0 dna-fingerprint opacity-30 animate-pulse" />
                  {i % 12 === 0 && <div className={`absolute top-1 left-1 w-1 h-1 rounded-full ${i < 30 ? 'bg-primary' : 'bg-emerald-500'} animate-ping`} />}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 px-1">
              <div className="flex gap-6">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Aggregate Depth</div>
                  <div className="text-sm font-bold text-white font-mono">$1.42B <span className="text-emerald-500 text-[10px] ml-1">↑ 0.4%</span></div>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Imbalance Ratio</div>
                  <div className="text-sm font-bold text-white font-mono">1.04:1 [BUY]</div>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">HFT Correlation</div>
                  <div className="text-sm font-bold text-white font-mono">0.982 ρ</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 px-4 bg-primary/10 rounded border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-all shadow-lg shadow-primary/10">
                  <span className="text-[10px] font-mono text-primary uppercase animate-pulse tracking-[0.2em] font-bold">Nexus Gradient Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sovereign Node Mesh */}
        <Card className="col-span-12 lg:col-span-4 bg-card/50 border-border/50 shadow-2xl shadow-black/40 flex flex-col">
          <CardHeader className="bg-black/20 border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Sovereign Node Mesh
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6 flex-1 overflow-hidden">
            <div className="space-y-4">
              {agents?.slice(0, 3).map(agent => (
                <div key={agent.id} className="p-3 rounded bg-black/40 border border-white/5 space-y-3 group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-white tracking-tight">{agent.name}</span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-none uppercase ${agent.riskScore > 70 ? 'text-rose-400 bg-rose-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                      {agent.riskScore > 70 ? 'Critical' : 'Nominal'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
                      <span>Intelligence Saturation</span>
                      <span>{agent.riskScore}%</span>
                    </div>
                    <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${agent.riskScore > 70 ? 'bg-rose-500' : 'bg-primary'}`} 
                        style={{ width: `${agent.riskScore}%` }} 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground truncate">
                    <div className="w-1 h-1 rounded-full bg-primary/60 animate-ping" />
                    <span className="opacity-60">{agent.lastAction}</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-12 text-muted-foreground text-xs font-mono uppercase tracking-widest opacity-20">
                  <Activity className="w-8 h-8 mx-auto mb-2" />
                  Awaiting Node Sync...
                </div>
              )}
            </div>

            {/* Real-time Inference Log Stream */}
            <div className="space-y-2 mt-2">
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Inference Log Stream</div>
              <div className="h-32 bg-black/60 rounded border border-white/5 p-2 font-mono text-[9px] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <div className="space-y-1">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="flex gap-2 opacity-60">
                      <span className="text-primary/60">[INF-{Math.floor(Math.random()*999)}]</span>
                      <span className="text-white/40 truncate">Propagating weight adjustments to cluster {i}...</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">Global Inference</div>
                <div className="text-lg font-bold font-mono text-white tracking-tighter">1.22<span className="text-[10px] text-muted-foreground ml-1">ms</span></div>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-3">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">Active Syncs</div>
                <div className="text-lg font-bold font-mono text-emerald-500 tracking-tighter">4,092</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance Grid */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zero-Trust Security Monitor */}
          <Card className="bg-card/50 border-border/50 shadow-2xl shadow-black/40">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-black/20 border-b border-white/5">
              <div>
                <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-500" />
                  Zero-Trust Security Monitor
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/50 font-mono mt-1 uppercase tracking-widest">ZTA_INTEGRITY: 100% // ENCRYPTION: AES-GCM-256</CardDescription>
              </div>
              <Badge variant="outline" className="text-[9px] border-rose-500/30 text-rose-500 bg-rose-500/5 uppercase tracking-tighter animate-pulse">Perimeter_Secure</Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {threats?.slice(0, 4).map(threat => (
                <div key={threat.id} className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 group hover:border-rose-500/30 transition-all cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white uppercase tracking-tight">{threat.type}</div>
                      <div className="text-[9px] font-mono text-muted-foreground/60">{threat.source}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-[8px] uppercase font-mono px-1.5 py-0 bg-white/5 text-white/40">{threat.status}</Badge>
                    <div className="text-[8px] font-mono text-muted-foreground mt-1 uppercase">0.00ms Isolation</div>
                  </div>
                </div>
              )) || (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-20">
                  <Shield className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-mono uppercase tracking-widest">Neural Firewall Active</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance & DORA Tracking */}
          <Card className="bg-card/50 border-border/50 shadow-2xl shadow-black/40">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-black/20 border-b border-white/5">
              <div>
                <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Regulatory Mesh (DORA)
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/50 font-mono mt-1 uppercase tracking-widest">EU_DORA_COMPLIANT // RESILIENCE_SCORE: 99.8</CardDescription>
              </div>
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary bg-primary/5 uppercase tracking-tighter">Class_A_Resilience</Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {compliance?.slice(0, 4).map(log => (
                <div key={log.id} className="relative pl-4 border-l-2 border-primary/30 group hover:border-primary transition-colors py-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">{log.regulation}</div>
                    <div className="text-[9px] font-mono text-muted-foreground">{new Date(log.timestamp!).toLocaleTimeString()}</div>
                  </div>
                  <p className="text-[11px] text-white/80 font-medium leading-relaxed truncate">{log.message}</p>
                </div>
              )) || (
                <div className="text-center py-12 text-muted-foreground opacity-20">
                  <div className="text-[10px] font-mono uppercase tracking-widest mb-2 animate-pulse">Awaiting Regulatory Telemetry...</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Strategies Portfolio */}
        <div className="col-span-12 space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary" />
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-[0.3em]">Agentic Strategy Portfolio</h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All Operational</span>
              <span>Total AUM: $14.2M</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies?.map((strategy) => (
              <Card key={strategy.id} className="bg-card/30 border-border/50 shadow-xl shadow-black/20 hover:border-primary/30 transition-all flex flex-col group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5 uppercase tracking-tighter">{strategy.symbol}</Badge>
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-white/10" />
                      <div className="w-1 h-4 bg-white/10" />
                      <div className="w-1 h-2 bg-white/10" />
                    </div>
                  </div>
                  <CardTitle className="text-base font-bold text-white tracking-tight truncate group-hover:text-primary transition-colors">{strategy.name}</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{strategy.description || strategy.nlpInput}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-5 pt-0">
                  <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Risk Model</div>
                      <div className="text-[11px] font-mono font-bold text-white uppercase">{strategy.parsedJson?.riskLevel || 'STANDARD'}_CONF</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Edge Confidence</div>
                      <div className="text-[11px] font-mono font-bold text-emerald-500">89.4%</div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-9 text-[10px] font-mono uppercase tracking-widest border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-lg active-elevate-2"
                      onClick={() => setLocation(`/strategy/${strategy.id}`)}
                    >
                      Audit DNA
                    </Button>
                    <Button 
                      className="flex-1 h-9 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 active-elevate-2"
                      disabled={runBacktestMutation.isPending}
                      onClick={() => runBacktestMutation.mutate(strategy.id)}
                    >
                      <Play className="mr-2 h-3 w-3 fill-current" /> Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

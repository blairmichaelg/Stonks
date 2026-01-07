import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        
        {/* Market Microstructure & Heatmap Placeholder */}
        <Card className="col-span-12 lg:col-span-8 bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Market Microstructure Heatmap
            </CardTitle>
            <div className="flex gap-2">
              {['1H', '4H', '1D', '1W'].map(t => (
                <Button key={t} variant="ghost" size="sm" className="h-8 px-2 text-xs">{t}</Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[400px] relative overflow-hidden flex items-center justify-center bg-black/20">
             {/* Mock Heatmap Visualization */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 50%)' }} 
             />
             <div className="text-center z-10 w-full px-12">
               <div className="flex justify-between items-end mb-8 w-full">
                 <div className="space-y-1 text-left">
                   <div className="text-[10px] font-mono text-primary uppercase tracking-tighter opacity-50">Liquidity Velocity</div>
                   <div className="text-2xl font-bold font-mono text-white">1,429.52</div>
                 </div>
                 <div className="h-16 w-32 flex items-end gap-1">
                   {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                     <div key={i} className="flex-1 bg-primary/40 rounded-t-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                   ))}
                 </div>
               </div>
               <div className="text-muted-foreground text-sm font-mono mb-2 tracking-[0.2em] animate-pulse">HINDSIGHT OVERLAY ACTIVE</div>
               <div className="flex items-center justify-center gap-4 border-t border-white/5 pt-4">
                 <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Depth: +142.5M</div>
                 <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Rejection: 3 Nodes</div>
               </div>
             </div>
             {/* DNA Fingerprints Column */}
             <div className="absolute right-0 top-0 bottom-0 w-16 border-l border-border/50 bg-background/40 flex flex-col items-center py-4 gap-4 overflow-hidden">
               {[1,2,3,4,5,6,7,8].map(i => (
                 <div key={i} className="w-10 h-6 relative group cursor-help shrink-0" title="Trade DNA Fingerprint">
                   <div className="absolute inset-0 bg-primary/10 rounded-sm border border-primary/20 group-hover:bg-primary/30 transition-colors" />
                   <div className="dna-fingerprint absolute bottom-1 left-1 right-1" />
                   <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-emerald-500" />
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        {/* AI Agentic Risk Scoring */}
        <Card className="col-span-12 lg:col-span-4 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Agentic Mesh Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {agents?.map(agent => (
              <div key={agent.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">{agent.name}</span>
                  <span className={`text-xs ${agent.riskScore > 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    Risk: {agent.riskScore}%
                  </span>
                </div>
                <Progress value={agent.riskScore} className="h-1.5" />
                <p className="text-xs text-muted-foreground italic">Last Action: {agent.lastAction}</p>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground text-sm">No active agents.</div>
            )}
          </CardContent>
        </Card>

        {/* Security Monitor */}
        <Card className="col-span-12 md:col-span-6 bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-500">
              <Shield className="w-5 h-5" />
              Zero-Trust Security
            </CardTitle>
            <Badge variant="outline" className="border-rose-500/50 text-rose-500">ZTA Active</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {threats?.map(threat => (
              <div key={threat.id} className="flex items-center justify-between p-3 rounded bg-black/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-sm font-medium text-white">{threat.type}</div>
                    <div className="text-xs text-muted-foreground">{threat.source}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase">{threat.status}</Badge>
              </div>
            )) || (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                Perimeter Secure
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Monitor */}
        <Card className="col-span-12 md:col-span-6 bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Regulatory Compliance (DORA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {compliance?.map(log => (
              <div key={log.id} className="flex gap-3 border-l-2 border-primary/50 pl-4 py-1">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-primary">{log.regulation}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp!).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-white line-clamp-1">{log.message}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground text-sm italic">
                Awaiting operational maturity telemetry...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategies Grid */}
        <div className="col-span-12 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold text-white">Strategy Portfolio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies?.map((strategy) => (
              <Card key={strategy.id} className="hover-elevate flex flex-col h-full bg-card/30">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate">{strategy.name}</span>
                    <Badge variant="secondary" className="font-mono">{strategy.symbol}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>
                  <div className="flex justify-between items-center text-xs border-t border-border/50 pt-3">
                    <span className="text-muted-foreground">Regime: <span className="text-white">Trend Following</span></span>
                    <span className="text-muted-foreground">Confidence: <span className="text-emerald-500 font-bold">89%</span></span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full h-9"
                      onClick={() => setLocation(`/strategy/${strategy.id}`)}
                    >
                      Audit DNA
                    </Button>
                    <Button 
                      className="w-full h-9"
                      disabled={runBacktestMutation.isPending}
                      onClick={() => runBacktestMutation.mutate(strategy.id)}
                    >
                      <Play className="mr-2 h-3 w-3" /> Execute
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

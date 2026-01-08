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

  if (loadingStrategies) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor your trading strategies</p>
        </div>
        <Button onClick={() => setLocation("/builder")} size="default">
          <Plus className="mr-2 h-4 w-4" /> New Strategy
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* AI Agents Status */}
        {agents && agents.length > 0 && (
          <Card className="col-span-12 lg:col-span-4 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                AI Agents
              </CardTitle>
              <CardDescription>Active trading agents and their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.slice(0, 3).map(agent => (
                <div key={agent.id} className="p-3 rounded bg-muted border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">{agent.name}</span>
                    <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Risk Score</span>
                      <span>{agent.riskScore}%</span>
                    </div>
                    <Progress value={agent.riskScore} className="h-1" />
                  </div>
                  {agent.lastAction && (
                    <div className="text-xs text-muted-foreground truncate">
                      Last: {agent.lastAction}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Security Threats */}
        {threats && threats.length > 0 && (
          <Card className="col-span-12 lg:col-span-4 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" />
                Security Alerts
              </CardTitle>
              <CardDescription>Recent security events and threats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {threats.slice(0, 4).map(threat => (
                <div key={threat.id} className="flex items-center justify-between p-3 rounded bg-muted border border-border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="text-sm font-medium text-white">{threat.type}</div>
                      <div className="text-xs text-muted-foreground">{threat.source}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{threat.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Compliance Logs */}
        {compliance && compliance.length > 0 && (
          <Card className="col-span-12 lg:col-span-4 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Compliance Log
              </CardTitle>
              <CardDescription>Regulatory compliance events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {compliance.slice(0, 4).map(log => (
                <div key={log.id} className="border-l-2 border-primary pl-3 py-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-primary">{log.regulation}</div>
                    <div className="text-xs text-muted-foreground">{new Date(log.timestamp!).toLocaleTimeString()}</div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{log.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Strategies Portfolio */}
        <div className="col-span-12 space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-bold text-white">Your Strategies</h2>
            {strategies && strategies.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies?.map((strategy) => (
              <Card key={strategy.id} className="bg-card/50 border-border/50 hover:border-primary/50 transition-all flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{strategy.symbol}</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-white truncate">{strategy.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{strategy.description || strategy.nlpInput}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-3 border-y border-border py-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Risk Level</div>
                      <div className="text-sm font-medium text-white">{(strategy.parsedJson as any)?.riskLevel || 'Medium'}</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-xs text-muted-foreground">Timeframe</div>
                      <div className="text-sm font-medium text-white">{strategy.timeframe}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setLocation(`/strategy/${strategy.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      className="flex-1"
                      disabled={runBacktestMutation.isPending}
                      onClick={() => runBacktestMutation.mutate(strategy.id)}
                    >
                      <Play className="mr-2 h-4 w-4" /> Run Backtest
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

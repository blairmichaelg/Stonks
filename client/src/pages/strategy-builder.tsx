import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseStrategyRequestSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Cpu, Zap, Shield, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function StrategyBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dslPreview, setDslPreview] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(parseStrategyRequestSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const parseMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/strategies/parse", { prompt });
      if (!res.ok) throw new Error("Failed to parse strategy");
      return res.json();
    },
    onSuccess: (data) => {
      setDslPreview(data);
      toast({ title: "Logic Extracted", description: "Natural language translated to verifiable DSL." });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/strategies", {
        name: `Institutional Strategy ${Math.floor(Math.random() * 1000)}`,
        nlpInput: form.getValues("prompt"),
        symbol: "SPY",
        assetType: "stock",
        timeframe: data.timeframe || "daily",
        initialCapital: 10000,
        parsedJson: data
      });
      if (!res.ok) throw new Error("Failed to commit strategy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      toast({ title: "Committed to Mesh", description: "Strategy successfully compiled and deployed." });
      setLocation("/");
    }
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Terminal
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Logic Canvas</h1>
            <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" /> Agentic NLP
            </Badge>
          </div>
          <p className="text-muted-foreground">Translate natural language intent into verifiable institutional logic via 2-stage agentic mapping.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-card/50 border-border/50 shadow-2xl shadow-black/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-primary" />
                  Intent Input
                </CardTitle>
                <CardDescription className="text-muted-foreground/70">Describe your strategic intent in plain English for DSL conversion.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => parseMutation.mutate(data.prompt))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., Enter when Bitcoin breaks a 20-day high on 2x volume, but only during FOMC weeks..."
                              className="min-h-[180px] bg-black/40 border-border/50 focus-visible:ring-primary/50 text-base font-sans placeholder:opacity-30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 hover-elevate bg-primary text-primary-foreground font-bold" 
                      disabled={parseMutation.isPending}
                    >
                      {parseMutation.isPending ? "AGENTIC MAPPING..." : "TRANSLATE TO DSL"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/10 group hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Context Guard</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed group-hover:text-white/70 transition-colors">
                    Automatically injecting macro regimes and event filters into the execution mesh.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/5 border-emerald-500/10 group hover:border-emerald-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <Cpu className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Mesh Optimized</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed group-hover:text-white/70 transition-colors">
                    Strategy will be compiled to sub-microsecond binary for institutional nodes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="h-full bg-card/30 border-border/50 flex flex-col min-h-[400px]">
              <CardHeader className="border-b border-border/50 bg-black/20">
                <CardTitle className="text-xs font-mono flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  DSL VERIFICATION
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col">
                {dslPreview ? (
                  <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Entry Logic (Compiled)</div>
                      <div className="space-y-2">
                        {dslPreview.entry?.indicators?.map((ind: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/5 text-xs font-mono group hover:bg-primary/5 transition-colors">
                            <span className="text-primary font-bold">{ind.type}</span>
                            <span className="text-white opacity-60 font-medium">{ind.condition} {ind.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Risk Architecture</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 py-0.5 font-mono uppercase tracking-tighter">MACRO_SYNC</Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 py-0.5 font-mono uppercase tracking-tighter">EVENT_INJECT</Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 py-0.5 font-mono uppercase tracking-tighter">{dslPreview.riskLevel}_RISK</Badge>
                      </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                      <Button 
                        onClick={() => createMutation.mutate(dslPreview)} 
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 font-bold shadow-lg shadow-emerald-900/20 active-elevate-2"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? "COMMITTING..." : "COMMIT TO MESH"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center bg-black/10">
                    <div className="space-y-4 max-w-[200px]">
                      <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground opacity-10 absolute animate-ping" />
                        <AlertCircle className="w-10 h-10 text-muted-foreground opacity-20 relative" />
                      </div>
                      <p className="text-xs text-muted-foreground/60 italic leading-relaxed uppercase tracking-widest">Awaiting intent input for DSL generation...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

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
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Strategy Builder</h1>
          <p className="text-muted-foreground">Create a new trading strategy using natural language</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-primary" />
                  Strategy Description
                </CardTitle>
                <CardDescription>Describe your trading strategy in plain English</CardDescription>
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
                              placeholder="e.g., Buy when the price crosses above the 50-day moving average and volume is above average..."
                              className="min-h-[180px] bg-muted border-border"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={parseMutation.isPending}
                    >
                      {parseMutation.isPending ? "Processing..." : "Generate Strategy"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-semibold">Risk Management</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatic risk controls and position sizing
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <Cpu className="w-4 h-4" />
                    <span className="text-sm font-semibold">Backtesting</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Test your strategy on historical data
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="h-full bg-card/50 border-border/50 flex flex-col min-h-[400px]">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Strategy Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col">
                {dslPreview ? (
                  <div className="p-6 space-y-6 h-full flex flex-col">
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground font-medium">Entry Conditions</div>
                      <div className="space-y-2">
                        {dslPreview.entry?.indicators?.map((ind: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded bg-muted border border-border text-sm">
                            <span className="text-primary font-medium">{ind.type}</span>
                            <span className="text-muted-foreground">{ind.condition} {ind.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground font-medium">Risk Settings</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{dslPreview.riskLevel || 'Medium'} Risk</Badge>
                        <Badge variant="secondary">{dslPreview.timeframe || 'Daily'}</Badge>
                      </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-border">
                      <Button 
                        onClick={() => createMutation.mutate(dslPreview)} 
                        className="w-full"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? "Creating..." : "Create Strategy"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center bg-muted/50">
                    <div className="space-y-4 max-w-[200px]">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                      <p className="text-sm text-muted-foreground">Enter a strategy description to see the preview</p>
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

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStrategySchema } from "@shared/schema";
import { useCreateStrategy, useParseStrategy } from "@/hooks/use-strategies";
import { useLocation } from "wouter";
import { Wand2, Save, Loader2, Code2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extended schema for the form
const formSchema = insertStrategySchema.extend({
  initialCapital: z.coerce.number().min(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function StrategyBuilder() {
  const [, setLocation] = useLocation();
  const [parsedLogic, setParsedLogic] = useState<any>(null);
  
  const createStrategy = useCreateStrategy();
  const parseStrategy = useParseStrategy();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      nlpInput: "Buy when RSI is below 30 and sell when RSI is above 70",
      parsedJson: {},
      assetType: "stock",
      symbol: "AAPL",
      timeframe: "daily",
      initialCapital: 10000,
    },
  });

  const handleParse = async () => {
    const prompt = form.getValues("nlpInput");
    if (!prompt) return;

    try {
      const result = await parseStrategy.mutateAsync({ prompt });
      setParsedLogic(result);
      form.setValue("parsedJson", result);
    } catch (error) {
      console.error("Failed to parse", error);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await createStrategy.mutateAsync(data);
      setLocation("/");
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Strategy Builder</h1>
          <p className="text-muted-foreground">Define your trading logic using natural language.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
        {/* Left Column: Logic */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="flex-1 bg-card border-border shadow-lg flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                <CardTitle>AI Logic Designer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <div className="space-y-2">
                <Label htmlFor="nlpInput" className="text-base font-medium">Trading Logic (English)</Label>
                <Textarea
                  id="nlpInput"
                  className="min-h-[150px] bg-background/50 border-border text-lg font-medium resize-none focus:ring-primary/20"
                  placeholder="e.g. Buy when SMA(20) crosses above SMA(50) and RSI < 30..."
                  {...form.register("nlpInput")}
                />
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={handleParse} 
                    disabled={parseStrategy.isPending}
                    className="gap-2"
                  >
                    {parseStrategy.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Parse Logic
                  </Button>
                </div>
              </div>

              {parsedLogic && (
                <div className="flex-1 rounded-lg border border-border bg-slate-950 p-4 relative overflow-hidden group">
                  <div className="absolute top-2 right-2 opacity-50 text-xs font-mono border border-border px-2 py-1 rounded">JSON Preview</div>
                  <div className="overflow-auto h-full max-h-[300px] custom-scrollbar">
                    <pre className="text-sm font-mono text-emerald-400/90 whitespace-pre-wrap">
                      {JSON.stringify(parsedLogic, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {!parsedLogic && !parseStrategy.isPending && (
                <div className="flex-1 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground bg-slate-900/50">
                  <div className="text-center p-6">
                    <Code2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Parsed logic will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Configuration */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle>Strategy Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Strategy Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Golden Cross Momentum" 
                  className="bg-background/50"
                  {...form.register("name")} 
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("assetType", val)}
                    defaultValue={form.getValues("assetType")}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="option">Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input 
                    id="symbol" 
                    placeholder="AAPL" 
                    className="font-mono bg-background/50 uppercase"
                    {...form.register("symbol")} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("timeframe", val)}
                    defaultValue={form.getValues("timeframe")}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capital">Initial Capital ($)</Label>
                  <Input 
                    id="capital" 
                    type="number"
                    className="font-mono bg-background/50"
                    {...form.register("initialCapital")} 
                  />
                </div>
              </div>

              <div className="pt-4">
                {!parsedLogic ? (
                   <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Logic Required</AlertTitle>
                    <AlertDescription>
                      Please parse the NLP logic before saving.
                    </AlertDescription>
                  </Alert>
                ) : null}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold"
                  disabled={createStrategy.isPending || !parsedLogic}
                >
                  {createStrategy.isPending ? "Saving..." : "Create Strategy"}
                  {!createStrategy.isPending && <Save className="w-5 h-5 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Layout>
  );
}

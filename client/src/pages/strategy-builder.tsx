import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStrategySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StrategyBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertStrategySchema),
    defaultValues: {
      name: "",
      description: "",
      nlpInput: "",
      symbol: "SPY",
      assetType: "stock",
      timeframe: "daily",
      initialCapital: 10000
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting strategy data:", data);
      const res = await apiRequest("POST", "/api/strategies", data);
      
      if (!res.ok) {
        let errorMessage = "Failed to save strategy";
        try {
          const result = await res.json();
          errorMessage = result.message || errorMessage;
          console.error("API error response:", result);
        } catch (e) {
          const text = await res.text();
          console.error("API error text:", text);
        }
        throw new Error(errorMessage);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      console.log("Strategy created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      toast({ title: "Strategy Created", description: "Your strategy is ready for backtesting." });
      setLocation("/");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Creation Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div>
        <h1 className="text-4xl font-bold tracking-tight">Build Strategy</h1>
        <p className="text-muted-foreground mt-1">Describe your trading plan in plain English.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("Manual form submit handler triggered");
                const data = form.getValues();
                console.log("Form data before validation:", data);
                
                const isValid = await form.trigger();
                if (isValid) {
                  console.log("Validation passed, calling mutation...");
                  mutation.mutate(data);
                } else {
                  console.error("Validation failed:", form.formState.errors);
                  toast({
                    title: "Validation Error",
                    description: "Please check all required fields.",
                    variant: "destructive"
                  });
                }
              }} 
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Mean Reversion SPY" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nlpInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Description (NLP)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g. Buy when RSI is below 30 and MACD histogram is positive. Exit at 5% profit or 2% stop loss." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialCapital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Capital</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={mutation.isPending} 
                data-testid="button-save-strategy"
              >
                {mutation.isPending ? "Generating Strategy..." : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" /> Generate & Save
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

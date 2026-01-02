import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StrategyBuilder from "@/pages/strategy-builder";
import StrategyDetails from "@/pages/strategy-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/builder" component={StrategyBuilder} />
      <Route path="/strategy/:id" component={StrategyDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

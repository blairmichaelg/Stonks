import { Layout } from "@/components/Layout";
import { useStrategies } from "@/hooks/use-strategies";
import { Link } from "wouter";
import { Plus, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: strategies, isLoading } = useStrategies();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Manage your algorithmic trading strategies.</p>
        </div>
        <Link href="/builder">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card Placeholder */}
        <Link href="/builder">
          <div className="h-full min-h-[280px] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4 group">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground">Create New Strategy</h3>
              <p className="text-sm text-muted-foreground mt-1">Design with Natural Language</p>
            </div>
          </div>
        </Link>

        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
          ))
        ) : (
          strategies?.map((strategy) => (
            <Link key={strategy.id} href={`/strategies/${strategy.id}`}>
              <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="font-mono text-xs uppercase bg-background">
                      {strategy.assetType}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {strategy.timeframe}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {strategy.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {strategy.description || strategy.nlpInput}
                  </p>
                  
                  <div className="mt-6 flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-foreground">{strategy.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-foreground font-mono">
                        ${strategy.initialCapital.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-4 mt-auto">
                  <div className="w-full flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">View Details</span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </Layout>
  );
}

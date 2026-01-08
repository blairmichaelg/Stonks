import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenTool, Settings, LineChart, Cpu, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/builder", label: "Strategy Builder", icon: PenTool },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Stonks</h1>
            <p className="text-[10px] text-muted-foreground">Trading Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-white">System Status</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Connection</span>
            <span className="text-emerald-500">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

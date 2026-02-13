import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, Shield, Activity, DollarSign, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { storage } from "@/lib/storage";
import { format } from "date-fns";
import { useMemo } from "react";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export default function DashboardPage() {
  const { user } = useAuth();
  const transactions = useMemo(() => user ? storage.getTransactionsForUser(user.id) : [], [user]);
  const recentTransactions = transactions.slice(0, 5);

  const totalSent = transactions
    .filter(t => t.fromUserId === user?.id && t.type === "transfer")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalReceived = transactions
    .filter(t => t.toUserId === user?.id && t.type === "transfer")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar user={user} size="lg" />
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, <span className="text-primary font-semibold">{user?.username}</span></p>
          </div>
        </div>
        <Link to="/transfer">
          <Button className="shadow-primary-glow" disabled={user?.isSuspended}>
            <ArrowUpRight className="mr-2 h-4 w-4" /> New Transfer
          </Button>
        </Link>
      </div>

      {/* Suspension Warning */}
      {user?.isSuspended && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-destructive text-sm font-medium">
              Your account is suspended. You cannot send or receive money. Contact an administrator for assistance.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Balance Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-8 relative z-10">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">Total Balance</p>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-glow">
            ${user?.balance.toLocaleString()}
          </h2>
          {user?.isAdmin && (
            <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-xs">
              <Shield className="w-3 h-3" /> Admin
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Sent</p>
                <p className="text-xl font-bold font-display">${totalSent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Received</p>
                <p className="text-xl font-bold font-display">${totalReceived.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Transactions</p>
                <p className="text-xl font-bold font-display">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link to="/logs">
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div>
                    <p className="font-medium text-sm">
                      {tx.type === "transfer" && tx.fromUserId === user?.id
                        ? `Sent to ${tx.toUsername}`
                        : tx.type === "transfer"
                        ? `Received from ${tx.fromUsername}`
                        : tx.type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, h:mm a")}</p>
                  </div>
                  <span className={`font-mono font-bold ${tx.fromUserId === user?.id && tx.type === "transfer" ? "text-destructive" : "text-green-500"}`}>
                    {tx.fromUserId === user?.id && tx.type === "transfer" ? "-" : "+"}${Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

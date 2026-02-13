import { useAuth } from "@/hooks/use-auth";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export default function LogsPage() {
  const { user } = useAuth();
  const transactions = useMemo(() => user ? storage.getTransactionsForUser(user.id) : [], [user]);
  const [filter, setFilter] = useState("");

  const filtered = transactions.filter(tx =>
    tx.type.toLowerCase().includes(filter.toLowerCase()) ||
    tx.fromUsername?.toLowerCase().includes(filter.toLowerCase()) ||
    tx.toUsername?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction History</h1>
          <p className="text-muted-foreground">Detailed logs of all account activity.</p>
        </div>
        <div className="w-full md:w-64">
          <Input placeholder="Search transactions..." className="bg-card/50" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions found</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(tx => {
                const isSent = tx.fromUserId === user?.id && tx.type === "transfer";
                const isAdmin = tx.type.startsWith("admin");
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAdmin ? "bg-primary/10" : isSent ? "bg-destructive/10" : "bg-green-500/10"}`}>
                        {isAdmin ? <Shield className="w-4 h-4 text-primary" /> : isSent ? <ArrowUpRight className="w-4 h-4 text-destructive" /> : <ArrowDownLeft className="w-4 h-4 text-green-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {tx.type === "transfer" ? (isSent ? `Sent to ${tx.toUsername}` : `Received from ${tx.fromUsername}`) : tx.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, yyyy · h:mm a")}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${isSent ? "text-destructive" : "text-green-500"}`}>
                      {isSent ? "-" : "+"}${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Ban, CheckCircle, ShieldAlert, Plus, Users, Ticket, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const couponSchema = z.object({
  code: z.string().min(3),
  amount: z.coerce.number().min(1),
  maxUses: z.coerce.number().min(1),
  expiresAt: z.string().optional(),
});

export default function AdminPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [giveAmounts, setGiveAmounts] = useState<Record<number, string>>({});
  const [newPasswords, setNewPasswords] = useState<Record<number, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const users = useMemo(() => storage.getAllUsers(), [refreshKey]);
  const coupons = useMemo(() => storage.getAllCoupons(), [refreshKey]);

  const couponForm = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: "", amount: 0, maxUses: 1, expiresAt: "" },
  });

  function doAction(targetId: number, action: string, amount?: number) {
    try {
      storage.adminAction(user!.id, targetId, action, amount);
      setRefreshKey(k => k + 1);
      refreshUser();
      toast({ title: "Action completed", description: `${action} applied successfully` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  function doResetPassword(targetId: number) {
    const newPwd = newPasswords[targetId];
    if (!newPwd || newPwd.length < 1) {
      toast({ title: "Error", description: "Enter a new password", variant: "destructive" });
      return;
    }
    try {
      storage.adminResetPassword(user!.id, targetId, newPwd);
      setNewPasswords(prev => ({ ...prev, [targetId]: "" }));
      setRefreshKey(k => k + 1);
      toast({ title: "Password reset", description: "Password has been changed successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  function onCreateCoupon(data: z.infer<typeof couponSchema>) {
    storage.createCoupon({ code: data.code, amount: data.amount, maxUses: data.maxUses, expiresAt: data.expiresAt });
    couponForm.reset();
    setRefreshKey(k => k + 1);
    toast({ title: "Coupon created" });
  }

  if (!user?.isAdmin) {
    return <div className="text-center py-20 text-muted-foreground">Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, balances, and coupons.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" /> Users</TabsTrigger>
          <TabsTrigger value="coupons"><Ticket className="w-4 h-4 mr-2" /> Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ProfileAvatar user={u} size="sm" />
                          <div>
                            <span className="font-medium">{u.username}</span>
                            {u.isAdmin && <Badge variant="outline" className="ml-2 text-primary border-primary/30 text-xs">Admin</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${u.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        {u.isSuspended ? (
                          <Badge variant="destructive" className="text-xs">Suspended</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.id !== user.id && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              <Input
                                type="number"
                                placeholder="Amt"
                                className="w-20 h-8 text-xs"
                                value={giveAmounts[u.id] || ""}
                                onChange={e => setGiveAmounts({ ...giveAmounts, [u.id]: e.target.value })}
                              />
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => doAction(u.id, "give", Number(giveAmounts[u.id]))}>Give</Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => doAction(u.id, "take", Number(giveAmounts[u.id]))}>Take</Button>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Input
                                type="password"
                                placeholder="New password"
                                className="w-32 h-8 text-xs"
                                value={newPasswords[u.id] || ""}
                                onChange={e => setNewPasswords({ ...newPasswords, [u.id]: e.target.value })}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-8 text-xs">
                                    <KeyRound className="w-3 h-3 mr-1" /> Reset Password
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reset Password for {u.username}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will change the password for user "{u.username}". They will need to use the new password to log in.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => doResetPassword(u.id)}>Reset Password</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {u.isSuspended ? (
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => doAction(u.id, "unsuspend")}>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Unsuspend
                                </Button>
                              ) : (
                                <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => doAction(u.id, "suspend")}>
                                  <Ban className="w-3 h-3 mr-1" /> Suspend
                                </Button>
                              )}
                              {!u.isAdmin && (
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => doAction(u.id, "make_admin")}>
                                  <ShieldAlert className="w-3 h-3 mr-1" /> Admin
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="mt-4 space-y-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Create Coupon</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...couponForm}>
                <form onSubmit={couponForm.handleSubmit(onCreateCoupon)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField control={couponForm.control} name="code" render={({ field }) => (
                    <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="WELCOME100" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={couponForm.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={couponForm.control} name="maxUses" render={({ field }) => (
                    <FormItem><FormLabel>Max Uses</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex items-end">
                    <Button type="submit" className="w-full"><Plus className="w-4 h-4 mr-2" /> Create</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Uses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.code}</TableCell>
                      <TableCell>${c.amount}</TableCell>
                      <TableCell>{c.usedCount}/{c.maxUses}</TableCell>
                    </TableRow>
                  ))}
                  {coupons.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No coupons</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

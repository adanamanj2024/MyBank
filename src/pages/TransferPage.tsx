import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, User as UserIcon, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { User } from "@/lib/types";

const transferSchema = z.object({
  toUsername: z.string().min(1, "Username is required"),
  amount: z.coerce.number().positive("Amount must be positive").min(1, "Minimum transfer is $1"),
});

export default function TransferPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [confirmStep, setConfirmStep] = useState(false);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [transferAmount, setTransferAmount] = useState(0);

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: { toUsername: "", amount: 0 },
  });

  function onPreview(data: z.infer<typeof transferSchema>) {
    // Find recipient to show profile
    const found = storage.getUserByUsername(data.toUsername);
    if (!found) {
      toast({ title: "User not found", description: `No user with username "${data.toUsername}"`, variant: "destructive" });
      return;
    }
    if (found.id === user?.id) {
      toast({ title: "Error", description: "Cannot transfer to yourself", variant: "destructive" });
      return;
    }
    if (found.isSuspended) {
      toast({ title: "Error", description: "This user's account is suspended. They cannot receive money.", variant: "destructive" });
      return;
    }
    if (user?.isSuspended) {
      toast({ title: "Error", description: "Your account is suspended. You cannot send money.", variant: "destructive" });
      return;
    }
    if ((user?.balance || 0) < data.amount) {
      toast({ title: "Error", description: "Insufficient balance", variant: "destructive" });
      return;
    }
    setRecipient(found);
    setTransferAmount(data.amount);
    setConfirmStep(true);
  }

  function onConfirm() {
    try {
      storage.transfer(user!.id, recipient!.username, transferAmount);
      refreshUser();
      form.reset();
      setConfirmStep(false);
      setRecipient(null);
      toast({ title: "Transfer successful", description: `$${transferAmount} sent to ${recipient!.username}` });
    } catch (e: any) {
      toast({ title: "Transfer failed", description: e.message, variant: "destructive" });
    }
  }

  function onGoBack() {
    setConfirmStep(false);
    setRecipient(null);
  }

  if (user?.isSuspended) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Transfer Funds</h1>
          <p className="text-muted-foreground">Send money instantly to other users.</p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-display font-bold text-destructive">Account Suspended</h2>
            <p className="text-muted-foreground">Your account is suspended. You cannot send or receive money. Please contact an administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Transfer Funds</h1>
        <p className="text-muted-foreground">Send money instantly to other users.</p>
      </div>

      {!confirmStep ? (
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Current balance: <span className="text-primary font-bold">${user?.balance.toLocaleString()}</span></CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPreview)} className="space-y-6">
                <FormField control={form.control} name="toUsername" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Enter recipient username" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-10" type="number" placeholder="0" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full shadow-primary-glow">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle>Confirm Transfer</CardTitle>
            <CardDescription>Review the details below before confirming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipient Profile */}
            <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-background/50 border border-border/30">
              <ProfileAvatar user={recipient} size="xl" />
              <div className="text-center">
                <h3 className="text-2xl font-display font-bold">{recipient?.username}</h3>
                <p className="text-sm text-muted-foreground">Recipient</p>
              </div>
            </div>

            {/* Transfer Amount */}
            <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Amount to Send</p>
              <p className="text-5xl font-display font-bold text-primary text-glow">
                ${transferAmount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your balance after: <span className="text-foreground font-semibold">${((user?.balance || 0) - transferAmount).toLocaleString()}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={onGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Button className="flex-1 shadow-primary-glow" onClick={onConfirm}>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

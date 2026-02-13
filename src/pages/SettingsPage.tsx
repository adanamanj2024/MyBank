import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ticket, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileAvatar } from "@/components/ProfileAvatar";

const settingsSchema = z.object({
  username: z.string().min(3).max(20).optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
});

const redeemSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { username: "", password: "" },
  });

  const redeemForm = useForm<z.infer<typeof redeemSchema>>({
    resolver: zodResolver(redeemSchema),
    defaultValues: { code: "" },
  });

  function onUpdateSettings(values: z.infer<typeof settingsSchema>) {
    try {
      const updates: any = {};
      if (values.username) updates.username = values.username;
      if (values.password) updates.password = values.password;
      if (Object.keys(updates).length === 0) return;
      storage.updateUser(user!.id, updates);
      refreshUser();
      settingsForm.reset();
      toast({ title: "Settings updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  function onRedeem(values: z.infer<typeof redeemSchema>) {
    try {
      storage.redeemCoupon(user!.id, values.code);
      refreshUser();
      redeemForm.reset();
      toast({ title: "Coupon redeemed!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  function onDeleteAccount() {
    storage.deleteUser(user!.id);
    logout();
    navigate("/");
  }

  function handleProfilePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 data URL for localStorage storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      storage.updateUser(user!.id, { profilePicture: base64 });
      refreshUser();
      toast({ title: "Profile picture updated" });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      {/* Profile Picture */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Click to change your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <ProfileAvatar user={user} size="xl" />
            <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" /> Upload Photo
            </Button>
            {user?.profilePicture && (
              <Button
                variant="ghost"
                className="ml-2 text-destructive"
                onClick={() => {
                  storage.updateUser(user!.id, { profilePicture: null });
                  refreshUser();
                  toast({ title: "Profile picture removed" });
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureChange}
          />
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Username: <span className="text-primary font-bold">{user?.username}</span> · Balance: <span className="text-primary font-bold">${user?.balance.toLocaleString()}</span></CardDescription>
        </CardHeader>
      </Card>

      {/* Update Settings */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Leave fields empty to keep current values.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onUpdateSettings)} className="space-y-4">
              <FormField control={settingsForm.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>New Username</FormLabel><FormControl><Input placeholder="Enter new username" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={settingsForm.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" placeholder="Enter new password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Redeem Coupon */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Redeem Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...redeemForm}>
            <form onSubmit={redeemForm.handleSubmit(onRedeem)} className="flex gap-3">
              <FormField control={redeemForm.control} name="code" render={({ field }) => (
                <FormItem className="flex-1"><FormControl><Input placeholder="Enter coupon code" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit">Redeem</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-card/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete your account and all associated data.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteAccount}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

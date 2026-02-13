import { User, Transaction, Coupon, CouponRedemption } from "./types";

const USERS_KEY = "mybank_users";
const TRANSACTIONS_KEY = "mybank_transactions";
const COUPONS_KEY = "mybank_coupons";
const REDEMPTIONS_KEY = "mybank_redemptions";
const CURRENT_USER_KEY = "mybank_current_user";

function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function nextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// Seed admin user if none exists
function ensureAdmin() {
  const users = getItems<User>(USERS_KEY);
  if (!users.find(u => u.username === "admin")) {
    users.push({
      id: nextId(users),
      username: "admin",
      password: "admin",
      balance: 1000000,
      isAdmin: true,
      isSuspended: false,
      profilePicture: null,
      createdAt: new Date().toISOString(),
    });
    setItems(USERS_KEY, users);
  }
}

ensureAdmin();

export const storage = {
  // Auth
  register(username: string, password: string): User {
    const users = getItems<User>(USERS_KEY);
    if (users.find(u => u.username === username)) {
      throw new Error("Username already taken");
    }
    const user: User = {
      id: nextId(users),
      username,
      password,
      balance: 0,
      isAdmin: false,
      isSuspended: false,
      profilePicture: null,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    setItems(USERS_KEY, users);
    return user;
  },

  login(username: string, password: string): User {
    const users = getItems<User>(USERS_KEY);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    // Suspended users CAN login but with limited functionality
    return user;
  },

  getCurrentUser(): User | null {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return null;
    const users = getItems<User>(USERS_KEY);
    return users.find(u => u.id === Number(id)) || null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, String(user.id));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  getUser(id: number): User | null {
    return getItems<User>(USERS_KEY).find(u => u.id === id) || null;
  },

  getUserByUsername(username: string): User | null {
    return getItems<User>(USERS_KEY).find(u => u.username === username) || null;
  },

  getAllUsers(): User[] {
    return getItems<User>(USERS_KEY);
  },

  updateUser(id: number, updates: Partial<User>) {
    const users = getItems<User>(USERS_KEY);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...updates };
    setItems(USERS_KEY, users);
    return users[idx];
  },

  deleteUser(id: number) {
    const users = getItems<User>(USERS_KEY).filter(u => u.id !== id);
    setItems(USERS_KEY, users);
  },

  // Transactions
  getTransactionsForUser(userId: number): Transaction[] {
    const txs = getItems<Transaction>(TRANSACTIONS_KEY);
    const users = getItems<User>(USERS_KEY);
    return txs
      .filter(t => t.fromUserId === userId || t.toUserId === userId)
      .map(t => ({
        ...t,
        fromUsername: users.find(u => u.id === t.fromUserId)?.username || "System",
        toUsername: users.find(u => u.id === t.toUserId)?.username || "System",
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createTransaction(tx: Omit<Transaction, "id" | "createdAt">) {
    const txs = getItems<Transaction>(TRANSACTIONS_KEY);
    const newTx: Transaction = {
      ...tx,
      id: nextId(txs),
      createdAt: new Date().toISOString(),
    };
    txs.push(newTx);
    setItems(TRANSACTIONS_KEY, txs);
    return newTx;
  },

  transfer(fromId: number, toUsername: string, amount: number): User {
    const users = getItems<User>(USERS_KEY);
    const sender = users.find(u => u.id === fromId);
    const recipient = users.find(u => u.username === toUsername);
    if (!sender) throw new Error("Sender not found");
    if (!recipient) throw new Error("Recipient not found");
    if (sender.username === toUsername) throw new Error("Cannot transfer to yourself");
    if (sender.isSuspended) throw new Error("Your account is suspended. You cannot send money.");
    if (recipient.isSuspended) throw new Error("Recipient account is suspended. They cannot receive money.");
    if (sender.balance < amount) throw new Error("Insufficient balance");

    this.updateUser(sender.id, { balance: sender.balance - amount });
    this.updateUser(recipient.id, { balance: recipient.balance + amount });
    this.createTransaction({
      fromUserId: sender.id,
      toUserId: recipient.id,
      amount,
      type: "transfer",
    });
    return this.getUser(sender.id)!;
  },

  // Admin
  adminAction(adminId: number, targetId: number, action: string, amount?: number) {
    const target = this.getUser(targetId);
    if (!target) throw new Error("User not found");

    if (action === "give" && amount) {
      this.updateUser(targetId, { balance: target.balance + amount });
      this.createTransaction({ fromUserId: adminId, toUserId: targetId, amount, type: "admin_gift" });
    } else if (action === "take" && amount) {
      this.updateUser(targetId, { balance: target.balance - amount });
      this.createTransaction({ fromUserId: targetId, toUserId: adminId, amount: -amount, type: "admin_take" });
    } else if (action === "suspend") {
      this.updateUser(targetId, { isSuspended: true });
    } else if (action === "unsuspend") {
      this.updateUser(targetId, { isSuspended: false });
    } else if (action === "make_admin") {
      this.updateUser(targetId, { isAdmin: true });
    } else if (action === "reset_password" && typeof amount === "undefined") {
      // amount is repurposed — we pass the new password as a string via a separate method
    }
    return this.getUser(targetId);
  },

  adminResetPassword(adminId: number, targetId: number, newPassword: string) {
    const admin = this.getUser(adminId);
    if (!admin?.isAdmin) throw new Error("Not authorized");
    const target = this.getUser(targetId);
    if (!target) throw new Error("User not found");
    this.updateUser(targetId, { password: newPassword });
    return this.getUser(targetId);
  },

  // Coupons
  getAllCoupons(): Coupon[] {
    return getItems<Coupon>(COUPONS_KEY);
  },

  createCoupon(data: { code: string; amount: number; maxUses: number; expiresAt?: string }) {
    const coupons = getItems<Coupon>(COUPONS_KEY);
    const coupon: Coupon = {
      id: nextId(coupons),
      code: data.code,
      amount: data.amount,
      maxUses: data.maxUses,
      usedCount: 0,
      expiresAt: data.expiresAt || null,
      createdAt: new Date().toISOString(),
    };
    coupons.push(coupon);
    setItems(COUPONS_KEY, coupons);
    return coupon;
  },

  redeemCoupon(userId: number, code: string): User {
    const coupons = getItems<Coupon>(COUPONS_KEY);
    const coupon = coupons.find(c => c.code === code);
    if (!coupon) throw new Error("Coupon not found");
    if (coupon.usedCount >= coupon.maxUses) throw new Error("Coupon expired");
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error("Coupon expired");

    const redemptions = getItems<CouponRedemption>(REDEMPTIONS_KEY);
    if (redemptions.find(r => r.userId === userId && r.couponId === coupon.id)) {
      throw new Error("Already redeemed");
    }

    redemptions.push({ userId, couponId: coupon.id });
    setItems(REDEMPTIONS_KEY, redemptions);

    const idx = coupons.findIndex(c => c.id === coupon.id);
    coupons[idx].usedCount++;
    setItems(COUPONS_KEY, coupons);

    const user = this.getUser(userId)!;
    this.updateUser(userId, { balance: user.balance + coupon.amount });
    this.createTransaction({ fromUserId: null, toUserId: userId, amount: coupon.amount, type: "coupon_redeem" });
    return this.getUser(userId)!;
  },
};

export interface User {
  id: number;
  username: string;
  password: string;
  balance: number;
  isAdmin: boolean;
  isSuspended: boolean;
  profilePicture: string | null;
  createdAt: string;
}

export interface Transaction {
  id: number;
  fromUserId: number | null;
  toUserId: number | null;
  amount: number;
  type: string;
  fromUsername?: string;
  toUsername?: string;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string | null;
  createdAt: string;
}

export interface CouponRedemption {
  userId: number;
  couponId: number;
}

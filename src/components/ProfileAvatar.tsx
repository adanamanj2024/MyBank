import { User } from "@/lib/types";
import { User as UserIcon } from "lucide-react";

interface ProfileAvatarProps {
  user: User | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-3xl",
};

export function ProfileAvatar({ user, size = "md", className = "" }: ProfileAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={`${user.username}'s profile`}
        className={`${sizeClass} rounded-full object-cover border-2 border-primary/20 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold ${className}`}>
      {user?.username ? user.username[0].toUpperCase() : <UserIcon className="w-1/2 h-1/2" />}
    </div>
  );
}

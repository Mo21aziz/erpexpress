// src/components/ui/user-profile.tsx
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface UserProfileProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  className?: string;
}

export const UserProfile = ({
  name,
  email,
  avatarUrl,
  className,
}: UserProfileProps) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Avatar className="h-10 w-10">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="bg-gradient-to-r from-green-600 to-red-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{name}</p>
        {email && <p className="text-sm text-gray-600">{email}</p>}
      </div>
    </div>
  );
};

import { User } from "lucide-react";

interface AuthorAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-lg",
};

export default function AuthorAvatar({ name, avatarUrl, size = "sm" }: AuthorAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-secondary/15 text-secondary font-headline font-bold`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

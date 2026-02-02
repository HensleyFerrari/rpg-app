import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserDocument } from "@/models/User";

interface ProfileHeaderProps {
  user: Partial<UserDocument>;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <Avatar className="h-24 w-24 border-2 border-primary/20">
        <AvatarImage src={user.avatarUrl} alt={user.name || "User"} />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
        <div className="flex gap-2 mt-2 justify-center md:justify-start">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {user.role === "admin" ? "Mestre do Jogo" : "Aventureiro"}
          </span>
        </div>
      </div>
    </div>
  );
}

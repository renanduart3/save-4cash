import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Share2 } from "lucide-react";

interface Profile {
  name: string;
  paymentName: string;
  paymentKey: string;
  avatarUrl?: string;
}

interface ProfileHeaderProps {
  onSettingsClick?: () => void;
  onShare?: () => void;
  profile?: Profile | null; // Permite profile ser null
}

const ProfileHeader = ({
  onSettingsClick = () => {},
  onShare = () => {},
  profile,
}: ProfileHeaderProps) => {
  const fallbackName = profile?.name || "John Doe";
  const fallbackAvatar =
    profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackName}`;

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-8">
      <div className="flex justify-end w-full gap-2">
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <Avatar className="h-24 w-24">
        <AvatarImage src={fallbackAvatar} />
        <AvatarFallback>{fallbackName.substring(0, 2)}</AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h2 className="text-xl font-semibold">{fallbackName}</h2>
        <p className="text-sm text-muted-foreground">😊</p>
      </div>
    </div>
  );
};

export default ProfileHeader;

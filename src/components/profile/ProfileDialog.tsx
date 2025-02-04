import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: {
    name: string;
    paymentName: string;
    paymentKey: string;
    avatarUrl?: string;
  } | null;
  onSave: (profile: {
    name: string;
    paymentName: string;
    paymentKey: string;
  }) => void;
}

const ProfileDialog = ({ open, onOpenChange, profile, onSave }: ProfileDialogProps) => {
  const [formData, setFormData] = useState(
    profile || { name: "", paymentName: "", paymentKey: "", avatarUrl: "" }
  );

  const isNewProfile = !profile; // Se não houver perfil, forçamos o preenchimento

  return (
    <Dialog
      open={open}
      onOpenChange={isNewProfile ? () => {} : onOpenChange} // Bloqueia fechamento se não houver perfil
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNewProfile ? "Create Your Profile" : "Edit Profile"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.avatarUrl} />
              <AvatarFallback>{formData.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Method Name</Label>
            <Input
              value={formData.paymentName}
              onChange={(e) => setFormData({ ...formData, paymentName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Key</Label>
            <Input
              value={formData.paymentKey}
              onChange={(e) => setFormData({ ...formData, paymentKey: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(formData)}>Save Changes</Button>
          {!isNewProfile && (
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;

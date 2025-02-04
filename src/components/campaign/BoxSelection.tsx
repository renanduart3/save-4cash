import { useState, useEffect } from "react";
import { db, Box, Profile, Campaign } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, X } from "lucide-react";

export function BoxSelection() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [contributorName, setContributorName] = useState("");
  const [editingBoxIndex, setEditingBoxIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const profileData = await db.profile.toArray();
      if (profileData.length > 0) setProfile(profileData[0]);
      console.log("load Profile", profileData);
      const campaignData = await db.campaigns.toArray();
      if (campaignData.length > 0) {
        setCampaign(campaignData[0]);
        setBoxes(campaignData[0].boxes || []);
      }
    };
    loadData();
  }, []);

  const toggleBox = (index: number) => {
    if (boxes[index].isPaid) return;
    setSelectedBoxes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getTotal = () => selectedBoxes.reduce((sum, index) => sum + boxes[index].value, 0);

  const shareSelection = () => {
    console.log("share button pressionado", profile);
    if (!profile || !campaign) return;
    console.log("share button continua");
    const message = `Help me reach my campaign of R$${campaign.targetAmount}!\n` +
      `Selected boxes total: R$${getTotal()}\n` +
      `PIX key: ${profile.pixKey}`;
    navigator.clipboard.writeText(message);
    toast({ title: "Copied!", description: "Message copied to clipboard" });
  };

  const handlePaymentSubmit = async () => {
    if (!campaign || !contributorName.trim()) return;
    
    // Calculate the total value of newly paid boxes
    const newlyPaidTotal = selectedBoxes.reduce((sum, index) => sum + boxes[index].value, 0);
    
    const newBoxes = [...boxes];
    selectedBoxes.forEach((index) => {
      newBoxes[index] = { 
        ...newBoxes[index], 
        isPaid: true, 
        contributorName: contributorName.trim() 
      };
    });

    // Update campaign with new boxes and increment currentAmount
    const updatedCampaign = {
      ...campaign,
      boxes: newBoxes,
      currentAmount: campaign.currentAmount + newlyPaidTotal
    };

    await db.campaigns.update(campaign.id!, updatedCampaign);
    
    setBoxes(newBoxes);
    setCampaign(updatedCampaign);
    setSelectedBoxes([]);
    setContributorName("");
    setIsPaymentDialogOpen(false);
    
    toast({ 
      title: "Success", 
      description: `Payment of R$${newlyPaidTotal} recorded successfully!` 
    });
  };

  const handleUnmarkPaid = async (index: number) => {
    if (!campaign) return;
    
    const boxValue = boxes[index].value;
    
    const newBoxes = [...boxes];
    newBoxes[index] = {
      ...newBoxes[index],
      isPaid: false,
      contributorName: undefined
    };
    
    // Update campaign with new boxes and decrement currentAmount
    const updatedCampaign = {
      ...campaign,
      boxes: newBoxes,
      currentAmount: campaign.currentAmount - boxValue
    };
    
    await db.campaigns.update(campaign.id!, updatedCampaign);
    
    setBoxes(newBoxes);
    setCampaign(updatedCampaign);
    
    toast({
      title: "Success",
      description: `Box unmarked as paid. Removed R$${boxValue} from total.`
    });
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    return (campaign.currentAmount / campaign.targetAmount) * 100;
  };

  const handleReturn = () => {
    navigate('/');
  };

  const handleEditClick = (index: number) => {
    setEditingBoxIndex(index);
    setContributorName(boxes[index].contributorName || '');
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!campaign || editingBoxIndex === null) return;
    
    const newBoxes = [...boxes];
    newBoxes[editingBoxIndex] = {
      ...newBoxes[editingBoxIndex],
      contributorName: contributorName.trim()
    };
    
    const updatedCampaign = {
      ...campaign,
      boxes: newBoxes
    };
    
    await db.campaigns.update(campaign.id!, updatedCampaign);
    
    setBoxes(newBoxes);
    setCampaign(updatedCampaign);
    setContributorName('');
    setEditingBoxIndex(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Contributor name updated successfully!"
    });
  };

  const getRemainingAmount = () => {
    if (!campaign) return 0;
    return campaign.targetAmount - campaign.currentAmount;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mb-12">
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2 text-primary">Campaign Progress</h2>
        <Progress value={calculateProgress()} className="h-2 mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress: {calculateProgress().toFixed(1)}%</span>
          <span>Raised: R${campaign?.currentAmount.toFixed(2) || '0.00'}</span>
          <span>Remaining: R${getRemainingAmount().toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {boxes.map((box, index) => (
          <div
            key={index}
            onClick={() => !box.isPaid && toggleBox(index)}
            className={`
              p-4 rounded-lg shadow cursor-pointer transition-all relative
              ${box.isPaid 
                ? 'bg-green-100 cursor-default' 
                : selectedBoxes.includes(index)
                  ? 'bg-primary text-white scale-105'
                  : 'bg-white hover:scale-105'
              }
            `}
          >
            <div className="text-xl font-bold text-center">R${box.value}</div>
            {box.isPaid && (
              <>
                <div className="text-sm text-center mt-2 text-green-700">
                  Paid by: {box.contributorName}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(index);
                    }}
                    className="p-1 hover:bg-green-200 rounded-full"
                  >
                    <Pencil className="h-4 w-4 text-green-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnmarkPaid(index);
                    }}
                    className="p-1 hover:bg-green-200 rounded-full"
                  >
                    <X className="h-4 w-4 text-green-700" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {selectedBoxes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="text-xl mb-2">Total: R${getTotal()}</div>
            <div className="flex gap-2">
              <Button onClick={shareSelection} className="flex-1">Share Selection</Button>
              <Button onClick={() => setIsPaymentDialogOpen(true)} className="flex-1" variant="secondary">Record Payment</Button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input placeholder="Contributor's name" value={contributorName} onChange={(e) => setContributorName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentSubmit}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contributor Name</DialogTitle>
            <DialogDescription>
              Update the name of the person who made this contribution
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Contributor's name"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BoxSelection;

import { useState, useEffect } from "react";
import ProfileDialog from "./profile/ProfileDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "./profile/ProfileHeader";
import CampaignOverview from "./campaign/CampaignOverview";
import CampaignHistory from "./campaign/CampaignHistory";
import CampaignCard from "./campaign/CampaignCard";
import BoxSelection from "./campaign/BoxSelection";
import CampaignCreationForm from "./campaign/CampaignCreationForm";
import { Button } from "./ui/button";
import PaymentDialog from "./campaign/PaymentDialog";
import { ArrowLeft } from "lucide-react";
import PaymentHistory from "./campaign/PaymentHistory";
import { useToast } from "./ui/use-toast";
import { db, Profile } from "@/lib/db";

const Home = () => {
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<
    Array<{ amount: number; paidBy: string; boxAmounts: number[] }>
  >([]);
  const [completedBoxes, setCompletedBoxes] = useState<number[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingBoxAmount, setEditingBoxAmount] = useState<number | null>(null);
  const [payerName, setPayerName] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const checkAndInitializeProfile = async () => {
      try {
        const existingProfiles = await db.profile.toArray();
        if (existingProfiles.length === 0) {
          setShowProfileDialog(true);
        } else {
          setProfile(existingProfiles[0]);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    checkAndInitializeProfile();
  }, []);

  const handleProfileSave = async (profileData: {
    name: string;
    paymentName: string;
    paymentKey: string;
  }) => {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`;

    try {
      const newProfile: Profile = {
        name: profileData.name,
        paymentName: profileData.paymentName,
        paymentKey: profileData.paymentKey,
        avatarUrl,
      };

      const id = await db.profile.add(newProfile);
      const savedProfile = await db.profile.get(id);
      setProfile(savedProfile || null);
      setShowProfileDialog(false);

      toast({
        title: "Profile Created",
        description: "Your profile has been set up successfully!",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
      });
    }
  };

  const handleBoxSelect = (amounts: number[]) => {
    setSelectedBoxes(amounts);
  };

  const handleGoalSubmit = (values: any) => {
    if (values.name && values.targetAmount) {
      setActiveCampaign(values);
      setShowGoalForm(false);
      setShowCampaign(true);
      toast({
        title: "Campaign Created",
        description: `Campaign "${values.name}" has been created successfully!`,
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields.",
      });
    }
  };

  if (showCampaign) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setShowCampaign(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="space-y-8">
            <CampaignCard
              name={activeCampaign?.name}
              targetAmount={activeCampaign?.targetAmount}
              endDate={activeCampaign?.endDate}
              currentAmount={paymentHistory.reduce((sum, payment) => sum + payment.amount, 0)}
            >
              <div className="mt-6">
                <BoxSelection
                  targetAmount={activeCampaign?.targetAmount}
                  onBoxSelect={handleBoxSelect}
                  selectedBoxes={selectedBoxes}
                  completedBoxes={completedBoxes}
                  paymentHistory={paymentHistory}
                  onEditBoxPayer={(amount) => {
                    const payment = paymentHistory.find((p) => p.boxAmounts.includes(amount));
                    if (payment) {
                      setEditingBoxAmount(amount);
                      setPayerName(payment.paidBy);
                      setShowPaymentDialog(true);
                    }
                  }}
                  onRemoveBoxPayment={(amount) => {
                    const newHistory = paymentHistory.filter((p) => !p.boxAmounts.includes(amount));
                    setPaymentHistory(newHistory);
                    setCompletedBoxes(completedBoxes.filter((b) => b !== amount));
                    toast({
                      title: "Payment Removed",
                      description: `Successfully removed payment for box R$${amount}`,
                    });
                  }}
                />
              </div>
            </CampaignCard>
          </div>

          <PaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            totalAmount={editingBoxAmount || selectedBoxes.reduce((sum, amount) => sum + amount, 0)}
            payerName={payerName}
            onPayerNameChange={setPayerName}
            editingBoxAmount={editingBoxAmount}
          />
        </div>
      </div>
    );
  }

  if (showGoalForm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setShowGoalForm(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-primary mb-8 text-center">
            Create Your Savings Goal
          </h1>
          <CampaignCreationForm onSubmit={handleGoalSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <ProfileHeader
          profile={profile}
          onSettingsClick={() => setShowProfileDialog(true)}
          onShare={() => {
            navigator.clipboard.writeText("https://play.google.com/store/apps/details?id=com.yourapp");
            toast({
              title: "App Link Copied!",
              description: "Share the app with your friends!",
            });
          }}
        />

        <ProfileDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          profile={profile}
          onSave={handleProfileSave}
        />

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">Active Campaign</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <CampaignOverview
              activeCampaign={activeCampaign}
              onCreateCampaign={() => setShowGoalForm(true)}
              onSelectCampaign={() => setShowCampaign(true)}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <CampaignHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;

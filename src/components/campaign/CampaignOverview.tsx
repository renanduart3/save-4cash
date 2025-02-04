import React, { useState, useEffect } from "react";
import { db, Campaign } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, CheckCircle, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const CampaignOverview = ({
  onCreateCampaign = () => {},
  onSelectCampaign = () => {},
  onCompleteCampaign = () => {},
}) => {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  const fetchActiveCampaign = async () => {
    try {
      const campaigns = await db.campaigns.toArray();
      if (campaigns.length > 0) {
        // Assuming the first campaign is the active one
        setActiveCampaign(campaigns[0]);
      } else {
        setActiveCampaign(null);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setActiveCampaign(null);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchActiveCampaign();

    // Set up a listener for database changes
    const handleDatabaseChange = () => {
      fetchActiveCampaign();
    };

    // You might want to add a more sophisticated way to track changes
    // This is a simple approach that refreshes on potential changes
    db.campaigns.hook('creating', handleDatabaseChange);
    db.campaigns.hook('updating', handleDatabaseChange);
    db.campaigns.hook('deleting', handleDatabaseChange);

    // Cleanup subscription
    return () => {
      db.campaigns.hook('creating').unsubscribe(handleDatabaseChange);
      db.campaigns.hook('updating').unsubscribe(handleDatabaseChange);
      db.campaigns.hook('deleting').unsubscribe(handleDatabaseChange);
    };
  }, []);

  if (!activeCampaign) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-background to-muted/50">
        <Trophy className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-center">
          No active campaign. Start saving today!
        </p>
        <Button onClick={onCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </Card>
    );
  }

  // Calculate the progress of the campaign
  const progress = (activeCampaign.currentAmount / activeCampaign.targetAmount) * 100;

  return (
    <Card
      className="p-6 cursor-pointer hover:bg-accent/10 transition-colors bg-gradient-to-br from-background to-muted/10"
      onClick={onSelectCampaign}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-xl flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {activeCampaign.name}
        </h3>
        {activeCampaign.isCompleted && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Completed
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Target: R${activeCampaign.targetAmount.toLocaleString()}
          </span>
          {activeCampaign.endDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Ends: {activeCampaign.endDate?.toLocaleDateString()}
            </span>
          )}
        </div>

        <Progress value={progress} className="h-2" />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress: {progress.toFixed(1)}%</span>
          <span>Raised: R${activeCampaign.currentAmount?.toLocaleString()}</span>
        </div>
      </div>

      {!activeCampaign.isCompleted && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevents the click from triggering onSelectCampaign
              onCompleteCampaign();
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finish Campaign
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CampaignOverview;
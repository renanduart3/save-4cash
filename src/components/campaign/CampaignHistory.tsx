import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface CampaignHistoryItem {
  name: string;
  startDate: Date;
  endDate: Date;
  amountSaved: number;
}

interface CampaignHistoryProps {
  campaigns?: CampaignHistoryItem[];
}

const CampaignHistory = ({
  campaigns = [
    {
      name: "New Car",
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-06-01"),
      amountSaved: 25000,
    },
    {
      name: "Vacation",
      startDate: new Date("2023-06-15"),
      endDate: new Date("2023-12-15"),
      amountSaved: 15000,
    },
  ],
}: CampaignHistoryProps) => {
  return (
    <div className="space-y-4">
      {campaigns.slice(0, 5).map((campaign, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{campaign.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <CalendarDays size={14} />
                <span>
                  {campaign.startDate.toLocaleDateString()} -{" "}
                  {campaign.endDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Saved</span>
              <p className="font-semibold text-green-600">
                R${campaign.amountSaved.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CampaignHistory;

import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Target } from "lucide-react";
import { motion } from "framer-motion";

interface CampaignCardProps {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  endDate?: Date;
  children?: React.ReactNode;
}

const CampaignCard = ({
  name = "New Campaign",
  targetAmount = 50000,
  currentAmount = 0,
  endDate = new Date("2024-12-31"),
  children,
}: CampaignCardProps) => {
  const progress = (currentAmount / targetAmount) * 100;
  const remainingAmount = targetAmount - currentAmount;
  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full p-6 bg-background shadow-lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-primary">{name}</h2>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays size={16} />
              <span>{formattedEndDate}</span>
            </div>
          </div>

          {/* Box Grid or other children */}
          {children}
        </div>
      </Card>
    </motion.div>
  );
};

export default CampaignCard;

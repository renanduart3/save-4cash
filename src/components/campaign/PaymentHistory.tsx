import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

interface Payment {
  amount: number;
  paidBy: string;
  boxAmounts: number[];
}

interface PaymentHistoryProps {
  payments: Payment[];
  onEditPayment: (index: number, newName: string) => void;
  onDeletePayment: (index: number) => void;
}

const PaymentHistory = ({
  payments,
  onEditPayment,
  onDeletePayment,
}: PaymentHistoryProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditName(currentName);
  };

  const handleSave = (index: number) => {
    onEditPayment(index, editName);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">Payment History</h3>
      {payments.map((payment, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-[200px]"
                    />
                    <Button size="sm" onClick={() => handleSave(index)}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <span className="font-medium">{payment.paidBy}</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                R${payment.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {editingIndex !== index && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(index, payment.paidBy)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeletePayment(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PaymentHistory;

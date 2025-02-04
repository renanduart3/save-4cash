import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PaymentDialogProps {
  editingBoxAmount?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  totalAmount: number;
  payerName: string;
  onPayerNameChange: (name: string) => void;
}

const PaymentDialog = ({
  open,
  onOpenChange,
  onConfirm,
  totalAmount,
  payerName,
  onPayerNameChange,
  editingBoxAmount,
}: PaymentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingBoxAmount ? "Edit Payment" : "Record Payment"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Amount</Label>
            <div className="text-lg font-semibold">
              R${totalAmount.toLocaleString()}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Paid By</Label>
            <Input
              value={payerName}
              onChange={(e) => onPayerNameChange(e.target.value)}
              placeholder="Enter name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {editingBoxAmount ? "Edit Payment" : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

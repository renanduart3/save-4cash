import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";

// Definindo o schema de validação com Zod
const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  targetAmount: z
    .number()
    .min(1000, "Amount must be at least R$1,000")
    .max(90000, "Amount cannot exceed R$90,000"),
  startDate: z.date(),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CampaignCreationFormProps {
  setActiveCampaign: (campaign: any) => void;
  onSubmit: (campaign: any) => void;
}

// Função para calcular as caixas com base no valor da campanha
function calculateBoxes(amount: number): number[] {
  let n = 1;
  while ((n * (n + 1)) / 2 < amount) {
    n++;
  }

  return Array.from({ length: n }, (_, i) => i + 1);
}

const CampaignCreationForm = ({ setActiveCampaign, onSubmit }: CampaignCreationFormProps) => {
  const [isDateEnabled, setIsDateEnabled] = useState(false);

  // Usando react-hook-form com validação Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 1000,
      startDate: new Date(),
      endDate: undefined,
    },
  });

  const { toast } = useToast();

  const handleSubmit = async (values: FormValues) => {
    try {
      console.log("Form Values:", values); // Verificando os valores do formulário

      const goalAmount = values.targetAmount; // Obtendo o valor do formulário

      if (goalAmount < 1000) {
        toast({
          title: "Invalid Amount",
          description: "The minimum value is R$ 1,000... now go work!",
          variant: "destructive",
        });
        return;
      }

      const boxes = calculateBoxes(goalAmount).map(value => ({
        value,
        isPaid: false,
      }));

      // Criando a campanha no banco de dados
      const newCampaign = await db.campaigns.add({
        name: values.name,
        description: values.description,
        targetAmount: goalAmount,
        currentAmount: 0,
        startDate: new Date(),
        endDate: isDateEnabled ? values.endDate : undefined,
        isCompleted: false,
        boxes: boxes,
      });

      console.log("Campaign created:", newCampaign);

      if (newCampaign) {
        setActiveCampaign(newCampaign);

        // CHAMANDO onSubmit PARA GARANTIR QUE handleGoalSubmit SEJA EXECUTADO
        onSubmit({
          id: newCampaign.id,
          name: values.name,
          description: values.description,
          targetAmount: goalAmount,
          currentAmount: 0,
          startDate: new Date(),
          endDate: isDateEnabled ? values.endDate : undefined,
          isCompleted: false,
          boxes: boxes,
        });

        toast({
          title: "Success",
          description: "Campaign created successfully!",
        });
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create the campaign. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Nome da campanha */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter campaign name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valor da meta */}
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Checkbox para data final */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="toggleEndDate"
              checked={isDateEnabled}
              onChange={() => setIsDateEnabled(!isDateEnabled)}
            />
            <label htmlFor="toggleEndDate">Enable End Date</label>
          </div>

          {/* Data final (aparece se o checkbox estiver marcado) */}
          {isDateEnabled && (
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline">
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full">
            Create Campaign
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default CampaignCreationForm;

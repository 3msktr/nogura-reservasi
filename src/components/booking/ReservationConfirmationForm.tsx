
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PhoneIcon, User, AlertCircle } from 'lucide-react';

// Form schema with validation
const confirmationFormSchema = z.object({
  contactName: z.string().min(3, { message: "Name must be at least 3 characters" }),
  phoneNumber: z.string()
    .min(9, { message: "Phone number must be at least 9 digits" })
    .max(15, { message: "Phone number must not exceed 15 digits" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  allergyNotes: z.string().optional(),
});

export type ConfirmationFormValues = z.infer<typeof confirmationFormSchema>;

interface ReservationConfirmationFormProps {
  onSubmit: (data: ConfirmationFormValues) => void;
  isLoading: boolean;
}

const ReservationConfirmationForm: React.FC<ReservationConfirmationFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const form = useForm<ConfirmationFormValues>({
    resolver: zodResolver(confirmationFormSchema),
    defaultValues: {
      contactName: '',
      phoneNumber: '',
      allergyNotes: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Enter your full name" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-3 flex items-center text-muted-foreground">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    <span className="text-xs">+62</span>
                  </div>
                  <Input 
                    className="pl-16" 
                    placeholder="8123456789" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergyNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Allergy Notes (Optional)</span>
                </div>
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please let us know if you have any allergies or dietary restrictions" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Confirm Reservation"}
        </Button>
      </form>
    </Form>
  );
};

export default ReservationConfirmationForm;

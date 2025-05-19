import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Simplified schema for quick concept creation
const simplifiedConceptSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Please provide a brief description"),
  enhanceWithAi: z.boolean().default(true),
});

export type SimplifiedConceptFormData = z.infer<typeof simplifiedConceptSchema>;

interface SimplifiedConceptFormProps {
  defaultValues?: Partial<SimplifiedConceptFormData>;
  onSubmit: (data: SimplifiedConceptFormData) => void;
  onBack?: () => void;
}

export function SimplifiedConceptForm({ defaultValues, onSubmit, onBack }: SimplifiedConceptFormProps) {
  const form = useForm<SimplifiedConceptFormData>({
    resolver: zodResolver(simplifiedConceptSchema),
    defaultValues: {
      name: "",
      description: "",
      enhanceWithAi: true,
      ...defaultValues
    },
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name Your Concept</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="A short, memorable name" 
                    {...field}
                    autoFocus 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quick Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Briefly describe your idea" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  You can add more details later
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="enhanceWithAi"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5 flex-1">
                  <FormLabel>AI Enhancement</FormLabel>
                  <FormDescription>
                    Let AI suggest improvements
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-2">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
            )}
            <Button type="submit">
              Create Concept
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
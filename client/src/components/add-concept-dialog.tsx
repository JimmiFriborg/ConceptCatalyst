import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { createConcept, generateProjectFeatureSuggestionsFromInfo } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddConceptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Concept form schema with proper game concept fields
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Concept name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  inspirations: z.string().optional(),
  targetAudience: z.string().min(3, {
    message: "Please specify who this is for.",
  }),
  enhanceWithAi: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function AddConceptDialog({ open, onOpenChange }: AddConceptDialogProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Initialize form with defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      inspirations: "",
      targetAudience: "",
      enhanceWithAi: true,
    },
  });
  
  // Reset form when dialog is opened/closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  // Submit handler
  const onSubmit = async (data: FormValues) => {
    try {
      console.log('Creating concept:', data);
      
      // Parse inspirations into an array
      const inspirationsArray = data.inspirations ? 
        data.inspirations.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      
      const concept = await createConcept({
        name: data.name,
        description: data.description,
        inspirations: inspirationsArray,
        targetAudience: data.targetAudience,
        potentialFeatures: [],
        isAiConcept: false,
        aiPotential: "",
        tags: [],
        enhanceWithAi: data.enhanceWithAi,
      });
      
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Concept created successfully",
        description: `"${data.name}" has been added to your concepts.`,
      });
      
      // Close dialog and reset form
      handleOpenChange(false);
      
      // Generate AI suggestions if enabled
      if (data.enhanceWithAi) {
        try {
          console.log('Generating suggestions from project info:', {
            mission: data.inspirations,
            goals: [],
            inScope: [],
            outOfScope: []
          });
          
          await generateProjectFeatureSuggestionsFromInfo(concept.id, {
            mission: data.inspirations || "",
            goals: [],
            inScope: [],
            outOfScope: []
          });
          
          toast({
            title: "Feature suggestions generated",
            description: "8 feature suggestions have been created based on your project information.",
          });
        } catch (suggestionError) {
          console.error("Error generating AI suggestions:", suggestionError);
          // Don't fail the concept creation if AI suggestions fail
        }
      }
      
      // Navigate to the new concept
      navigate(`/projects/${concept.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create concept.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Game Concept</DialogTitle>
          <DialogDescription>
            Create a quick game concept to explore ideas and features.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your game concept name" {...field} />
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
                  <FormLabel>Game Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your game concept, gameplay, and core mechanics" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspirations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspirations (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Games that inspire this concept (e.g., Hades, Celeste, Stardew Valley)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is this game for?</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Target audience (e.g., casual gamers, hardcore RPG fans, puzzle enthusiasts)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enhanceWithAi"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Generate AI feature suggestions
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Let AI suggest features based on your concept and inspirations
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Create Concept</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
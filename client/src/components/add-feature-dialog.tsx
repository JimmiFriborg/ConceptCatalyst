import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  CodeIcon, 
  LineChartIcon, 
  SmileIcon, 
  ShieldAlertIcon,
  Loader2Icon
} from "lucide-react";
import { useProject } from "@/context/project-context";
import { createFeature, analyzeFeature } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Perspective, Category } from "@shared/schema";

interface AddFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Feature form schema with zod validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Feature name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  perspective: z.enum(["technical", "business", "ux", "security"] as const),
  category: z.enum(["mvp", "launch", "v1.5", "v2.0"] as const),
});

type FormValues = z.infer<typeof formSchema>;

export function AddFeatureDialog({ open, onOpenChange }: AddFeatureDialogProps) {
  const { currentProjectId } = useProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      perspective: "technical",
      category: "mvp",
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
    if (!currentProjectId) {
      toast({
        title: "Error",
        description: "No project selected.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createFeature(currentProjectId, {
        name: data.name,
        description: data.description,
        perspective: data.perspective,
        category: data.category,
      });
      
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${currentProjectId}/features`] 
      });
      
      toast({
        title: "Feature created",
        description: "New feature has been added successfully.",
      });
      
      // Close dialog and reset form
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feature.",
        variant: "destructive",
      });
    }
  };

  // Analyze feature with AI
  const handleAnalyzeFeature = async () => {
    const { name, description } = form.getValues();
    
    if (name.length < 3 || description.length < 10) {
      form.trigger(["name", "description"]);
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeFeature({
        name,
        description,
      });
      
      // Update the form with the AI suggestion
      if (result.suggestedCategory) {
        form.setValue("category", result.suggestedCategory as Category);
      }
      
      toast({
        title: "AI Analysis Complete",
        description: `Suggested category: ${result.suggestedCategory}. ${result.rationale}`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Could not analyze feature.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
          <DialogDescription>
            Create a new feature for your project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feature Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter feature name" {...field} />
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
                  <FormLabel>Description / Rationale</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the feature and why it's needed" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="perspective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perspective</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select perspective" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technical">
                          <div className="flex items-center">
                            <CodeIcon className="h-4 w-4 mr-2 text-blue-500" />
                            Technical
                          </div>
                        </SelectItem>
                        <SelectItem value="business">
                          <div className="flex items-center">
                            <LineChartIcon className="h-4 w-4 mr-2 text-green-500" />
                            Business
                          </div>
                        </SelectItem>
                        <SelectItem value="ux">
                          <div className="flex items-center">
                            <SmileIcon className="h-4 w-4 mr-2 text-amber-500" />
                            UX/UI
                          </div>
                        </SelectItem>
                        <SelectItem value="security">
                          <div className="flex items-center">
                            <ShieldAlertIcon className="h-4 w-4 mr-2 text-red-500" />
                            Security
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mvp">MVP (Must Have)</SelectItem>
                        <SelectItem value="launch">Launch</SelectItem>
                        <SelectItem value="v1.5">Version 1.5</SelectItem>
                        <SelectItem value="v2.0">Version 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleAnalyzeFeature}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlertIcon className="mr-2 h-4 w-4" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>
              <Button type="submit">Add Feature</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

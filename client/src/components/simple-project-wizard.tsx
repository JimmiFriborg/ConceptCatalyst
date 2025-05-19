import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { createProject } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Brain } from "lucide-react";
import { AiFeatureSuggestionDialog } from "./ai-feature-suggestion-dialog";

interface SimpleProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Simple project schema with zod validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Project description must be at least 10 characters",
  }),
  mission: z.string().optional(),
  generateAiSuggestions: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function SimpleProjectWizard({ open, onOpenChange }: SimpleProjectWizardProps) {
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [newProjectId, setNewProjectId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [projectInfo, setProjectInfo] = useState<{
    mission?: string;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
  }>({});

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      mission: "",
      generateAiSuggestions: true,
    },
  });

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    
    try {
      // Create the project
      const project = await createProject({
        name: values.name,
        description: values.description,
        mission: values.mission || values.description,
      });
      
      // Update the project list
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      // Show success message
      toast({
        title: "Project created",
        description: "Your project has been created successfully",
      });
      
      // Close the dialog
      handleOpenChange(false);
      
      // Set up for AI suggestions
      if (values.generateAiSuggestions) {
        setNewProjectId(project.id);
        setProjectInfo({
          mission: values.mission || values.description,
          goals: [],
          inScope: [],
          outOfScope: [],
        });
        setShowSuggestions(true);
      } else {
        // Navigate to the project view
        navigate(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle suggestions dialog close
  const handleCloseSuggestionsDialog = (open: boolean) => {
    setShowSuggestions(open);
    
    if (!open && newProjectId) {
      // Navigate to the project view
      navigate(`/projects/${newProjectId}`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details to create your new project and optionally get AI-generated feature suggestions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="ai">AI Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project"
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear description of what this project aims to accomplish.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Mission (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Define the mission of your project"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The core mission of your project helps AI generate better feature suggestions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-4 mt-4">
                  <div className="rounded-lg bg-blue-50 p-4 mb-4">
                    <div className="flex gap-3">
                      <Brain className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900">AI-Generated Features</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Our AI can suggest features for your project based on your project description and mission.
                        </p>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Get features from multiple perspectives (Technical, Business, UX, Security)</li>
                          <li>• Review and select which features to add to your project</li>
                          <li>• Save time on initial project planning</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="generateAiSuggestions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Generate AI Suggestions</FormLabel>
                          <FormDescription>
                            Get feature suggestions after creating the project
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
                  
                  <div className="rounded-lg bg-amber-50 p-3 mt-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        AI feature suggestions require an OpenAI API key to be configured.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenChange(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* AI Feature Suggestion Dialog */}
      {showSuggestions && newProjectId && (
        <AiFeatureSuggestionDialog
          open={showSuggestions}
          onOpenChange={handleCloseSuggestionsDialog}
          projectId={newProjectId}
          projectInfo={projectInfo}
        />
      )}
    </>
  );
}
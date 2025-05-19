import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { createProject } from "@/lib/api";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { AiFeatureSuggestionDialog } from "./ai-feature-suggestion-dialog";

interface EnhancedProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Project wizard schema with zod validation
const formSchema = z.object({
  // Basic Project Info
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Please provide a meaningful description (at least 10 characters).",
  }),
  
  // Mission & Goals
  mission: z.string().min(10, {
    message: "Project mission should be at least 10 characters.",
  }),
  primaryGoal: z.string().min(5, {
    message: "Primary goal is required (at least 5 characters).",
  }),
  secondaryGoals: z.string().optional(),
  
  // Scope Definition
  inScope: z.string().min(10, {
    message: "Please define what's in scope for this project.",
  }),
  outOfScope: z.string().min(10, {
    message: "Please define what's out of scope for this project.",
  }),
  constraints: z.string().optional(),
  
  // AI Features
  generateAiSuggestions: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function EnhancedProjectWizard({ open, onOpenChange }: EnhancedProjectWizardProps) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProjectId, setNewProjectId] = useState<number | null>(null);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [projectInfo, setProjectInfo] = useState<{
    mission?: string;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
  }>({});

  // Define wizard steps
  const steps = [
    "Basic Information",
    "Mission & Goals",
    "Scope Definition",
    "AI Features"
  ];
  
  const totalSteps = steps.length;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      mission: "",
      primaryGoal: "",
      secondaryGoals: "",
      inScope: "",
      outOfScope: "",
      constraints: "",
      generateAiSuggestions: true
    }
  });

  // Reset form when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setStep(1);
    }
    onOpenChange(open);
  };

  // Handle form navigation
  const handleNext = () => {
    const fields = getFieldsForStep(step);
    
    // Validate current step fields
    const stepValid = fields.every(field => {
      const value = form.getValues(field as any);
      return value !== undefined && value !== "";
    });
    
    if (stepValid) {
      setStep(step + 1);
    } else {
      // Trigger validation on the fields for this step
      form.trigger(fields as any);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };
  
  const getFieldsForStep = (stepNumber: number): (keyof FormValues)[] => {
    switch (stepNumber) {
      case 1:
        return ["name", "description"];
      case 2:
        return ["mission", "primaryGoal", "secondaryGoals"];
      case 3:
        return ["inScope", "outOfScope", "constraints"];
      case 4:
        return ["generateAiSuggestions"];
      default:
        return [];
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Process text fields into arrays
      const goalsArray = [
        data.primaryGoal,
        ...(data.secondaryGoals ? data.secondaryGoals.split("\n").filter(Boolean) : [])
      ];
      
      const inScopeArray = data.inScope.split("\n").filter(Boolean);
      const outOfScopeArray = data.outOfScope.split("\n").filter(Boolean);
      const constraintsArray = data.constraints ? data.constraints.split("\n").filter(Boolean) : [];
      
      // Create project
      const project = await createProject({
        name: data.name,
        description: data.description,
        mission: data.mission,
        goals: goalsArray,
        inScope: inScopeArray,
        outOfScope: outOfScopeArray,
        constraints: constraintsArray
      });
      
      // Set up for AI suggestions
      if (data.generateAiSuggestions) {
        setNewProjectId(project.id);
        setProjectInfo({
          mission: data.mission,
          goals: goalsArray,
          inScope: inScopeArray,
          outOfScope: outOfScopeArray
        });
      }
      
      // Refresh project list
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project created successfully",
        description: `Project "${data.name}" has been created.`,
      });
      
      // Close wizard
      handleDialogChange(false);
      
      // Show AI suggestions or navigate
      if (data.generateAiSuggestions) {
        setShowSuggestionsDialog(true);
      } else {
        navigate(`/projects/${project.id}`);
      }
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle closing the suggestions dialog
  const handleSuggestionsDialogClose = (open: boolean) => {
    setShowSuggestionsDialog(open);
    
    if (!open && newProjectId) {
      // Navigate to project when dialog closes
      navigate(`/projects/${newProjectId}`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          {/* Progress indicator */}
          <div className="relative mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((stepName, i) => (
                <div key={i} className={`text-xs font-medium ${
                  i + 1 === step ? 'text-primary' : 
                  i + 1 < step ? 'text-primary/60' : 'text-muted-foreground'
                }`}>
                  {stepName}
                </div>
              ))}
            </div>
            <div className="w-full h-1 bg-muted rounded-full">
              <div 
                className="h-1 bg-primary rounded-full transition-all" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div>
                  <div className="space-y-4">
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
                              placeholder="Enter a detailed description of your project"
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a clear overview of what this project aims to accomplish.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {/* Step 2: Mission & Goals */}
              {step === 2 && (
                <div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Mission</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What is the core mission of this project?"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Define the overarching purpose and mission of your project.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="primaryGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Goal</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter the main goal of this project"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Goals</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter additional goals (one per line)"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            List additional goals, one per line. These will help AI generate relevant features.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {/* Step 3: Scope Definition */}
              {step === 3 && (
                <div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="inScope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>In Scope</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What is included in this project (one item per line)"
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Define what should be included in this project (features, functionality, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="outOfScope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Out of Scope</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What is excluded from this project (one item per line)"
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Define what should be excluded from this project to maintain focus.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="constraints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Constraints</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List project constraints (one item per line)"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            List any limitations or constraints that may affect the project (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {/* Step 4: AI Features */}
              {step === 4 && (
                <div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium mb-4">AI-Powered Features</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Our AI can help jump-start your project by suggesting features based on your project information.
                      </p>
                      
                      <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Generate feature ideas from multiple perspectives (Technical, Security, Business, UX)</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Get suggested feature priorities based on your project scope</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>Review and customize before adding to your project</span>
                        </li>
                      </ul>
                      
                      <FormField
                        control={form.control}
                        name="generateAiSuggestions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 mt-4 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Generate AI feature suggestions</FormLabel>
                              <FormDescription>
                                Automatically suggest features after project creation
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
                      
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md p-3 mt-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-xs text-amber-800 dark:text-amber-300">
                            AI feature suggestions require an OpenAI API key
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-6">
                      <h3 className="font-medium mb-4">Project Summary</h3>
                      <div className="space-y-4 text-sm">
                        <div>
                          <span className="font-medium">Project Name: </span>
                          <span>{form.getValues("name")}</span>
                        </div>
                        <div>
                          <span className="font-medium">Mission: </span>
                          <span className="text-slate-600">{form.getValues("mission")}</span>
                        </div>
                        <div>
                          <span className="font-medium">Primary Goal: </span>
                          <span className="text-slate-600">{form.getValues("primaryGoal")}</span>
                        </div>
                        <div>
                          <span className="font-medium">In Scope: </span>
                          <div className="mt-1 pl-2 space-y-1 text-slate-600">
                            {form.getValues("inScope").split("\n").filter(Boolean).map((item, i) => (
                              <div key={i} className="flex items-baseline">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex justify-between">
                <div>
                  {step > 1 && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                </div>
                
                <div>
                  {step < totalSteps ? (
                    <Button 
                      type="button"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Project"}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* AI Feature Suggestion Dialog */}
      {showSuggestionsDialog && newProjectId && (
        <AiFeatureSuggestionDialog
          open={showSuggestionsDialog}
          onOpenChange={handleSuggestionsDialogClose}
          projectId={newProjectId}
          projectInfo={projectInfo}
        />
      )}
    </>
  );
}
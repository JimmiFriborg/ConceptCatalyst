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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { createProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AiFeatureSuggestionDialog } from "@/components/ai-feature-suggestion-dialog";

// Simple schema for project validation
const formSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  mission: z.string().min(10, { message: "Mission should be at least 10 characters" }),
  primaryGoal: z.string().min(5, { message: "Primary goal is required" }),
  secondaryGoals: z.string().optional(),
  inScope: z.string().min(10, { message: "In-scope definition is required" }),
  outOfScope: z.string().min(10, { message: "Out-of-scope definition is required" }),
  constraints: z.string().optional(),
  generateAiSuggestions: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectWizardNew({ open, onOpenChange }: ProjectWizardProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
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

  // Move to next step
  const handleNext = async () => {
    let fieldGroup: (keyof FormValues)[] = [];
    
    if (step === 1) fieldGroup = ["name", "description"];
    else if (step === 2) fieldGroup = ["mission", "primaryGoal"]; 
    else if (step === 3) fieldGroup = ["inScope", "outOfScope"];
    
    const valid = await form.trigger(fieldGroup);
    if (valid) setStep(Math.min(step + 1, steps.length));
  };

  // Move to previous step
  const handlePrevious = () => {
    setStep(Math.max(step - 1, 1));
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
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog closure
  const handleSuggestionsDialogClose = () => {
    setShowSuggestionsDialog(false);
    if (newProjectId) {
      navigate(`/projects/${newProjectId}`);
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 1: // Basic Info
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Provide a brief overview of this project.
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project..." 
                      className="h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 2: // Mission & Goals
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Define the overarching purpose of this project.
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="What is the mission of this project?" 
                      className="h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="primaryGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Goal <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    What is the main outcome you want to achieve?
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Enter primary goal" {...field} />
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
                  <FormDescription>
                    Add additional goals, one per line (optional).
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter secondary goals (one per line)..." 
                      className="h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 3: // Scope
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="inScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In Scope <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Define what is included in this project (one item per line).
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="What features or elements are in scope?" 
                      className="h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="outOfScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Out of Scope <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Define what is excluded from this project (one item per line).
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="What will NOT be included in this project?" 
                      className="h-[120px]"
                      {...field} 
                    />
                  </FormControl>
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
                  <FormDescription>
                    List any limitations (time, budget, technical, etc.).
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Any constraints? (optional)" 
                      className="h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 4: // AI Features
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">AI Feature Suggestions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Based on your project details, our AI can suggest potential features to jumpstart your planning.
                  </p>
                  <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Generate ideas from multiple perspectives</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Prioritize features based on your scope</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>Customize before adding to your project</span>
                    </li>
                  </ul>
                  
                  <FormField
                    control={form.control}
                    name="generateAiSuggestions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 mt-4 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Generate AI suggestions</FormLabel>
                          <FormDescription>
                            Suggest features after project creation
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
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h3 className="font-medium mb-4">Project Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Project Name: </span>
                  <span>{form.getValues("name")}</span>
                </div>
                <div>
                  <span className="font-medium">Mission: </span>
                  <span className="text-gray-600 dark:text-gray-400">{form.getValues("mission")}</span>
                </div>
                <div>
                  <span className="font-medium">Primary Goal: </span>
                  <span className="text-gray-600 dark:text-gray-400">{form.getValues("primaryGoal")}</span>
                </div>
                <div>
                  <span className="font-medium">In Scope: </span>
                  <div className="mt-1 pl-2 space-y-1 text-gray-600 dark:text-gray-400">
                    {form.getValues("inScope").split("\n").filter(Boolean).map((item, i) => (
                      <div key={i} className="flex items-baseline">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Out of Scope: </span>
                  <div className="mt-1 pl-2 space-y-1 text-gray-600 dark:text-gray-400">
                    {form.getValues("outOfScope").split("\n").filter(Boolean).map((item, i) => (
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
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Wizard</DialogTitle>
            <DialogDescription>
              Define your project details to get started.
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {steps.map((title, index) => (
                <div 
                  key={index} 
                  className={`flex-1 text-center ${index < steps.length - 1 ? 'border-b-2 border-gray-200 dark:border-gray-700 pb-2 relative' : 'pb-2'}`}
                >
                  <div 
                    className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full 
                      ${step > index + 1 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                        : step === index + 1 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                      }
                      mb-1
                    `}
                  >
                    {step > index + 1 ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className={`
                    text-xs 
                    ${step === index + 1 
                      ? 'font-medium text-blue-600 dark:text-blue-300' 
                      : step > index + 1 
                        ? 'font-medium text-green-600 dark:text-green-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {title}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute h-0.5 w-full top-4 left-1/2 ${
                      step > index + 1 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {renderStepContent()}
              
              <DialogFooter className="flex justify-between mt-6">
                <div>
                  {step > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePrevious}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                </div>
                
                <div>
                  {step < steps.length ? (
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
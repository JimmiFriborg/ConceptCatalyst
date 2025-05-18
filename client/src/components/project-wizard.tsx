import { useState, useEffect } from "react";
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
  Target, 
  ListChecks, 
  AlertTriangle, 
  Check,
  Asterisk,
  Sparkles
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch as UISwitch } from "@/components/ui/switch";
import { AiFeatureSuggestionDialog } from "@/components/ai-feature-suggestion-dialog";

interface ProjectWizardProps {
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

export function ProjectWizard({ open, onOpenChange }: ProjectWizardProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProjectId, setNewProjectId] = useState<number | null>(null);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [projectInfo, setProjectInfo] = useState<{
    mission?: string;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
  }>({});
  
  // Cache key for storing form data in localStorage
  const CACHE_KEY = 'project_wizard_cache';
  
  // Wizard steps
  const totalSteps = 4;
  const stepTitles = [
    "Basic Information",
    "Mission & Goals",
    "Scope Definition",
    "AI Features"
  ];
  
  // Function to save form data to localStorage
  const saveFormData = (data: Partial<FormValues>) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  };
  
  // Function to load form data from localStorage
  const loadFormData = (): Partial<FormValues> | null => {
    try {
      const savedData = localStorage.getItem(CACHE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
    }
    return null;
  };
  
  // Function to clear saved form data
  const clearFormData = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  };
  
  // Get any cached form data
  const cachedData = loadFormData();
  
  // Initialize form with cached data or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: cachedData || {
      name: "",
      description: "",
      mission: "",
      primaryGoal: "",
      secondaryGoals: "",
      inScope: "",
      outOfScope: "",
      constraints: "",
      generateAiSuggestions: true
    },
    mode: "onChange"
  });
  
  // Set up auto-save for form changes
  useEffect(() => {
    // Create a subscription to watch for form changes
    const subscription = form.watch((value) => {
      // Debounce the save to avoid excessive writes
      const timeoutId = setTimeout(() => {
        saveFormData(value as FormValues);
      }, 1000); // Save 1 second after typing stops
      
      // Clean up timeout on next change
      return () => clearTimeout(timeoutId);
    });
    
    // Clean up subscription on component unmount
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Reset form and step when dialog is opened/closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // When closing, save current form data to cache
      saveFormData(form.getValues());
    } else {
      // When opening, load any cached data
      const cachedData = loadFormData();
      if (cachedData) {
        form.reset(cachedData);
        // Optionally show a toast notification about restored data
        toast({
          title: "Recovered unsaved data",
          description: "Your previous progress has been restored.",
        });
      }
    }
    
    setStep(1);
    onOpenChange(open);
  };

  // Handle going to the next step
  const handleNext = async () => {
    const fieldsToValidate = step === 1 
      ? ["name", "description"] 
      : step === 2 
        ? ["mission", "primaryGoal"] 
        : step === 3
          ? ["inScope", "outOfScope"]
          : [];

    // Only validate if there are fields to validate
    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate as any);
      if (!isValid) return; // Stop if validation fails
    }
    
    // Save form data when advancing to the next step
    saveFormData(form.getValues());
    
    // If we get here, validation passed or wasn't needed
    setStep(current => Math.min(current + 1, totalSteps));
  };

  // Handle going to the previous step
  const handlePrevious = () => {
    // Save form data when going back
    saveFormData(form.getValues());
    setStep(current => Math.max(current - 1, 1));
  };

  // Submit the full form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Process secondary goals into an array
      const goalsArray = [
        data.primaryGoal,
        ...(data.secondaryGoals ? data.secondaryGoals.split("\n").filter(Boolean) : [])
      ];
      
      // Process scope items into arrays
      const inScopeArray = data.inScope.split("\n").filter(Boolean);
      const outOfScopeArray = data.outOfScope.split("\n").filter(Boolean);
      const constraintsArray = data.constraints ? data.constraints.split("\n").filter(Boolean) : [];
      
      // Create the project with all wizard data
      const project = await createProject({
        name: data.name,
        description: data.description,
        mission: data.mission,
        goals: goalsArray,
        inScope: inScopeArray,
        outOfScope: outOfScopeArray,
        constraints: constraintsArray
      });
      
      // Save project ID and info for AI suggestions if requested
      if (data.generateAiSuggestions) {
        setNewProjectId(project.id);
        setProjectInfo({
          mission: data.mission,
          goals: goalsArray,
          inScope: inScopeArray,
          outOfScope: outOfScopeArray
        });
      }
      
      // Project created successfully - clear the form cache
      clearFormData();
      
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project created",
        description: "New project has been created with defined scope and goals.",
      });
      
      // Close the wizard dialog
      handleOpenChange(false);
      
      // Show AI suggestions dialog if the user opted for it
      if (data.generateAiSuggestions) {
        setShowSuggestionsDialog(true);
      } else {
        // Navigate to the new project
        navigate(`/projects/${project.id}`);
      }
    } catch (error) {
      // On error, save the form data so user doesn't lose their work
      saveFormData(form.getValues());
      
      toast({
        title: "Error",
        description: "Failed to create project. Your progress has been saved.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle closing the AI suggestions dialog
  const handleCloseSuggestionsDialog = () => {
    setShowSuggestionsDialog(false);
    if (newProjectId) {
      navigate(`/projects/${newProjectId}`);
    }
  };

  // Render the current step of the wizard
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
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
                    <FormLabel>Project Description <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      Provide a brief overview of what this project is about.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project in a few sentences" 
                        className="min-h-[100px] max-h-[300px] overflow-y-auto"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      case 2:
        return (
          <>
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
                        className="min-h-[80px]"
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
                      What is the most important outcome you want to achieve?
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Enter the primary goal" {...field} />
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
                      Add any additional goals, one per line (optional).
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter secondary goals (optional)" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="inScope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In Scope <span className="text-red-500">*</span></FormLabel>
                    <FormDescription>
                      Define what is included in this project's scope. Add one item per line.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="What features or elements are definitely in scope?"
                        className="min-h-[80px]"
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
                      Define what is explicitly excluded from this project. Add one item per line.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="What will NOT be included in this project?"
                        className="min-h-[80px]"
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
                      List any limitations or constraints (time, budget, technical, etc.). One per line.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Any constraints to be aware of? (optional)" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );
      
      case 4:
        return (
          <>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-6 border border-blue-100 dark:border-blue-900">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">AI Feature Suggestions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Based on your project details, our AI can suggest potential features to jumpstart your project planning.
                    </p>
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
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
                            <UISwitch
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
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
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
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Initiation Wizard</DialogTitle>
            <DialogDescription>
              Let's define the scope and goals of your new project.
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => (
                <div 
                  key={index} 
                  className={`flex-1 text-center ${index < stepTitles.length - 1 ? 'border-b-2 border-gray-200 dark:border-gray-700 pb-2 relative' : 'pb-2'}`}
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
                  {index < stepTitles.length - 1 && (
                    <div className={`absolute h-0.5 w-full top-4 left-1/2 ${
                      step > index + 1 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
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
          onOpenChange={handleCloseSuggestionsDialog}
          projectId={newProjectId}
          projectInfo={projectInfo}
        />
      )}
    </>
  );
}
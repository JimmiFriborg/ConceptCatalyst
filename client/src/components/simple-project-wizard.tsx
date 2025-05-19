import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { AiFeatureSuggestionDialog } from "@/components/ai-feature-suggestion-dialog";
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, AlertTriangle 
} from "lucide-react";

// Relaxed schema with minimal validation for maximum stability
const schema = z.object({
  name: z.string().min(1, "Name is required").default(""),
  description: z.string().default(""),
  mission: z.string().default(""),
  primaryGoal: z.string().default(""),
  secondaryGoals: z.string().optional().default(""),
  inScope: z.string().default(""),
  outOfScope: z.string().default(""),
  constraints: z.string().optional().default(""),
  generateSuggestions: z.boolean().default(true),
  // Added concept tracking fields
  trackConcepts: z.boolean().default(true),
  frankensteinFeatures: z.boolean().default(false)
});

type FormData = z.infer<typeof schema>;

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "project" | "concept";
}

export function SimpleProjectWizard({ open, onOpenChange, type = "project" }: WizardProps) {
  const [step, setStep] = useState(1);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newProjectId, setNewProjectId] = useState<number | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>({});
  
  // Create a completely separate form for each step to avoid any state issues
  const step1Form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: ""
    }
  });
  
  const step2Form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mission: "",
      primaryGoal: "",
      secondaryGoals: ""
    }
  });
  
  const step3Form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      inScope: "",
      outOfScope: "",
      constraints: ""
    }
  });
  
  const step4Form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      generateSuggestions: true
    }
  });
  
  // Reset all state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      step1Form.reset();
      step2Form.reset();
      step3Form.reset();
      step4Form.reset();
    }
    onOpenChange(open);
  };

  // Simple next step handler
  const goToNextStep = () => {
    // Just advance to the next step without validation for now
    // This ensures we can always get to the next step
    setStep(Math.min(step + 1, 4));
  };
  
  // Simple previous step handler
  const goToPreviousStep = () => {
    setStep(Math.max(step - 1, 1));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Get values from all forms
      const basicInfo = step1Form.getValues();
      const missionInfo = step2Form.getValues();
      const scopeInfo = step3Form.getValues();
      const aiInfo = step4Form.getValues();
      
      // Process text fields into arrays
      const goalsArray = [
        missionInfo.primaryGoal,
        ...(missionInfo.secondaryGoals ? 
          missionInfo.secondaryGoals.split('\n').filter(Boolean) : [])
      ];
      
      const inScopeArray = scopeInfo.inScope.split('\n').filter(Boolean);
      const outOfScopeArray = scopeInfo.outOfScope.split('\n').filter(Boolean);
      const constraintsArray = scopeInfo.constraints ? 
        scopeInfo.constraints.split('\n').filter(Boolean) : [];
      
      // Create the project
      const project = await createProject({
        name: basicInfo.name,
        description: basicInfo.description,
        mission: missionInfo.mission,
        goals: goalsArray,
        inScope: inScopeArray,
        outOfScope: outOfScopeArray,
        constraints: constraintsArray
      });
      
      // Prepare for AI suggestions if requested
      if (aiInfo.generateSuggestions) {
        setNewProjectId(project.id);
        setProjectInfo({
          mission: missionInfo.mission,
          goals: goalsArray,
          inScope: inScopeArray,
          outOfScope: outOfScopeArray
        });
      }
      
      // Update UI
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: `${type === "concept" ? "Concept" : "Project"} created`,
        description: `Your ${type} has been created successfully.`
      });
      
      // Close dialog
      handleOpenChange(false);
      
      // Show AI suggestions dialog or navigate
      if (aiInfo.generateSuggestions) {
        setShowSuggestions(true);
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
      setSubmitting(false);
    }
  };
  
  // Handle closing the AI suggestions dialog
  const handleCloseSuggestionsDialog = () => {
    setShowSuggestions(false);
    if (newProjectId) {
      navigate(`/projects/${newProjectId}`);
    }
  };
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-sm">Project Name</label>
              <Input 
                {...step1Form.register("name")}
                placeholder="Enter project name" 
              />
              {step1Form.formState.errors.name && (
                <p className="text-sm text-red-500">{step1Form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Project Description</label>
              <Textarea 
                {...step1Form.register("description")}
                placeholder="Describe your project" 
                rows={5}
              />
              {step1Form.formState.errors.description && (
                <p className="text-sm text-red-500">{step1Form.formState.errors.description.message}</p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-sm">Mission Statement</label>
              <p className="text-xs text-gray-500">Define the overarching purpose of your project</p>
              <Textarea 
                {...step2Form.register("mission")}
                placeholder="Enter project mission" 
                rows={3}
              />
              {step2Form.formState.errors.mission && (
                <p className="text-sm text-red-500">{step2Form.formState.errors.mission.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Primary Goal</label>
              <Input 
                {...step2Form.register("primaryGoal")}
                placeholder="Enter main goal" 
              />
              {step2Form.formState.errors.primaryGoal && (
                <p className="text-sm text-red-500">{step2Form.formState.errors.primaryGoal.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Secondary Goals (optional)</label>
              <p className="text-xs text-gray-500">One goal per line</p>
              <Textarea 
                {...step2Form.register("secondaryGoals")}
                placeholder="Enter secondary goals (one per line)" 
                rows={4}
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-medium text-sm">In Scope</label>
              <p className="text-xs text-gray-500">What's included in this project? (one item per line)</p>
              <Textarea 
                {...step3Form.register("inScope")}
                placeholder="What's included in this project?" 
                rows={4}
              />
              {step3Form.formState.errors.inScope && (
                <p className="text-sm text-red-500">{step3Form.formState.errors.inScope.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Out of Scope</label>
              <p className="text-xs text-gray-500">What's excluded from this project? (one item per line)</p>
              <Textarea 
                {...step3Form.register("outOfScope")}
                placeholder="What's NOT included in this project?" 
                rows={4}
              />
              {step3Form.formState.errors.outOfScope && (
                <p className="text-sm text-red-500">{step3Form.formState.errors.outOfScope.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-sm">Constraints (optional)</label>
              <p className="text-xs text-gray-500">Any limitations to consider? (one per line)</p>
              <Textarea 
                {...step3Form.register("constraints")}
                placeholder="Enter any constraints" 
                rows={3}
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">AI Feature Suggestions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Our AI can analyze your project details and suggest potential features to consider.
                  </p>
                  
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span>Generate ideas from multiple perspectives</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span>Prioritize based on your project scope</span>
                    </li>
                  </ul>
                  
                  <div className="flex items-center justify-between mt-4 p-3 border rounded-md">
                    <label className="text-sm font-medium">
                      Generate AI feature suggestions
                    </label>
                    <Switch 
                      checked={step4Form.watch("generateSuggestions")}
                      onCheckedChange={(checked) => 
                        step4Form.setValue("generateSuggestions", checked)
                      }
                    />
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-xs text-amber-800 dark:text-amber-300">
                        AI feature suggestions require an OpenAI API key
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
              <h3 className="font-medium mb-4">Project Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Project Name: </span>
                  <span>{step1Form.getValues("name")}</span>
                </div>
                <div>
                  <span className="font-medium">Mission: </span>
                  <span className="text-gray-600 dark:text-gray-400">{step2Form.getValues("mission")}</span>
                </div>
                <div>
                  <span className="font-medium">Primary Goal: </span>
                  <span className="text-gray-600 dark:text-gray-400">{step2Form.getValues("primaryGoal")}</span>
                </div>
                
                <div>
                  <span className="font-medium">In Scope: </span>
                  <div className="mt-1 pl-2 space-y-1 text-gray-600 dark:text-gray-400">
                    {step3Form.getValues("inScope").split("\n").filter(Boolean).map((item, i) => (
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px] h-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{type === "concept" ? "Concept" : "Project"} Wizard</DialogTitle>
            <DialogDescription>Create a new {type} (Step {step} of 4)</DialogDescription>
          </DialogHeader>
          
          {/* Wizard content */}
          <div className="py-4">
            {renderStepContent()}
          </div>
          
          {/* Navigation */}
          <DialogFooter>
            <div className="flex w-full justify-between">
              <div>
                {step > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousStep}
                    type="button"
                    disabled={submitting}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back
                  </Button>
                )}
              </div>
              
              <div>
                {step < 4 ? (
                  <Button 
                    onClick={goToNextStep}
                    type="button"
                  >
                    Next
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : `Create ${type === "concept" ? "Concept" : "Project"}`}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
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
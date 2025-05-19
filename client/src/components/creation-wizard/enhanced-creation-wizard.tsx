import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Lightbulb, Layers, FileCode, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SimplifiedConceptForm } from "@/components/creation-wizard/simplified-concept-form";
import { ProjectForm } from "@/components/creation-wizard/project-form";
import { FeatureForm } from "@/components/creation-wizard/feature-form";

// Define the different creation types that our wizard supports
export type CreationType = "concept" | "project" | "feature" | "import";

// Props for our enhanced creation wizard component
interface EnhancedCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: CreationType;
  projectId?: number; // Optional project ID if we're creating a feature within a project
}

export function EnhancedCreationWizard({ 
  open, 
  onOpenChange, 
  initialType = "concept",
  projectId 
}: EnhancedCreationWizardProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Track current wizard state
  const [creationType, setCreationType] = useState<CreationType>(initialType);
  const [step, setStep] = useState<"type-selection" | "form">("type-selection");
  
  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset the wizard when closed
      setStep("type-selection");
      setCreationType(initialType);
    }
    onOpenChange(open);
  };

  // Handle creating a concept (quick flow)
  const handleCreateConcept = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        type: "concept",
        enhanceWithAi: data.enhanceWithAi,
      };
      
      const response = await apiRequest("/api/projects", "POST", payload);
      
      // Show success toast
      toast({
        title: "Concept created!",
        description: "Your new concept has been created successfully.",
      });
      
      // Close the dialog
      handleOpenChange(false);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Navigate to the new concept
      navigate(`/projects/${response.id}`);
    } catch (error) {
      toast({
        title: "Failed to create concept",
        description: "There was an error creating your concept. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle creating a project (detailed flow)
  const handleCreateProject = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        type: "project",
        mission: data.mission,
        goals: data.goals,
        inScope: data.inScope,
        outOfScope: data.outOfScope,
        constraints: data.constraints,
        technicalRequirements: data.technicalRequirements,
        enhanceWithAi: data.enhanceWithAi,
      };
      
      const response = await apiRequest("/api/projects", "POST", payload);
      
      // Show success toast
      toast({
        title: "Project created!",
        description: "Your new project has been created successfully.",
      });
      
      // Close the dialog
      handleOpenChange(false);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Navigate to the new project
      navigate(`/projects/${response.id}`);
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle creating a feature
  const handleCreateFeature = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        perspective: data.perspective,
        priority: data.priority,
        projectId: projectId || null,
        userBenefit: data.userBenefit,
        implementationComplexity: data.implementationComplexity,
        dependencies: data.dependencies,
        tags: data.tags,
        enhanceWithAi: data.enhanceWithAi,
      };
      
      await apiRequest("/api/features", "POST", payload);
      
      // Show success toast
      toast({
        title: "Feature created!",
        description: "Your new feature has been created successfully.",
      });
      
      // Close the dialog
      handleOpenChange(false);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/features`] });
      }
      
      // Stay on current page (no navigation needed)
    } catch (error) {
      toast({
        title: "Failed to create feature",
        description: "There was an error creating your feature. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Get the title for the dialog based on current state
  const getDialogTitle = () => {
    if (step === "type-selection") {
      return "What would you like to create?";
    }
    
    switch (creationType) {
      case "concept":
        return "Create a New Concept";
      case "project":
        return "Create a New Project";
      case "feature":
        return "Create a New Feature";
      case "import":
        return "Import Content";
      default:
        return "Create New Item";
    }
  };
  
  // Get the description for the dialog based on current state
  const getDialogDescription = () => {
    if (step === "type-selection") {
      return "Choose what type of item to create.";
    }
    
    switch (creationType) {
      case "concept":
        return "Create a concept for brainstorming and exploration.";
      case "project":
        return "Create a detailed implementation-ready project.";
      case "feature":
        return "Create a specific feature with implementation details.";
      case "import":
        return "Import content from external sources.";
      default:
        return "";
    }
  };
  
  // Render the type selection step
  const renderTypeSelection = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant={creationType === "concept" ? "default" : "outline"} 
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center w-full overflow-hidden"
          onClick={() => {
            setCreationType("concept");
            setStep("form");
          }}
        >
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="text-md font-medium">Concept</div>
          <p className="text-xs font-normal text-gray-500 dark:text-gray-400 w-full truncate px-2">
            Brainstorming ideas
          </p>
        </Button>
        
        <Button
          variant={creationType === "project" ? "default" : "outline"} 
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center w-full overflow-hidden"
          onClick={() => {
            setCreationType("project");
            setStep("form");
          }}
        >
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <Layers className="h-5 w-5 text-green-600 dark:text-green-300" />
          </div>
          <div className="text-md font-medium">Project</div>
          <p className="text-xs font-normal text-gray-500 dark:text-gray-400 w-full truncate px-2">
            Implementation-ready
          </p>
        </Button>
        
        <Button
          variant={creationType === "feature" ? "default" : "outline"} 
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center w-full overflow-hidden"
          onClick={() => {
            setCreationType("feature");
            setStep("form");
          }}
        >
          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
            <FileCode className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="text-md font-medium">Feature</div>
          <p className="text-xs font-normal text-gray-500 dark:text-gray-400 w-full truncate px-2">
            Individual capability
          </p>
        </Button>
        
        <Button
          variant={creationType === "import" ? "default" : "outline"} 
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center w-full overflow-hidden"
          onClick={() => {
            setCreationType("import");
            setStep("form");
          }}
        >
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
            <Upload className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="text-md font-medium">Import</div>
          <p className="text-xs font-normal text-gray-500 dark:text-gray-400 w-full truncate px-2">
            From external sources
          </p>
        </Button>
      </div>
    );
  };
  
  // Render the form for the selected type
  const renderForm = () => {
    switch (creationType) {
      case "concept":
        return (
          <SimplifiedConceptForm 
            onSubmit={handleCreateConcept}
            onBack={() => setStep("type-selection")}
          />
        );
      case "project":
        return (
          <ProjectForm 
            onSubmit={handleCreateProject}
            onBack={() => setStep("type-selection")}
          />
        );
      case "feature":
        return (
          <FeatureForm 
            onSubmit={handleCreateFeature}
            onBack={() => setStep("type-selection")}
            projectId={projectId}
          />
        );
      case "import":
        // Import form not yet implemented
        return (
          <div className="p-6 text-center">
            <p className="mb-4">Import functionality coming soon.</p>
            <Button onClick={() => setStep("type-selection")}>
              Go Back
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  // The main render method
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {step === "type-selection" ? renderTypeSelection() : renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
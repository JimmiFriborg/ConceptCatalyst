import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProjectSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, InfoIcon, Upload, Lightbulb, Layers, FileCode } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";

// Define the different creation types that our wizard supports
export type CreationType = "concept" | "project" | "feature" | "import";

// Props for our UnifiedCreationWizard component
interface UnifiedCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: CreationType;
  projectId?: number; // Optional project ID if we're creating a feature within a project
}

// Step type for our multi-step wizard
type WizardStep = 
  | "type-selection" 
  | "basic-info" 
  | "scope-definition"
  | "constraint-definition" 
  | "feature-details"
  | "import-options"
  | "review";

// Form schemas for different entity types
const projectSchema = insertProjectSchema.extend({
  type: z.enum(["concept", "project"]),
  goals: z.array(z.string()).optional(),
  inScope: z.array(z.string()).optional(),
  outOfScope: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  enhanceWithAi: z.boolean().default(true),
});

const featureSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  perspective: z.enum(["technical", "business", "security", "ux"]),
  enhanceWithAi: z.boolean().default(true),
});

const importSchema = z.object({
  importType: z.enum(["project", "feature"]),
  textContent: z.string().optional(),
  fileContent: z.any().optional(),
  parseAsSingleItem: z.boolean().default(true),
});

// Define our form data types
type ProjectFormData = z.infer<typeof projectSchema>;
type FeatureFormData = z.infer<typeof featureSchema>;
type ImportFormData = z.infer<typeof importSchema>;

export function UnifiedCreationWizard({ 
  open, 
  onOpenChange, 
  initialType = "concept",
  projectId 
}: UnifiedCreationWizardProps) {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Track current wizard state
  const [creationType, setCreationType] = useState<CreationType>(initialType);
  const [currentStep, setCurrentStep] = useState<WizardStep>("type-selection");
  
  // Initialize our forms
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      type: initialType as "concept" | "project",
      mission: "",
      goals: [],
      inScope: [],
      outOfScope: [],
      constraints: [],
      enhanceWithAi: true,
    },
    mode: "onChange",
  });
  
  const featureForm = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: "",
      description: "",
      perspective: "business",
      enhanceWithAi: true,
    },
    mode: "onChange",
  });
  
  const importForm = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      importType: "project",
      textContent: "",
      fileContent: undefined,
      parseAsSingleItem: true,
    },
    mode: "onChange",
  });
  
  // Handle dialog open/close and reset forms
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      projectForm.reset();
      featureForm.reset();
      importForm.reset();
      setCurrentStep("type-selection");
    }
    onOpenChange(open);
  };
  
  // Handle moving to the next step in the wizard
  const goToNextStep = () => {
    if (creationType === "concept" || creationType === "project") {
      switch (currentStep) {
        case "type-selection":
          setCurrentStep("basic-info");
          break;
        case "basic-info":
          setCurrentStep("scope-definition");
          break;
        case "scope-definition":
          setCurrentStep("constraint-definition");
          break;
        case "constraint-definition":
          setCurrentStep("review");
          break;
        case "review":
          handleSubmitProject();
          break;
      }
    } else if (creationType === "feature") {
      switch (currentStep) {
        case "type-selection":
          setCurrentStep("feature-details");
          break;
        case "feature-details":
          setCurrentStep("review");
          break;
        case "review":
          handleSubmitFeature();
          break;
      }
    } else if (creationType === "import") {
      switch (currentStep) {
        case "type-selection":
          setCurrentStep("import-options");
          break;
        case "import-options":
          setCurrentStep("review");
          break;
        case "review":
          handleSubmitImport();
          break;
      }
    }
  };
  
  // Handle going back to the previous step
  const goToPreviousStep = () => {
    if (creationType === "concept" || creationType === "project") {
      switch (currentStep) {
        case "basic-info":
          setCurrentStep("type-selection");
          break;
        case "scope-definition":
          setCurrentStep("basic-info");
          break;
        case "constraint-definition":
          setCurrentStep("scope-definition");
          break;
        case "review":
          setCurrentStep("constraint-definition");
          break;
      }
    } else if (creationType === "feature") {
      switch (currentStep) {
        case "feature-details":
          setCurrentStep("type-selection");
          break;
        case "review":
          setCurrentStep("feature-details");
          break;
      }
    } else if (creationType === "import") {
      switch (currentStep) {
        case "import-options":
          setCurrentStep("type-selection");
          break;
        case "review":
          setCurrentStep("import-options");
          break;
      }
    }
  };
  
  // Render the wizard title based on the current step and creation type
  const getWizardTitle = () => {
    if (currentStep === "type-selection") {
      return "What would you like to create?";
    }
    
    const typeLabels = {
      concept: "Concept",
      project: "Project",
      feature: "Feature",
      import: "Import"
    };
    
    const stepLabels = {
      "basic-info": "Basic Information",
      "scope-definition": "Scope Definition",
      "constraint-definition": "Constraints",
      "feature-details": "Feature Details",
      "import-options": "Import Options",
      "review": "Review & Create"
    };
    
    return `${typeLabels[creationType]}: ${stepLabels[currentStep]}`;
  };
  
  // Get the description text for the current step
  const getStepDescription = () => {
    switch (currentStep) {
      case "type-selection":
        return "Choose what type of item to create.";
      case "basic-info":
        return creationType === "concept"
          ? "Enter the basic concept information."
          : "Enter the core project details.";
      case "scope-definition":
        return "Define what's included and excluded.";
      case "constraint-definition":
        return "Add any limitations or requirements.";
      case "feature-details":
        return "Define the feature details.";
      case "import-options":
        return "Import content from external sources.";
      case "review":
        return "Review your inputs before creating.";
      default:
        return "";
    }
  };
  
  // Handle submissions
  const handleSubmitProject = async () => {
    try {
      const formData = projectForm.getValues();
      
      // Create appropriate payload based on form data
      const payload = {
        name: formData.name,
        description: formData.description,
        mission: formData.mission,
        goals: formData.goals,
        inScope: formData.inScope,
        outOfScope: formData.outOfScope,
        constraints: formData.constraints,
      };
      
      // Make API request to create the project/concept
      const response = await apiRequest("/api/projects", "POST", payload);
      
      // Show success toast
      toast({
        title: `${formData.type === "concept" ? "Concept" : "Project"} created!`,
        description: `Your ${formData.type} "${formData.name}" has been created successfully.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      // Navigate to the newly created project
      if (response.id) {
        const path = formData.type === "concept" ? "/concepts" : "/projects";
        navigate(`${path}/${response.id}`);
      } else {
        navigate("/");
      }
      
      // Close the dialog
      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitFeature = async () => {
    try {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is required to create a feature.",
          variant: "destructive",
        });
        return;
      }
      
      const formData = featureForm.getValues();
      
      // Create appropriate payload
      const payload = {
        name: formData.name,
        description: formData.description,
        perspective: formData.perspective,
      };
      
      // Make API request to create the feature
      await apiRequest(`/api/projects/${projectId}/features`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      // Show success toast
      toast({
        title: "Feature created!",
        description: `Your feature "${formData.name}" has been created successfully.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/features`] });
      
      // Close the dialog
      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating feature:", error);
      toast({
        title: "Error",
        description: "Failed to create feature. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitImport = async () => {
    try {
      const formData = importForm.getValues();
      
      // Process the import data
      // This would need to be implemented based on your import format and process
      toast({
        title: "Import started",
        description: "Processing your import data...",
      });
      
      // For now, just close the dialog
      handleOpenChange(false);
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        title: "Error",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Render different content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case "type-selection":
        return renderTypeSelection();
      case "basic-info":
        return renderBasicInfo();
      case "scope-definition":
        return renderScopeDefinition();
      case "constraint-definition":
        return renderConstraintDefinition();
      case "feature-details":
        return renderFeatureDetails();
      case "import-options":
        return renderImportOptions();
      case "review":
        return renderReview();
      default:
        return null;
    }
  };
  
  // Render the type selection step (first step)
  const renderTypeSelection = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant={creationType === "concept" ? "default" : "outline"} 
          className="h-auto p-4 flex flex-col items-center justify-center gap-2 text-center w-full overflow-hidden"
          onClick={() => {
            setCreationType("concept");
            projectForm.setValue("type", "concept");
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
            projectForm.setValue("type", "project");
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
  
  // Render the basic info step for projects and concepts
  const renderBasicInfo = () => {
    return (
      <Form {...projectForm}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <FormField
            control={projectForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={creationType === "concept" ? "Enter concept name" : "Enter project name"} 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A clear, concise name that describes your {creationType}.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={projectForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={creationType === "concept" ? "Describe your concept" : "Describe your project"} 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of your {creationType}'s purpose and goals.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={projectForm.control}
            name="mission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mission Statement</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter mission statement" 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A clear statement of what this {creationType} aims to achieve.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={projectForm.control}
            name="enhanceWithAi"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">AI Enhancement</FormLabel>
                  <FormDescription>
                    Let our AI suggest improvements, identify gaps, and enhance your descriptions.
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
        </form>
      </Form>
    );
  };
  
  // Render the scope definition step
  const renderScopeDefinition = () => {
    return (
      <Form {...projectForm}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Goals</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Define the primary goals and objectives for this {creationType}.
            </p>
            
            {/* Here you'd need to implement a dynamic list of goals */}
            <div className="space-y-2">
              <Input placeholder="Enter a goal and press Enter" />
              <div className="flex flex-wrap gap-2">
                {/* Example goal tags */}
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                  Example goal
                  <button className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800">×</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">In Scope</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Define what's included in the scope of this {creationType}.
            </p>
            
            {/* Here you'd need to implement a dynamic list of in-scope items */}
            <div className="space-y-2">
              <Input placeholder="Enter an in-scope item and press Enter" />
              <div className="flex flex-wrap gap-2">
                {/* Example scope tags */}
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center">
                  Example in-scope item
                  <button className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800">×</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Out of Scope</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Define what's explicitly excluded from this {creationType}.
            </p>
            
            {/* Here you'd need to implement a dynamic list of out-of-scope items */}
            <div className="space-y-2">
              <Input placeholder="Enter an out-of-scope item and press Enter" />
              <div className="flex flex-wrap gap-2">
                {/* Example out-of-scope tags */}
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm flex items-center">
                  Example out-of-scope item
                  <button className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800">×</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    );
  };
  
  // Render the constraints definition step
  const renderConstraintDefinition = () => {
    return (
      <Form {...projectForm}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Constraints</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Define any limitations, restrictions, or boundaries for this {creationType}.
            </p>
            
            {/* Here you'd need to implement a dynamic list of constraints */}
            <div className="space-y-2">
              <Input placeholder="Enter a constraint and press Enter" />
              <div className="flex flex-wrap gap-2">
                {/* Example constraint tags */}
                <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm flex items-center">
                  Example constraint
                  <button className="ml-2 text-amber-600 dark:text-amber-400 hover:text-amber-800">×</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex gap-3">
            <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Why define constraints?</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Constraints help set realistic expectations and identify potential challenges early.
                Examples include budget limitations, technical constraints, time restrictions, or compliance requirements.
              </p>
            </div>
          </div>
        </form>
      </Form>
    );
  };
  
  // Render the feature details step
  const renderFeatureDetails = () => {
    return (
      <Form {...featureForm}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <FormField
            control={featureForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter feature name" {...field} />
                </FormControl>
                <FormDescription>
                  A clear, concise name that describes your feature.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={featureForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the feature in detail" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the feature's functionality and purpose.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={featureForm.control}
            name="perspective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perspective</FormLabel>
                <div className="grid grid-cols-4 gap-3">
                  {["technical", "business", "security", "ux"].map((perspective) => (
                    <Button
                      key={perspective}
                      type="button"
                      variant={field.value === perspective ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => featureForm.setValue("perspective", perspective as any)}
                    >
                      {perspective}
                    </Button>
                  ))}
                </div>
                <FormDescription>
                  Select the primary perspective for this feature.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={featureForm.control}
            name="enhanceWithAi"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">AI Enhancement</FormLabel>
                  <FormDescription>
                    Let our AI suggest improvements, identify gaps, and enhance your feature description.
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
        </form>
      </Form>
    );
  };
  
  // Render the import options step
  const renderImportOptions = () => {
    return (
      <Form {...importForm}>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <FormField
            control={importForm.control}
            name="importType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Import Type</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  {["project", "feature"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={field.value === type ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => importForm.setValue("importType", type as any)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <FormDescription>
                  Select what you want to import.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={importForm.control}
            name="textContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Import Text</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Paste your text content here" 
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Paste the content you want to import.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={importForm.control}
            name="parseAsSingleItem"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Parse as a single item
                  </FormLabel>
                  <FormDescription>
                    If unchecked, we'll try to detect multiple items in your import.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  };
  
  // Render the review step
  const renderReview = () => {
    // Depending on the creation type, show different review content
    if (creationType === "concept" || creationType === "project") {
      const formData = projectForm.getValues();
      return (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Basic Information</h3>
            <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="col-span-2">{formData.name || "Not provided"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="col-span-2 whitespace-pre-line">{formData.description || "Not provided"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Mission</dt>
                <dd className="col-span-2 whitespace-pre-line">{formData.mission || "Not provided"}</dd>
              </div>
            </dl>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Scope & Constraints</h3>
            <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Goals</dt>
                <dd className="col-span-2">
                  {formData.goals && formData.goals.length > 0 
                    ? formData.goals.map((goal, idx) => (
                        <div key={idx} className="mb-1">{goal}</div>
                      ))
                    : "No goals defined"
                  }
                </dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">In Scope</dt>
                <dd className="col-span-2">
                  {formData.inScope && formData.inScope.length > 0 
                    ? formData.inScope.map((item, idx) => (
                        <div key={idx} className="mb-1">{item}</div>
                      ))
                    : "No in-scope items defined"
                  }
                </dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Out of Scope</dt>
                <dd className="col-span-2">
                  {formData.outOfScope && formData.outOfScope.length > 0 
                    ? formData.outOfScope.map((item, idx) => (
                        <div key={idx} className="mb-1">{item}</div>
                      ))
                    : "No out-of-scope items defined"
                  }
                </dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Constraints</dt>
                <dd className="col-span-2">
                  {formData.constraints && formData.constraints.length > 0 
                    ? formData.constraints.map((item, idx) => (
                        <div key={idx} className="mb-1">{item}</div>
                      ))
                    : "No constraints defined"
                  }
                </dd>
              </div>
            </dl>
          </div>
        </div>
      );
    } else if (creationType === "feature") {
      const formData = featureForm.getValues();
      return (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Feature Details</h3>
            <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="col-span-2">{formData.name || "Not provided"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="col-span-2 whitespace-pre-line">{formData.description || "Not provided"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Perspective</dt>
                <dd className="col-span-2 capitalize">{formData.perspective || "Not provided"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">AI Enhancement</dt>
                <dd className="col-span-2">{formData.enhanceWithAi ? "Enabled" : "Disabled"}</dd>
              </div>
            </dl>
          </div>
        </div>
      );
    } else if (creationType === "import") {
      const formData = importForm.getValues();
      return (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Import Details</h3>
            <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Import Type</dt>
                <dd className="col-span-2 capitalize">{formData.importType || "Not provided"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Parse As Single Item</dt>
                <dd className="col-span-2">{formData.parseAsSingleItem ? "Yes" : "No"}</dd>
              </div>
              <div className="py-2 grid grid-cols-3 gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Content Preview</dt>
                <dd className="col-span-2 whitespace-pre-line text-sm">
                  {formData.textContent 
                    ? (formData.textContent.length > 200 
                        ? formData.textContent.substring(0, 200) + "..." 
                        : formData.textContent)
                    : "No content provided"
                  }
                </dd>
              </div>
            </dl>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Determine if we can proceed to the next step
  const canProceed = () => {
    if (currentStep === "type-selection") {
      return true; // We always have a creation type selected
    }
    
    if (creationType === "concept" || creationType === "project") {
      switch (currentStep) {
        case "basic-info":
          return projectForm.getValues("name").length >= 3 && projectForm.getValues("description").length >= 10;
        case "scope-definition":
        case "constraint-definition":
          return true; // These are optional
        case "review":
          return true;
      }
    } else if (creationType === "feature") {
      switch (currentStep) {
        case "feature-details":
          return featureForm.getValues("name").length >= 3 && featureForm.getValues("description").length >= 10;
        case "review":
          return true;
      }
    } else if (creationType === "import") {
      switch (currentStep) {
        case "import-options":
          return importForm.getValues("textContent")?.length > 0 || importForm.getValues("fileContent");
        case "review":
          return true;
      }
    }
    
    return false;
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getWizardTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div>
            {currentStep !== "type-selection" && (
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                Back
              </Button>
            )}
          </div>
          <Button 
            onClick={goToNextStep}
            disabled={!canProceed()}
          >
            {currentStep === "review" ? "Create" : "Next"}
            {currentStep !== "review" && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
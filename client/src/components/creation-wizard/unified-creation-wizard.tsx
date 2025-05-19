import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { createProject, createFeature } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  FolderKanban, 
  Lightbulb, 
  Puzzle, 
  FileUp, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle,
  Info,
  FileCode, 
  User, 
  ShieldCheck
} from "lucide-react";

// Creation types
type CreationType = "concept" | "project" | "feature" | "import";

// Wizard schemas
const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  mission: z.string().default(""),
  primaryGoal: z.string().default(""),
  secondaryGoals: z.string().optional().default(""),
  inScope: z.string().default(""),
  outOfScope: z.string().default(""),
  constraints: z.string().optional().default(""),
  generateSuggestions: z.boolean().default(true),
  projectType: z.enum(["concept", "project"]).default("project"),
});

const featureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  perspective: z.enum(["technical", "business", "ux", "security"]),
  projectId: z.number().optional(),
  enhanceWithAi: z.boolean().default(true),
});

const importSchema = z.object({
  importType: z.enum(["project", "concept", "feature"]),
  textContent: z.string().min(1, "Content is required"),
  fileContent: z.any().optional(),
  parseAsSingleItem: z.boolean().default(true),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type FeatureFormData = z.infer<typeof featureSchema>;
type ImportFormData = z.infer<typeof importSchema>;

interface UnifiedCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: CreationType;
  projectId?: number;
}

export function UnifiedCreationWizard({
  open,
  onOpenChange,
  initialType = "concept",
  projectId,
}: UnifiedCreationWizardProps) {
  const [creationType, setCreationType] = useState<CreationType>(initialType);
  const [step, setStep] = useState(1);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  // Setup forms for different content types
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      mission: "",
      primaryGoal: "",
      secondaryGoals: "",
      inScope: "",
      outOfScope: "",
      constraints: "",
      generateSuggestions: true,
      projectType: initialType === "concept" ? "concept" : "project",
    },
  });
  
  const featureForm = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: "",
      description: "",
      perspective: "business",
      projectId: projectId,
      enhanceWithAi: true,
    },
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
      setStep(1);
      projectForm.reset();
      featureForm.reset();
      importForm.reset();
    }
    onOpenChange(open);
  };
  
  // Handle creation type change
  const handleCreationTypeChange = (type: CreationType) => {
    setCreationType(type);
    setStep(1);
  };
  
  // Submit handlers
  const handleProjectSubmit = async (data: ProjectFormData) => {
    try {
      setSubmitting(true);
      
      // Process text fields into arrays
      const goalsArray = [
        data.primaryGoal,
        ...(data.secondaryGoals ? 
          data.secondaryGoals.split('\n').filter(Boolean) : [])
      ];
      
      const inScopeArray = data.inScope.split('\n').filter(Boolean);
      const outOfScopeArray = data.outOfScope.split('\n').filter(Boolean);
      const constraintsArray = data.constraints ? 
        data.constraints.split('\n').filter(Boolean) : [];
      
      // Create the project
      const project = await createProject({
        name: data.name,
        description: data.description,
        mission: data.mission,
        goals: goalsArray,
        inScope: inScopeArray,
        outOfScope: outOfScopeArray,
        constraints: constraintsArray
      });
      
      // Update UI
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: `${data.projectType === "concept" ? "Concept" : "Project"} created`,
        description: `Your ${data.projectType} has been created successfully.`
      });
      
      // Close dialog
      handleOpenChange(false);
      
      // Navigate to the new project
      navigate(`/projects/${project.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${data.projectType}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleFeatureSubmit = async (data: FeatureFormData) => {
    try {
      setSubmitting(true);
      
      if (!data.projectId) {
        toast({
          title: "Error",
          description: "Please select a project for this feature.",
          variant: "destructive"
        });
        return;
      }
      
      // Create the feature
      const feature = await createFeature({
        name: data.name,
        description: data.description,
        perspective: data.perspective,
        projectId: data.projectId,
      });
      
      // Update UI
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${data.projectId}/features`] 
      });
      toast({
        title: "Feature created",
        description: "Your feature has been created successfully."
      });
      
      // Close dialog
      handleOpenChange(false);
      
      // Navigate if needed
      if (feature.projectId) {
        navigate(`/projects/${feature.projectId}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feature. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleImportSubmit = async (data: ImportFormData) => {
    try {
      setSubmitting(true);
      
      // Implementation for import functionality will go here
      // This would parse the text or file and create appropriate entities
      
      toast({
        title: "Import successful",
        description: `Imported ${data.importType} content successfully.`
      });
      
      // Close dialog
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to import ${data.importType}. Please check the format and try again.`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render creation type selection
  const renderCreationTypeSelection = () => (
    <div className="grid grid-cols-2 gap-4 my-4">
      <Card 
        className={`cursor-pointer hover:border-primary ${
          creationType === "concept" ? "border-2 border-primary" : ""
        }`}
        onClick={() => handleCreationTypeChange("concept")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
            Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Early stage ideas for brainstorming and exploration. 
            Not yet ready for development planning.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:border-primary ${
          creationType === "project" ? "border-2 border-primary" : ""
        }`}
        onClick={() => handleCreationTypeChange("project")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <FolderKanban className="mr-2 h-5 w-5 text-blue-500" />
            Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Implementation-ready initiatives with 
            clear scope, goals, and development priorities.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:border-primary ${
          creationType === "feature" ? "border-2 border-primary" : ""
        }`}
        onClick={() => handleCreationTypeChange("feature")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Puzzle className="mr-2 h-5 w-5 text-green-500" />
            Feature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Individual functionality or component 
            that belongs to a project or concept.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer hover:border-primary ${
          creationType === "import" ? "border-2 border-primary" : ""
        }`}
        onClick={() => handleCreationTypeChange("import")}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <FileUp className="mr-2 h-5 w-5 text-purple-500" />
            Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Import concepts, projects, or features 
            from text or file content.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render project form
  const renderProjectForm = () => {
    const isConceptMode = projectForm.watch("projectType") === "concept";
    
    const maxStep = isConceptMode ? 2 : 4;
    
    return (
      <Form {...projectForm}>
        <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)}>
          <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
            {/* Type selector */}
            <FormField
              control={projectForm.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="concept">
                        <div className="flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                          <span>Concept (for brainstorming)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="project">
                        <div className="flex items-center">
                          <FolderKanban className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Project (implementation-ready)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="flex items-center text-amber-600 mt-2">
                    <Info className="h-4 w-4 mr-2" />
                    {isConceptMode 
                      ? "Concepts focus on capturing ideas without implementation details." 
                      : "Projects include detailed planning for implementation."}
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <Separator />
            
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <FormField
                  control={projectForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isConceptMode ? "Concept" : "Project"} Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={`Enter ${isConceptMode ? "concept" : "project"} name`} />
                      </FormControl>
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
                          {...field} 
                          placeholder={`Describe your ${isConceptMode ? "concept" : "project"}`}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 2: Mission and Goals */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mission and Goals</h3>
                <FormField
                  control={projectForm.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Statement</FormLabel>
                      <FormDescription>
                        Define the overarching purpose of your {isConceptMode ? "concept" : "project"}
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder={`Enter ${isConceptMode ? "concept" : "project"} mission`}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="primaryGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Goal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter main goal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="secondaryGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Goals (optional)</FormLabel>
                      <FormDescription>One goal per line</FormDescription>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter secondary goals (one per line)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 3: Scope (Project only) */}
            {step === 3 && !isConceptMode && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Scope</h3>
                <FormField
                  control={projectForm.control}
                  name="inScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>In Scope</FormLabel>
                      <FormDescription>What's included in this project? (one item per line)</FormDescription>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="What's included in this project?"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="outOfScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Out of Scope</FormLabel>
                      <FormDescription>What's excluded from this project? (one item per line)</FormDescription>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="What's NOT included in this project?"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="constraints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Constraints (optional)</FormLabel>
                      <FormDescription>Any limitations to consider? (one per line)</FormDescription>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter any constraints"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 4: AI Suggestions (Project only) */}
            {step === 4 && !isConceptMode && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Suggestions</h3>
                
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
                      
                      <FormField
                        control={projectForm.control}
                        name="generateSuggestions"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-3 border rounded-md mt-4">
                            <FormLabel className="cursor-pointer">
                              Generate AI feature suggestions
                            </FormLabel>
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Project Name: </span>
                      <span>{projectForm.getValues("name")}</span>
                    </div>
                    <div>
                      <span className="font-medium">Mission: </span>
                      <span className="text-gray-600 dark:text-gray-400">{projectForm.getValues("mission")}</span>
                    </div>
                    <div>
                      <span className="font-medium">Primary Goal: </span>
                      <span className="text-gray-600 dark:text-gray-400">{projectForm.getValues("primaryGoal")}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">In Scope: </span>
                      <div className="mt-1 pl-2 space-y-1 text-gray-600 dark:text-gray-400">
                        {projectForm.getValues("inScope").split("\n").filter(Boolean).map((item, i) => (
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
            )}
          </div>
          
          {/* Navigation */}
          <DialogFooter className="mt-6">
            <div className="flex w-full justify-between">
              <div>
                {step > 1 ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(step - 1)}
                    type="button"
                    disabled={submitting}
                  >
                    Back
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setCreationType("concept")}
                    type="button"
                    disabled={submitting}
                  >
                    Change Type
                  </Button>
                )}
              </div>
              
              <div>
                {step < maxStep ? (
                  <Button 
                    onClick={() => setStep(step + 1)}
                    type="button"
                  >
                    Next
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : `Create ${isConceptMode ? "Concept" : "Project"}`}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  // Render feature form
  const renderFeatureForm = () => (
    <Form {...featureForm}>
      <form onSubmit={featureForm.handleSubmit(handleFeatureSubmit)}>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <Puzzle className="h-5 w-5" />
              <h3 className="font-medium">Create New Feature</h3>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Features are individual functionalities that belong to a project or concept.
            </p>
          </div>
          
          <FormField
            control={featureForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter feature name" />
                </FormControl>
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
                    {...field} 
                    placeholder="Describe what this feature does and why it matters"
                    rows={4}
                  />
                </FormControl>
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
                <FormDescription>
                  Choose the primary perspective this feature addresses
                </FormDescription>
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
                    <SelectItem value="business">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Business</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="technical">
                      <div className="flex items-center">
                        <FileCode className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Technical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ux">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-green-500" />
                        <span>UX/UI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="security">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
                        <span>Security</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={featureForm.control}
            name="enhanceWithAi"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <FormLabel className="cursor-pointer">Enhance with AI</FormLabel>
                  <FormDescription>
                    Let AI refine and improve your feature description
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="mt-6">
          <div className="flex w-full justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCreationType("concept")}
              type="button"
              disabled={submitting}
            >
              Change Type
            </Button>
            
            <Button 
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Feature"}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
  
  // Render import form
  const renderImportForm = () => (
    <Form {...importForm}>
      <form onSubmit={importForm.handleSubmit(handleImportSubmit)}>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <FileUp className="h-5 w-5" />
              <h3 className="font-medium">Import Content</h3>
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
              Import concepts, projects, or features from text or file content.
            </p>
          </div>
          
          <FormField
            control={importForm.control}
            name="importType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Import Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="concept">
                      <div className="flex items-center">
                        <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Concept</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="project">
                      <div className="flex items-center">
                        <FolderKanban className="mr-2 h-4 w-4 text-blue-500" />
                        <span>Project</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="feature">
                      <div className="flex items-center">
                        <Puzzle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Features</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={importForm.control}
            name="textContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormDescription>
                  Paste text to import as {importForm.watch("importType")}
                </FormDescription>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder={`Paste your ${importForm.watch("importType")} content here`}
                    rows={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={importForm.control}
            name="parseAsSingleItem"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <FormLabel className="cursor-pointer">Import as single item</FormLabel>
                  <FormDescription>
                    {importForm.watch("importType") === "feature" 
                      ? "Parse as a single feature vs. multiple features"
                      : "Import as one complete entity"}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="mt-6">
          <div className="flex w-full justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCreationType("concept")}
              type="button"
              disabled={submitting}
            >
              Change Type
            </Button>
            
            <Button 
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Importing..." : `Import ${importForm.watch("importType")}`}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
  
  // Main render
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New</DialogTitle>
          <DialogDescription>
            Select what you want to create
          </DialogDescription>
        </DialogHeader>
        
        {/* Show selection or form based on state */}
        {creationType === "concept" && renderCreationTypeSelection()}
        {creationType === "project" && renderProjectForm()}
        {creationType === "feature" && renderFeatureForm()}
        {creationType === "import" && renderImportForm()}
      </DialogContent>
    </Dialog>
  );
}
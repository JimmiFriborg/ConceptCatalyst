import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectForm, ProjectFormData } from "./project-form";
import { FeatureForm, FeatureFormData } from "./feature-form";
import { ConceptForm, ConceptFormData } from "./concept-form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { CircleHelp } from "lucide-react";

export type CreationType = "concept" | "project" | "feature" | "import";

interface EnhancedCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: CreationType;
  projectId?: number;
}

export function EnhancedCreationWizard({ 
  open, 
  onOpenChange, 
  initialType,
  projectId
}: EnhancedCreationWizardProps) {
  const [activeTab, setActiveTab] = useState<CreationType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleTypeChange = (value: string) => {
    setActiveTab(value as CreationType);
  };

  // Function to handle project creation
  const handleProjectSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      
      // Determine if this is a concept or full project based on data characteristics
      const isConcept = activeTab === "concept";
      
      console.log("Creating project:", { ...data, type: isConcept ? "concept" : "project" });
      
      // Import our API functions 
      const { createProject } = await import("@/lib/api");
      
      // Create the project using our API helper
      await createProject({
        ...data,
        isConcept: isConcept ? 1 : 0  // Use numeric 1/0 for better compatibility
      });
      
      toast({
        title: `${isConcept ? "Concept" : "Project"} created successfully`,
        description: `"${data.name}" has been added to your ${isConcept ? "concepts" : "projects"}.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle concept creation
  const handleConceptSubmit = async (data: ConceptFormData) => {
    try {
      setIsSubmitting(true);
      
      // Create the concept using our API helper
      console.log("Creating concept:", data);
      
      // Import our API functions
      const { createConcept } = await import("@/lib/api");
      
      // Prepare the project data with concept-specific fields
      const conceptData = {
        name: data.name,
        description: data.description,
        mission: data.inspirations?.join(", ") || null,
        goals: data.potentialFeatures || [],
        inScope: [],
        outOfScope: [],
        constraints: [],
        technicalRequirements: data.aiPotential || "",
        projectCategory: "other" // Default for concepts
      };
      
      // Create the concept using our API helper function
      await createConcept(conceptData);
      
      toast({
        title: "Concept created successfully",
        description: `"${data.name}" has been added to your concepts.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating concept:', error);
      toast({
        title: "Error",
        description: "Failed to create concept. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle feature creation
  const handleFeatureSubmit = async (data: FeatureFormData) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to create a feature.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would save to the API
      // For now, we'll just show a success message
      console.log("Creating feature for project", projectId, data);
      
      toast({
        title: "Feature created successfully",
        description: `"${data.name}" has been added to the project.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating feature:', error);
      toast({
        title: "Error",
        description: "Failed to create feature. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle project import
  const handleProjectImport = async (data: any) => {
    try {
      setIsSubmitting(true);
      // Import logic will be implemented later
      toast({
        title: "Import functionality",
        description: "Import functionality will be implemented in a future update.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing project:', error);
      toast({
        title: "Error",
        description: "Failed to import project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {activeTab === "concept" ? "New Concept" : 
             activeTab === "project" ? "New Project" : 
             activeTab === "feature" ? "New Feature" : 
             "Import Project"}
          </DialogTitle>
          <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
            <CircleHelp className="h-4 w-4" />
            {activeTab === "concept" && "Quick concept creation for brainstorming (2-minute process)"}
            {activeTab === "project" && "Detailed project setup with implementation planning"}
            {activeTab === "feature" && "Add a new feature to an existing project"}
            {activeTab === "import" && "Import an existing project from external source"}
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTypeChange} className="w-full mt-2">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="concept">Concept</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="feature" disabled={!projectId}>Feature</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="concept">
            <ConceptForm 
              onSubmit={handleConceptSubmit} 
              defaultValues={{ 
                enhanceWithAi: true,
                isAiConcept: false
              }}
            />
          </TabsContent>
          
          <TabsContent value="project">
            <ProjectForm 
              onSubmit={handleProjectSubmit} 
              defaultValues={{ 
                enhanceWithAi: true,
                status: "planning",
                aiOptimized: false
              }}
            />
          </TabsContent>
          
          <TabsContent value="feature">
            <FeatureForm 
              onSubmit={handleFeatureSubmit} 
              projectId={projectId}
              defaultValues={{ 
                enhanceWithAi: true,
                perspective: "technical",
                implementationComplexity: "medium",
                priority: "medium",
                isAiFeature: false
              }}
            />
          </TabsContent>
          
          <TabsContent value="import">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium">Import Project</h3>
              <p className="text-muted-foreground mt-2">
                Import functionality will be implemented in a future update. This will allow you 
                to import projects from different sources like GitHub, Trello, or JSON files.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
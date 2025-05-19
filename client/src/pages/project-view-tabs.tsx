import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProject, useProjectDetails, useProjectFeatures, useProjectSuggestions } from "@/context/project-context";
import { ProjectTabs, ProjectTabKey, defaultProjectTabs } from "@/components/layout/project-tabs";
import { OverviewTab } from "@/components/project/overview-tab";
import { FeaturesTab } from "@/components/project/features-tab";
import { CategoriesTab } from "@/components/project/categories-tab";
import { EvaluationTab } from "@/components/project/evaluation-tab";
import { BranchesTab } from "@/components/project/branches-tab";
import { RepositoryTab } from "@/components/project/repository-tab";
import { AddFeatureDialog } from "@/components/add-feature-dialog";
import { AiFeatureSuggestionDialog } from "@/components/ai-feature-suggestion-dialog";
import { BranchRecommendationDialog } from "@/components/branch-recommendation-dialog";
import { ContextualPanel } from "@/components/layout/contextual-panel";
import { AiSuggestionsPanel } from "@/components/ai-suggestions-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Download,
  PlusCircle,
  Zap,
  Info,
  LightbulbIcon,
} from "lucide-react";
import { Feature, Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface ProjectViewTabsProps {
  id: number;
}

export default function ProjectViewTabs({ id }: ProjectViewTabsProps) {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ProjectTabKey>("overview");
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [isAiSuggestionDialogOpen, setIsAiSuggestionDialogOpen] = useState(false);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  
  const { 
    setCurrentProjectId,
    currentFeatureIndex,
    setCurrentFeatureIndex,
    setFeatures,
    setAiSuggestions
  } = useProject();
  
  const { data: project, isLoading: isProjectLoading } = useProjectDetails(id);
  const { 
    data: features = [], 
    isLoading: isFeaturesLoading,
    refetch: refetchFeatures
  } = useProjectFeatures(id);
  const {
    data: suggestions = [],
    isLoading: isSuggestionsLoading,
    refetch: refetchSuggestions
  } = useProjectSuggestions(id);
  
  useEffect(() => {
    if (id) {
      setCurrentProjectId(id);
    }
    
    return () => {
      setCurrentFeatureIndex(0);
      setFeatures([]);
      setAiSuggestions([]);
    };
  }, [id, setCurrentProjectId, setCurrentFeatureIndex, setFeatures, setAiSuggestions]);
  
  // Export project data
  const handleExport = () => {
    if (!project || !features || features.length === 0) return;

    const projectData = {
      project: {
        ...project,
        name: project.name || "Untitled Project"
      },
      features,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${(project.name || "Untitled_Project").replace(/\s+/g, '_')}_export.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Return to dashboard
  const handleBack = () => {
    navigate('/');
  };

  const handleTabChange = (tab: ProjectTabKey) => {
    setActiveTab(tab);
    
    // Close panels when switching tabs for better UX
    if (tab !== "features") {
      setIsDetailsPanelOpen(false);
    }
    
    if (tab !== "categories") {
      setIsAiPanelOpen(false);
    }
  };

  const tabs = defaultProjectTabs.map(tab => {
    let content;
    
    switch (tab.key) {
      case "overview":
        content = (
          <OverviewTab
            project={project}
            features={features}
          />
        );
        break;
      case "features":
        content = (
          <FeaturesTab
            features={features}
            onAddFeature={() => setIsAddFeatureOpen(true)}
            isLoading={isFeaturesLoading}
          />
        );
        break;
      case "categories":
        content = (
          <CategoriesTab
            features={features}
            projectId={id}
            isLoading={isFeaturesLoading}
          />
        );
        break;
      case "evaluation":
        content = (
          <EvaluationTab
            project={project}
            features={features}
            projectId={id}
            isLoading={isFeaturesLoading}
          />
        );
        break;
      case "branches":
        content = (
          <BranchesTab
            project={project}
            features={features}
            projectId={id}
            isLoading={isFeaturesLoading}
          />
        );
        break;
      case "repository":
        content = (
          <RepositoryTab
            project={project}
            projectId={id}
            isLoading={isProjectLoading}
          />
        );
        break;
      default:
        content = <div>Tab content not implemented</div>;
    }
    
    return {
      ...tab,
      content
    };
  });

  const toggleDetailsPanel = () => {
    setIsDetailsPanelOpen(prev => !prev);
    if (isAiPanelOpen) setIsAiPanelOpen(false);
  };

  const toggleAiPanel = () => {
    setIsAiPanelOpen(prev => !prev);
    if (isDetailsPanelOpen) setIsDetailsPanelOpen(false);
  };

  if (isProjectLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="mb-6">The project you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const isConceptType = location.pathname.includes("/concepts/");

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              {project.name}
              {isConceptType ? (
                <Badge className="ml-2 bg-amber-500">Concept</Badge>
              ) : (
                <Badge className="ml-2 bg-green-500">Project</Badge>
              )}
            </h1>
            <p className="text-gray-500">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={toggleDetailsPanel}
          >
            <Info className="mr-2 h-4 w-4" />
            Details
          </Button>
          
          <Button 
            variant="outline"
            onClick={toggleAiPanel}
          >
            <LightbulbIcon className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setIsAiSuggestionDialogOpen(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            AI Suggestions
          </Button>
          
          <Button onClick={() => setIsAddFeatureOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <ProjectTabs 
          tabs={tabs} 
          defaultTab="overview"
          onTabChange={handleTabChange}
        />
      </div>

      {/* Contextual Panels */}
      <ContextualPanel
        title="Feature Details"
        isOpen={isDetailsPanelOpen}
        onClose={() => setIsDetailsPanelOpen(false)}
      >
        {features.length > 0 && currentFeatureIndex < features.length ? (
          <div>
            <h3 className="font-medium text-lg mb-2">
              {features[currentFeatureIndex].name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {features[currentFeatureIndex].description}
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">Perspective</h4>
                <p className="text-gray-500">
                  {features[currentFeatureIndex].perspective}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Category</h4>
                <p className="text-gray-500">
                  {features[currentFeatureIndex].category}
                </p>
              </div>
              {features[currentFeatureIndex].tags && (
                <div>
                  <h4 className="font-medium text-sm">Tags</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(features[currentFeatureIndex].tags as string[])?.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-6">
            Select a feature to view details
          </div>
        )}
      </ContextualPanel>

      <ContextualPanel
        title="AI Suggestions"
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
      >
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSuggestions()}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Refresh
          </Button>
        </div>
        <AiSuggestionsPanel isLoading={isSuggestionsLoading} />
      </ContextualPanel>
      
      {/* Dialogs */}
      <AddFeatureDialog
        open={isAddFeatureOpen}
        onOpenChange={setIsAddFeatureOpen}
      />
      
      <AiFeatureSuggestionDialog
        open={isAiSuggestionDialogOpen}
        onOpenChange={setIsAiSuggestionDialogOpen}
        projectId={id}
        projectInfo={{
          mission: project?.mission || "",
          goals: project?.goals as string[] || [],
          inScope: project?.inScope as string[] || [],
          outOfScope: project?.outOfScope as string[] || []
        }}
      />
      
      <BranchRecommendationDialog
        open={isBranchDialogOpen}
        onOpenChange={setIsBranchDialogOpen}
        parentProjectId={id}
        branchRecommendation={null}
      />
    </div>
  );
}
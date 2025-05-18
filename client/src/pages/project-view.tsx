import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProject, useProjectDetails, useProjectFeatures, useProjectSuggestions } from "@/context/project-context";
import { ProjectSidebar } from "@/components/project-sidebar";
import { FeatureCard } from "@/components/feature-card";
import { EnhancedCategoryZones } from "@/components/enhanced-category-zones";
import { AiSuggestionsPanel } from "@/components/ai-suggestions-panel";
import { AddFeatureDialog } from "@/components/add-feature-dialog";
import { BranchRecommendationDialog } from "@/components/branch-recommendation-dialog";
import { BranchProjectsSection } from "@/components/branch-projects-section";
import { DriftDetectionAlert } from "@/components/drift-detection-alert";
import { ProjectEvaluation } from "@/components/project-evaluation";
import { PriorityVisualization } from "@/components/priority-visualization";
// Removed Frankenstein Feature dialog to improve stability
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Menu, PlusCircle, Download, ArrowLeft, ArrowRight, GitBranch, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Feature, Project } from "@shared/schema";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";
import { analyzeBranching } from "@/lib/api";

interface ProjectViewProps {
  id: number;
}

export default function ProjectView({ id }: ProjectViewProps) {
  const [_, navigate] = useLocation();
  const isMobile = useMobile();
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  
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
    isError: isFeaturesError 
  } = useProjectFeatures(id);
  
  const { 
    data: suggestions = [],
    isLoading: isSuggestionsLoading
  } = useProjectSuggestions(id);

  // Set the current project ID whenever it changes
  useEffect(() => {
    setCurrentProjectId(id);
    return () => setCurrentProjectId(null);
  }, [id, setCurrentProjectId]);

  // Update features in context when data changes - but only if they actually changed
  useEffect(() => {
    if (features && Array.isArray(features)) {
      // Use JSON comparison to avoid unnecessary updates
      const currentFeatures = JSON.stringify(features);
      setFeatures(prevFeatures => {
        const prevFeaturesStr = JSON.stringify(prevFeatures);
        return prevFeaturesStr === currentFeatures ? prevFeatures : (features as Feature[]);
      });
    }
  }, [features]);

  // Update AI suggestions in context when data changes - but only if they actually changed
  useEffect(() => {
    if (suggestions && Array.isArray(suggestions)) {
      // Use JSON comparison to avoid unnecessary updates
      const currentSuggestions = JSON.stringify(suggestions);
      setAiSuggestions(prevSuggestions => {
        const prevSuggestionsStr = JSON.stringify(prevSuggestions);
        return prevSuggestionsStr === currentSuggestions ? prevSuggestions : suggestions;
      });
    }
  }, [suggestions]);

  // Handle navigation between features
  const handlePreviousFeature = () => {
    if (features && Array.isArray(features) && features.length > 0) {
      setCurrentFeatureIndex(
        currentFeatureIndex > 0 ? currentFeatureIndex - 1 : features.length - 1
      );
    }
  };

  const handleNextFeature = () => {
    if (features && Array.isArray(features) && features.length > 0) {
      setCurrentFeatureIndex(
        currentFeatureIndex < features.length - 1 ? currentFeatureIndex + 1 : 0
      );
    }
  };

  // Removed manual branch analysis since we now use autonomous detection

  // Export project data
  const handleExport = () => {
    if (!project || !features || !Array.isArray(features) || features.length === 0) return;

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

  const currentFeature: Feature | undefined = features && features.length > 0 
    ? features[currentFeatureIndex] 
    : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:flex-shrink-0">
        <ProjectSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="flex justify-between items-center h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <ProjectSidebar />
              </SheetContent>
            </Sheet>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {isProjectLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {project?.name}
                </h2>
                <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowVisualization(!showVisualization)}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              {showVisualization ? "Hide Visualization" : "Show Visualization"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsAddFeatureOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>
        
        {/* Main working area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Current Feature Display */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-visible">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {isFeaturesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : isFeaturesError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
                    Error loading features. Please try again.
                  </div>
                ) : !features || features.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg text-center">
                    <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">No features yet</h3>
                    <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                      Get started by adding your first feature or generating AI suggestions.
                    </p>
                    <Button onClick={() => setIsAddFeatureOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Feature
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Current Feature
                        </h3>
                        <div className="inline-flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePreviousFeature}
                            disabled={features.length <= 1}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                          <span className="mx-2 text-sm text-gray-500 dark:text-gray-400">
                            {currentFeatureIndex + 1} of {features.length}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextFeature}
                            disabled={features.length <= 1}
                          >
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {currentFeature && (
                      <FeatureCard 
                        feature={currentFeature} 
                        draggable
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Priority Visualization - toggled by button click */}
          {showVisualization && features && features.length > 0 && (
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <PriorityVisualization features={features} />
            </div>
          )}
          
          {/* Autonomous Drift Detection Alert */}
          {features && Array.isArray(features) && features.length >= 3 && (
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <DriftDetectionAlert projectId={id} features={features as Feature[]} />
            </div>
          )}
          
          {/* AI Project Evaluation */}
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <ProjectEvaluation 
              projectId={id} 
              project={project as Project} 
              features={features as Feature[]} 
            />
          </div>
          
          {/* Enhanced Category Zones with custom category support */}
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setIsAddFeatureOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
          <EnhancedCategoryZones />
        </div>
      </div>
      
      {/* AI Suggestions Panel - hidden on mobile */}
      {!isMobile && (
        <AiSuggestionsPanel isLoading={isSuggestionsLoading} />
      )}
      
      {/* Branch Projects Section */}
      {!isMobile && (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <BranchProjectsSection projectId={id} />
          </div>
        </div>
      )}
      
      {/* Add Feature Dialog */}
      <AddFeatureDialog
        open={isAddFeatureOpen}
        onOpenChange={setIsAddFeatureOpen}
      />
      
      {/* Removed Frankenstein Feature Dialog to improve stability */}
      
      {/* We no longer need the branch recommendation dialog here as it's handled by the DriftDetectionAlert component */}
    </div>
  );
}

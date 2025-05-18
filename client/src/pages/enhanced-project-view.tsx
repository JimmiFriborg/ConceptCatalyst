import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DraggableCategoryZones } from "@/components/draggable-category-zones";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FrankensteinFeatureCompiler } from "@/components/frankenstein-feature-compiler";
import { BranchAnalyzer } from "@/components/branch-analyzer";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Home, 
  Plus, 
  Save, 
  ArrowLeft,
  Brain, 
  Lightbulb,
  FileCode,
  Shield,
  Users,
  Activity
} from "lucide-react";

export function EnhancedProjectView() {
  const [, setLocation] = useLocation();
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  
  // State for feature dialog
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePerspective, setFeaturePerspective] = useState("technical");
  const [featureCategory, setFeatureCategory] = useState("mvp");
  
  // State for AI suggestions
  const [showAiSuggestionsDialog, setShowAiSuggestionsDialog] = useState(false);
  const [selectedPerspective, setSelectedPerspective] = useState("technical");
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  // State for saving project
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  
  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['/api/projects', parseInt(projectId || "0")],
    enabled: !!projectId,
  });
  
  // Fetch features data
  const { 
    data: features, 
    isLoading: isLoadingFeatures,
    refetch: refetchFeatures 
  } = useQuery({
    queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'],
    enabled: !!projectId,
  });
  
  // Fetch AI suggestions
  const { 
    data: aiSuggestions, 
    isLoading: isLoadingAiSuggestions,
    refetch: refetchAiSuggestions 
  } = useQuery({
    queryKey: ['/api/projects', parseInt(projectId || "0"), 'ai/suggestions'],
    enabled: !!projectId,
  });
  
  // Set project data to edit form when project data changes
  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setProjectDescription(project.description || "");
    }
  }, [project]);
  
  // Mutation for creating/updating features
  const featureMutation = useMutation({
    mutationFn: async (feature: any) => {
      const url = editingFeature 
        ? `/api/features/${editingFeature.id}` 
        : `/api/projects/${projectId}/features`;
        
      return await apiRequest(url, {
        method: editingFeature ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feature),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch features query
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
      
      // Close dialog and reset form
      setShowFeatureDialog(false);
      resetFeatureForm();
      
      toast({
        title: editingFeature ? "Feature Updated" : "Feature Created",
        description: editingFeature 
          ? "Your feature has been successfully updated." 
          : "Your new feature has been added to the project.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: editingFeature 
          ? "Failed to update feature. Please try again." 
          : "Failed to create feature. Please try again.",
      });
    },
  });
  
  // Mutation for updating project
  const projectMutation = useMutation({
    mutationFn: async (project: any) => {
      return await apiRequest(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch project query
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0")] });
      
      // Exit edit mode
      setIsEditingProject(false);
      
      toast({
        title: "Project Updated",
        description: "Your project has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project. Please try again.",
      });
    },
  });
  
  // Mutation for generating AI suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (perspective: string) => {
      setIsGeneratingSuggestions(true);
      try {
        return await apiRequest(`/api/projects/${projectId}/ai/suggest-features`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ perspective }),
        });
      } finally {
        setIsGeneratingSuggestions(false);
      }
    },
    onSuccess: () => {
      // Refetch AI suggestions
      refetchAiSuggestions();
      
      toast({
        title: "Suggestions Generated",
        description: "New AI feature suggestions have been generated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI suggestions. Please try again.",
      });
    },
  });
  
  // Mutation for accepting AI suggestions
  const acceptSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      return await apiRequest(`/api/ai/suggestions/${suggestionId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch features and AI suggestions queries
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'ai/suggestions'] });
      
      toast({
        title: "Suggestion Accepted",
        description: "The AI suggestion has been added as a feature to your project.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept AI suggestion. Please try again.",
      });
    },
  });
  
  // Mutation for rejecting/deleting AI suggestions
  const rejectSuggestionMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      return await apiRequest(`/api/ai/suggestions/${suggestionId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate and refetch AI suggestions query
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'ai/suggestions'] });
      
      toast({
        title: "Suggestion Rejected",
        description: "The AI suggestion has been removed.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject AI suggestion. Please try again.",
      });
    },
  });
  
  const handleAddFeature = () => {
    setEditingFeature(null);
    resetFeatureForm();
    setShowFeatureDialog(true);
  };
  
  const handleEditFeature = (feature: any) => {
    setEditingFeature(feature);
    setFeatureName(feature.name);
    setFeatureDescription(feature.description);
    setFeaturePerspective(feature.perspective);
    setFeatureCategory(feature.category);
    setShowFeatureDialog(true);
  };
  
  const handleEnhanceFeature = (feature: any) => {
    // TODO: Implement the AI enhancement for feature descriptions
    toast({
      title: "Feature Enhancement",
      description: "AI enhancement for this feature will be implemented soon.",
    });
  };
  
  const resetFeatureForm = () => {
    setFeatureName("");
    setFeatureDescription("");
    setFeaturePerspective("technical");
    setFeatureCategory("mvp");
  };
  
  const handleFeatureSubmit = () => {
    // Validate form
    if (!featureName.trim() || !featureDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    // Prepare feature data
    const featureData = {
      name: featureName,
      description: featureDescription,
      perspective: featurePerspective,
      category: featureCategory,
      ...(editingFeature ? {} : { projectId: parseInt(projectId || "0") }),
    };
    
    // Submit feature
    featureMutation.mutate(featureData);
  };
  
  const handleSaveProject = () => {
    // Validate form
    if (!projectName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Project name is required.",
      });
      return;
    }
    
    // Prepare project data
    const projectData = {
      name: projectName,
      description: projectDescription,
    };
    
    // Submit project
    projectMutation.mutate(projectData);
  };
  
  const handleGenerateAiSuggestions = () => {
    generateSuggestionsMutation.mutate(selectedPerspective);
    setShowAiSuggestionsDialog(false);
  };
  
  const handleAcceptSuggestion = (suggestionId: number) => {
    acceptSuggestionMutation.mutate(suggestionId);
  };
  
  const handleRejectSuggestion = (suggestionId: number) => {
    rejectSuggestionMutation.mutate(suggestionId);
  };
  
  const getPerspectiveIcon = (perspective: string) => {
    switch (perspective) {
      case 'technical':
        return <FileCode className="h-4 w-4 mr-2" />;
      case 'business':
        return <Users className="h-4 w-4 mr-2" />;
      case 'ux':
        return <Activity className="h-4 w-4 mr-2" />;
      case 'security':
        return <Shield className="h-4 w-4 mr-2" />;
      default:
        return <Lightbulb className="h-4 w-4 mr-2" />;
    }
  };
  
  const getPerspectiveColor = (perspective: string) => {
    switch (perspective) {
      case 'technical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'business':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ux':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isLoadingProject) {
    return <div className="text-center py-10">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Button onClick={() => setLocation('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Projects
        </Button>
      </div>
      
      {/* Project header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="flex justify-between items-start mb-4">
          {isEditingProject ? (
            <div className="space-y-4 w-full">
              <div>
                <Label htmlFor="project-name" className="text-sm font-medium">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="project-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-slate-600">{project.description}</p>
              )}
            </div>
          )}
          
          <div className="flex space-x-2">
            {isEditingProject ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProject(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProject}
                  disabled={projectMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {projectMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProject(true)}
                >
                  Edit Project
                </Button>
                <Button 
                  onClick={() => setShowAiSuggestionsDialog(true)}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  AI Suggestions
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Project metadata */}
        {project.parentId && (
          <Badge variant="outline" className="mb-4">
            Branched Project
          </Badge>
        )}
      </div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="frankenstein">Frankenstein Compiler</TabsTrigger>
          <TabsTrigger value="branching">Branch Analysis</TabsTrigger>
        </TabsList>
        
        {/* Features tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Project Features</h2>
            <Button onClick={handleAddFeature}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
          
          {isLoadingFeatures ? (
            <div className="text-center py-6">Loading features...</div>
          ) : features && features.length > 0 ? (
            <DraggableCategoryZones
              projectId={parseInt(projectId || "0")}
              features={features}
              onAddFeature={handleAddFeature}
              onEditFeature={handleEditFeature}
              onAiEnhanceFeature={handleEnhanceFeature}
            />
          ) : (
            <Alert>
              <AlertTitle>No Features Yet</AlertTitle>
              <AlertDescription>
                This project doesn't have any features yet. Add your first feature or generate AI suggestions to get started.
              </AlertDescription>
            </Alert>
          )}
          
          {/* AI Suggestions section (if any) */}
          {aiSuggestions && aiSuggestions.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">AI Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiSuggestions.map((suggestion: any) => (
                  <div 
                    key={suggestion.id} 
                    className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">{suggestion.name}</h4>
                      <Badge variant="outline" className={getPerspectiveColor(suggestion.perspective)}>
                        {getPerspectiveIcon(suggestion.perspective)}
                        {suggestion.perspective}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{suggestion.description}</p>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptSuggestion(suggestion.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Frankenstein tab */}
        <TabsContent value="frankenstein">
          <FrankensteinFeatureCompiler projectId={parseInt(projectId || "0")} />
        </TabsContent>
        
        {/* Branch Analysis tab */}
        <TabsContent value="branching">
          <BranchAnalyzer 
            projectId={parseInt(projectId || "0")} 
            features={features || []}
          />
        </TabsContent>
      </Tabs>
      
      {/* Feature dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingFeature ? "Edit Feature" : "Add New Feature"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feature-name">Feature Name</Label>
              <Input 
                id="feature-name" 
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea 
                id="feature-description" 
                rows={4}
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature-perspective">Perspective</Label>
                <Select 
                  value={featurePerspective}
                  onValueChange={setFeaturePerspective}
                >
                  <SelectTrigger id="feature-perspective">
                    <SelectValue placeholder="Select Perspective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="ux">UX</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-category">Category</Label>
                <Select 
                  value={featureCategory}
                  onValueChange={setFeatureCategory}
                >
                  <SelectTrigger id="feature-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mvp">MVP</SelectItem>
                    <SelectItem value="launch">Launch</SelectItem>
                    <SelectItem value="v1.5">Version 1.5</SelectItem>
                    <SelectItem value="v2.0">Version 2.0</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowFeatureDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFeatureSubmit}
              disabled={featureMutation.isPending}
            >
              {featureMutation.isPending ? "Saving..." : (editingFeature ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Suggestions dialog */}
      <Dialog open={showAiSuggestionsDialog} onOpenChange={setShowAiSuggestionsDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate AI Suggestions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suggestion-perspective">Choose Perspective</Label>
              <Select 
                value={selectedPerspective}
                onValueChange={setSelectedPerspective}
              >
                <SelectTrigger id="suggestion-perspective">
                  <SelectValue placeholder="Select Perspective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="ux">UX</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAiSuggestionsDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateAiSuggestions}
              disabled={isGeneratingSuggestions}
            >
              {isGeneratingSuggestions ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SimpleFeatureDashboard } from "@/components/simple-feature-dashboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-helpers";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Brain } from "lucide-react";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [selectedPerspective, setSelectedPerspective] = useState("technical");
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['/api/projects', parseInt(projectId || "0")],
    enabled: !!projectId,
  });
  
  // Fetch features
  const { 
    data: features, 
    isLoading: isLoadingFeatures 
  } = useQuery({
    queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'],
    enabled: !!projectId,
  });
  
  // Fetch AI suggestions
  const { 
    data: aiSuggestions,
    refetch: refetchSuggestions
  } = useQuery({
    queryKey: ['/api/projects', parseInt(projectId || "0"), 'ai/suggestions'],
    enabled: !!projectId,
  });
  
  // Add feature mutation
  const addFeatureMutation = useMutation({
    mutationFn: async (feature: any) => {
      return await apiRequest(`/api/projects/${projectId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
    },
  });
  
  // Update feature mutation
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ id, feature }: { id: number, feature: any }) => {
      return await apiRequest(`/api/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
    },
  });
  
  // Update feature category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: number, category: string }) => {
      return await apiRequest(`/api/features/${id}/category`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
    },
  });
  
  // Delete feature mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/features/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
    },
  });
  
  // Generate AI suggestions mutation
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (perspective: string) => {
      return await apiRequest(`/api/projects/${projectId}/ai/suggest-features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perspective })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'ai/suggestions'] });
      toast({
        title: "Success",
        description: "AI suggestions generated successfully"
      });
    },
    onError: (error) => {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive"
      });
    }
  });
  
  // Handle adding new feature
  const handleAddFeature = async (feature: any) => {
    return await addFeatureMutation.mutateAsync(feature);
  };
  
  // Handle updating feature
  const handleUpdateFeature = async (id: number, feature: any) => {
    return await updateFeatureMutation.mutateAsync({ id, feature });
  };
  
  // Handle updating feature category (for drag and drop)
  const handleUpdateCategory = async (id: number, category: string) => {
    return await updateCategoryMutation.mutateAsync({ id, category });
  };
  
  // Handle deleting feature
  const handleDeleteFeature = async (id: number) => {
    return await deleteFeatureMutation.mutateAsync(id);
  };
  
  // Handle opening AI suggestions dialog
  const handleOpenAiSuggestions = () => {
    setShowSuggestionsDialog(true);
  };
  
  // Handle generating AI suggestions
  const handleGenerateAiSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      await generateSuggestionsMutation.mutateAsync(selectedPerspective);
      setShowSuggestionsDialog(false);
      refetchSuggestions();
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };
  
  if (isLoadingProject) {
    return <div className="text-center py-10">Loading project...</div>;
  }
  
  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <Button onClick={() => navigate('/')}>
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
          onClick={() => navigate('/')}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Projects
        </Button>
      </div>
      
      {/* Project header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-slate-600">{project.description}</p>
            )}
          </div>
          
          <Button 
            onClick={handleOpenAiSuggestions}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Suggestions
          </Button>
        </div>
      </div>
      
      {/* Features dashboard */}
      <SimpleFeatureDashboard
        projectId={parseInt(projectId || "0")}
        features={features || []}
        onAddFeature={handleAddFeature}
        onUpdateFeature={handleUpdateFeature}
        onDeleteFeature={handleDeleteFeature}
        onGenerateAiSuggestions={handleOpenAiSuggestions}
      />
      
      {/* AI Suggestions section */}
      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">AI Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion: any) => (
              <div 
                key={suggestion.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
              >
                <h3 className="font-medium mb-2">{suggestion.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest(`/api/ai/suggestions/${suggestion.id}`, {
                          method: 'DELETE',
                        });
                        refetchSuggestions();
                        toast({
                          title: "Success",
                          description: "Suggestion removed"
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to remove suggestion",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest(`/api/ai/suggestions/${suggestion.id}/accept`, {
                          method: 'POST',
                        });
                        refetchSuggestions();
                        queryClient.invalidateQueries({ queryKey: ['/api/projects', parseInt(projectId || "0"), 'features'] });
                        toast({
                          title: "Success",
                          description: "Suggestion added as feature"
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to add suggestion",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* AI Suggestions dialog */}
      <Dialog open={showSuggestionsDialog} onOpenChange={setShowSuggestionsDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate AI Suggestions</DialogTitle>
            <DialogDescription>
              Choose a perspective to generate feature suggestions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suggestion-perspective">Perspective</Label>
              <Select
                value={selectedPerspective}
                onValueChange={setSelectedPerspective}
              >
                <SelectTrigger id="suggestion-perspective">
                  <SelectValue placeholder="Select perspective" />
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
              onClick={() => setShowSuggestionsDialog(false)}
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
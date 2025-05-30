import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FeatureCard } from "@/components/feature-card";
import { generateProjectFeatureSuggestionsFromInfo } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { AiSuggestion } from "@shared/schema";
import { Loader2, ZapIcon, ThumbsUp, X } from "lucide-react";

// Import API client utilities
import { apiRequest } from "@/lib/api";

interface AiFeatureSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectInfo: {
    mission?: string;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
  };
}

export function AiFeatureSuggestionDialog({
  open,
  onOpenChange,
  projectId,
  projectInfo
}: AiFeatureSuggestionDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const { toast } = useToast();

  const handleGenerateSuggestions = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      console.log("Generating suggestions from project info:", projectInfo);
      const result = await generateProjectFeatureSuggestionsFromInfo(projectId, projectInfo);
      
      if (!result || !result.suggestions || !Array.isArray(result.suggestions)) {
        console.error("Invalid response format:", result);
        throw new Error("Invalid response format from server");
      }
      
      // Convert API response to local suggestion format
      const generatedSuggestions = result.suggestions.map((s, index) => ({
        id: index + 1000, // Temporary ID for UI purposes
        projectId,
        name: s.name,
        description: s.description,
        perspective: s.perspective,
        suggestedCategory: s.suggestedCategory,
        createdAt: new Date()
      }));
      
      console.log("Created suggestions:", generatedSuggestions);
      setSuggestions(generatedSuggestions);
      
      // Refresh project suggestions
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/ai/suggestions`] 
      });
      
      toast({
        title: "Feature suggestions generated",
        description: `${generatedSuggestions.length} feature suggestions have been created based on your project information.`,
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate feature suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: AiSuggestion) => {
    try {
      // Create a new feature directly from the suggestion using our API client
      await apiRequest(`/api/projects/${projectId}/features`, 'POST', {
        name: suggestion.name,
        description: suggestion.description,
        perspective: suggestion.perspective,
        category: suggestion.suggestedCategory
      });
      
      // Remove from suggestions list
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      // Refresh project features
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/features`] });
      
      toast({
        title: "Feature accepted",
        description: "The suggested feature has been added to your project.",
      });
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      toast({
        title: "Action failed",
        description: "Could not accept the suggestion. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectSuggestion = async (suggestion: AiSuggestion) => {
    try {
      // For suggestions generated directly in this dialog, we just remove them from local state
      // since they aren't stored in the database yet
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      toast({
        title: "Feature rejected",
        description: "The suggestion has been removed.",
      });
    } catch (error) {
      console.error("Error rejecting suggestion:", error);
      toast({
        title: "Action failed",
        description: "Could not reject the suggestion. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ZapIcon className="mr-2 h-5 w-5 text-yellow-500" />
            AI Feature Suggestions
          </DialogTitle>
          <DialogDescription>
            Generate feature suggestions based on your project information.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Let AI suggest features based on your project mission, goals, and scope.
              </p>
              <Button 
                onClick={handleGenerateSuggestions} 
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generating Suggestions..." : "Generate Feature Suggestions"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {suggestions.length} Suggested Features
                </h3>
                <Button onClick={handleGenerateSuggestions} disabled={isGenerating} variant="outline">
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate More
                </Button>
              </div>
              
              <div className="grid gap-4">
                {suggestions.map(suggestion => (
                  <div key={suggestion.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="text-lg font-semibold">{suggestion.name}</h4>
                      <div className="flex space-x-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded">
                          {suggestion.perspective}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded">
                          {suggestion.suggestedCategory}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {suggestion.description}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        onClick={() => handleAcceptSuggestion(suggestion)} 
                        variant="default" 
                        size="sm"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        onClick={() => handleRejectSuggestion(suggestion)} 
                        variant="outline" 
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { Category, Perspective } from "@shared/schema";
import { Loader2, ZapIcon, ThumbsUp, X, BrainCircuit } from "lucide-react";
import { generateFeaturesFromProjectInfo, acceptSuggestion, rejectSuggestion } from "@/lib/api";

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

type AiSuggestion = {
  id: number;
  name: string;
  description: string;
  perspective: Perspective;
  suggestedCategory: Category;
  projectId: number;
};

export function AiFeatureSuggestionDialog({
  open,
  onOpenChange,
  projectId,
  projectInfo
}: AiFeatureSuggestionDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const { toast } = useToast();

  // Generate suggestions when the dialog opens
  useEffect(() => {
    if (open && projectId && !suggestions.length && !isGenerating) {
      handleGenerateSuggestions();
    }
  }, [open, projectId]);

  const handleGenerateSuggestions = async () => {
    if (!projectId || !projectInfo) return;
    
    setIsGenerating(true);
    
    try {
      // This is a mock implementation - in a real app, this would use the actual API
      // The response will be mocked for demonstration
      const response = await generateFeaturesFromProjectInfo(projectId, projectInfo);
      
      // For demonstration, create some sample suggestions
      const mockSuggestions = [
        {
          id: 1,
          name: "User Authentication System",
          description: "Implement secure login and registration with two-factor authentication support.",
          perspective: "security" as Perspective,
          suggestedCategory: "mvp" as Category,
          projectId
        },
        {
          id: 2,
          name: "Interactive Dashboard",
          description: "Create a customizable dashboard showing key metrics and progress indicators.",
          perspective: "ux" as Perspective,
          suggestedCategory: "launch" as Category,
          projectId
        },
        {
          id: 3,
          name: "Data Export API",
          description: "Enable exporting project data in multiple formats (CSV, JSON, PDF).",
          perspective: "technical" as Perspective,
          suggestedCategory: "v1.5" as Category,
          projectId
        },
        {
          id: 4,
          name: "Revenue Tracking",
          description: "Implement financial reporting with visualization of income and expenses.",
          perspective: "business" as Perspective,
          suggestedCategory: "v2.0" as Category,
          projectId
        }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to generate feature suggestions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: AiSuggestion) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the API and create a feature
      await acceptSuggestion(suggestion.id);
      
      // Remove from suggestions list
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
      
      // Invalidate features query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "features"] });
      
      toast({
        title: "Feature Added",
        description: `"${suggestion.name}" has been added to your project.`,
      });
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to add this feature to your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIgnoreSuggestion = async (suggestion: AiSuggestion) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the API
      await rejectSuggestion(suggestion.id);
      
      // Remove from suggestions list
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
      
      toast({
        title: "Suggestion Ignored",
        description: `"${suggestion.name}" has been removed from suggestions.`,
      });
    } catch (error) {
      console.error("Error ignoring suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to ignore this suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryLabel = (category: Category) => {
    const labels: Record<Category, string> = {
      mvp: "MVP",
      launch: "Launch",
      "v1.5": "v1.5",
      "v2.0": "v2.0",
      rejected: "Rejected"
    };
    
    return labels[category] || category;
  };

  const getCategoryColor = (category: Category) => {
    const colors: Record<Category, string> = {
      mvp: "bg-red-100 text-red-800",
      launch: "bg-blue-100 text-blue-800",
      "v1.5": "bg-green-100 text-green-800",
      "v2.0": "bg-purple-100 text-purple-800",
      rejected: "bg-gray-100 text-gray-800"
    };
    
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getPerspectiveLabel = (perspective: Perspective) => {
    const labels: Record<Perspective, string> = {
      technical: "Technical",
      business: "Business",
      ux: "UX",
      security: "Security"
    };
    
    return labels[perspective] || perspective;
  };

  const getPerspectiveColor = (perspective: Perspective) => {
    const colors: Record<Perspective, string> = {
      technical: "bg-blue-100 text-blue-800",
      business: "bg-green-100 text-green-800",
      ux: "bg-purple-100 text-purple-800",
      security: "bg-red-100 text-red-800"
    };
    
    return colors[perspective] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BrainCircuit className="mr-2 h-5 w-5 text-blue-500" />
            AI Feature Suggestions
          </DialogTitle>
          <DialogDescription>
            These feature suggestions are generated based on your project information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-center text-slate-600">
                Generating feature suggestions based on your project...
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-600 mb-4">No suggestions available.</p>
              <Button onClick={handleGenerateSuggestions}>
                Generate Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{suggestion.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge className={getPerspectiveColor(suggestion.perspective)}>
                            {getPerspectiveLabel(suggestion.perspective)}
                          </Badge>
                          <Badge className={getCategoryColor(suggestion.suggestedCategory)}>
                            {getCategoryLabel(suggestion.suggestedCategory)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-slate-600">{suggestion.description}</p>
                    </CardContent>
                    <CardFooter className="pt-2 justify-end">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleIgnoreSuggestion(suggestion)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Ignore
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptSuggestion(suggestion)}
                          disabled={isProcessing}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Add to Project
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating || isProcessing}
          >
            Close
          </Button>
          {!isGenerating && suggestions.length > 0 && (
            <Button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating || isProcessing}
            >
              Regenerate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
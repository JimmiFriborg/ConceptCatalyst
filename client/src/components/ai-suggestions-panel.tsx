import { useState } from "react";
import { 
  Bot,
  XIcon,
  RefreshCw,
  PlusCircle,
  CodeIcon,
  LineChartIcon,
  SmileIcon,
  ShieldAlertIcon
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Perspective, AiSuggestion, Category } from "@shared/schema";
import { useProject, useProjectSuggestions } from "@/context/project-context";
import { generateFeatureSuggestions } from "@/lib/api";

import { queryClient } from "@/lib/queryClient";

// API functions for suggestion management
import { acceptSuggestion, deleteSuggestion } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AiSuggestionsPanelProps {
  isLoading?: boolean;
}

// Map perspectives to readable names
const perspectiveNames: Record<Perspective, string> = {
  technical: "Technical",
  business: "Business",
  ux: "UX/UI",
  security: "Security"
};

// Map perspectives to badge classes
const perspectiveBadgeClasses: Record<Perspective, string> = {
  technical: "perspective-badge-technical",
  business: "perspective-badge-business",
  ux: "perspective-badge-ux",
  security: "perspective-badge-security"
};

// Map perspectives to icons
const perspectiveIcons: Record<Perspective, React.ReactNode> = {
  technical: <CodeIcon className="h-4 w-4" />,
  business: <LineChartIcon className="h-4 w-4" />,
  ux: <SmileIcon className="h-4 w-4" />,
  security: <ShieldAlertIcon className="h-4 w-4" />
};

// Map categories to badge classes
const categoryBadgeClasses: Record<Category, string> = {
  "mvp": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "launch": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  "v1.5": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  "v2.0": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

// Map categories to readable names
const categoryNames: Record<Category, string> = {
  "mvp": "MVP (Must Have)",
  "launch": "Launch",
  "v1.5": "Version 1.5",
  "v2.0": "Version 2.0",
  "rejected": "Rejected"
};

export function AiSuggestionsPanel({ isLoading = false }: AiSuggestionsPanelProps) {
  const [perspective, setPerspective] = useState<Perspective | "all">("technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentProjectId, aiSuggestions } = useProject();
  // Use projectSuggestions hook to make sure we get fresh data
  const { data: freshSuggestions = [] } = useProjectSuggestions(currentProjectId);
  const { toast } = useToast();

  // Define "all" as a string type for perspective filtering
  type FilterPerspective = Perspective | "all";
  
  // Use the freshSuggestions data and filter by perspective
  const filteredSuggestions = Array.isArray(freshSuggestions) 
    ? freshSuggestions.filter((suggestion: AiSuggestion) => {
        // Handle both specific perspective and "all" filtering
        return perspective === suggestion.perspective || perspective === "all";
      })
    : [];

  // Generate AI suggestions
  const handleRefreshSuggestions = async () => {
    if (!currentProjectId || isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Only pass valid perspective values to the API
      const apiPerspective = perspective === "all" ? "technical" : perspective;
      await generateFeatureSuggestions(currentProjectId, apiPerspective);
      
      // Refresh suggestions data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${currentProjectId}/ai/suggestions`] 
      });
      
      toast({
        title: "Suggestions generated",
        description: `AI has generated new ${perspective === "all" ? "mixed" : perspectiveNames[perspective]} feature suggestions.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add suggestion as a feature
  const handleAddSuggestion = async (suggestion: AiSuggestion) => {
    try {
      await acceptSuggestion(suggestion.id);
      
      // Refresh data
      queryClient.invalidateQueries({ 
        queryKey: [
          `/api/projects/${currentProjectId}/features`,
          `/api/projects/${currentProjectId}/ai/suggestions`
        ] 
      });
      
      toast({
        title: "Suggestion accepted",
        description: `"${suggestion.name}" has been added as a feature.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add suggestion.",
        variant: "destructive"
      });
    }
  };

  // Ignore suggestion
  const handleIgnoreSuggestion = async (suggestion: AiSuggestion) => {
    try {
      await deleteSuggestion(suggestion.id);
      
      // Refresh suggestions data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${currentProjectId}/ai/suggestions`] 
      });
      
      toast({
        title: "Suggestion ignored",
        description: `"${suggestion.name}" has been removed from suggestions.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ignore suggestion.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="hidden lg:block lg:flex-shrink-0 lg:w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 py-4 px-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            AI Suggestions
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Intelligent feature recommendations for your project
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-36" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !currentProjectId ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Project Selected
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select a project to get AI suggestions
              </p>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Suggestions Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Generate AI suggestions for your project
              </p>
              <Button onClick={handleRefreshSuggestions} disabled={isGenerating}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate Suggestions
              </Button>
            </div>
          ) : (
            <>
              {filteredSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="mb-6">
                  <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Suggested Feature
                      </h4>
                      <Badge className={perspectiveBadgeClasses[suggestion.perspective as Perspective]}>
                        {perspectiveIcons[suggestion.perspective as Perspective]}
                        <span className="ml-1">
                          {perspectiveNames[suggestion.perspective as Perspective]}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-4 py-3">
                    <h5 className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.name}
                    </h5>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {suggestion.description}
                    </p>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <Badge className={categoryBadgeClasses[suggestion.suggestedCategory as Category]}>
                        Suggested: {categoryNames[suggestion.suggestedCategory as Category]}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleIgnoreSuggestion(suggestion)}
                        >
                          <XIcon className="h-3 w-3 mr-1" />
                          Ignore
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAddSuggestion(suggestion)}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
        
        {/* AI Perspective Switcher */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col">
            <Label htmlFor="perspective" className="mb-2">
              AI Perspective
            </Label>
            <Select
              value={perspective}
              onValueChange={(value) => setPerspective(value as Perspective)}
            >
              <SelectTrigger id="perspective">
                <SelectValue placeholder="Select perspective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">
                  <div className="flex items-center">
                    <CodeIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Technical
                  </div>
                </SelectItem>
                <SelectItem value="business">
                  <div className="flex items-center">
                    <LineChartIcon className="h-4 w-4 mr-2 text-green-500" />
                    Business
                  </div>
                </SelectItem>
                <SelectItem value="ux">
                  <div className="flex items-center">
                    <SmileIcon className="h-4 w-4 mr-2 text-amber-500" />
                    UX/UI
                  </div>
                </SelectItem>
                <SelectItem value="security">
                  <div className="flex items-center">
                    <ShieldAlertIcon className="h-4 w-4 mr-2 text-red-500" />
                    Security
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="mt-3"
              onClick={handleRefreshSuggestions}
              disabled={isGenerating || !currentProjectId}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh Suggestions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

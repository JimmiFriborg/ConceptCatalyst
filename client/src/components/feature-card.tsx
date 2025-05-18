import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RocketIcon, FlagIcon, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enhanceFeatureDescription, updateFeature } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Perspective, Category, Feature } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureCardProps {
  feature: Feature;
  draggable?: boolean;
  showActions?: boolean;
  onAction?: (action: string) => void;
}

// Map perspective to badge color
const perspectiveBadgeClasses: Record<Perspective, string> = {
  technical: "perspective-badge-technical",
  business: "perspective-badge-business",
  ux: "perspective-badge-ux",
  security: "perspective-badge-security"
};

// Map categories to readable names
const categoryNames: Record<Category, string> = {
  "mvp": "MVP (Must Have)",
  "launch": "Launch",
  "v1.5": "Version 1.5",
  "v2.0": "Version 2.0",
  "rejected": "Rejected"
};

// Map categories to badge styles
const categoryBadgeClasses: Record<Category, string> = {
  "mvp": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  "launch": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  "v1.5": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  "v2.0": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  "rejected": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

export function FeatureCard({ 
  feature, 
  draggable = false,
  showActions = true,
  onAction
}: FeatureCardProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();
  
  // Ensure proper feature drag behavior
  useEffect(() => {
    const featureCard = document.getElementById(`feature-card-${feature.id}`);
    
    if (featureCard && draggable) {
      featureCard.setAttribute("draggable", "true");
      
      const handleDragStart = (e: DragEvent) => {
        e.dataTransfer?.setData("application/json", JSON.stringify({
          featureId: feature.id,
          featureName: feature.name
        }));
        
        // Add a class to show the card is being dragged
        setTimeout(() => {
          featureCard.classList.add("opacity-50");
        }, 0);
      };
      
      const handleDragEnd = () => {
        featureCard.classList.remove("opacity-50");
      };
      
      featureCard.addEventListener("dragstart", handleDragStart);
      featureCard.addEventListener("dragend", handleDragEnd);
      
      return () => {
        featureCard.removeEventListener("dragstart", handleDragStart);
        featureCard.removeEventListener("dragend", handleDragEnd);
      };
    }
  }, [feature, draggable]);

  // Handle enhancing the feature description with AI
  const handleEnhance = async () => {
    if (isEnhancing) return;
    
    setIsEnhancing(true);
    try {
      const result = await enhanceFeatureDescription({
        name: feature.name,
        description: feature.description
      });
      
      // Update the feature with the enhanced description
      await updateFeature(feature.id, {
        aiEnhanced: {
          enhancedDescription: result.enhancedDescription
        }
      });
      
      // Invalidate the query to refresh the feature data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${feature.projectId}/features`] 
      });
      
      toast({
        title: "Feature enhanced",
        description: "AI has improved the feature description.",
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Could not enhance feature description.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card
      id={`feature-card-${feature.id}`}
      className={`feature-card ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      data-feature-id={feature.id}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {feature.name}
          </h4>
          <div className="flex space-x-2">
            <Badge className={perspectiveBadgeClasses[feature.perspective as Perspective]}>
              {feature.perspective.charAt(0).toUpperCase() + feature.perspective.slice(1)}
            </Badge>
            {feature.aiEnhanced && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                <Bot className="mr-1 h-3 w-3" />
                AI Enhanced
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {feature.description}
          </p>
          
          {feature.aiEnhanced && feature.aiEnhanced.enhancedDescription && (
            <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Bot className="text-blue-500 h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Enhancement</h5>
                  <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    <p>{feature.aiEnhanced.enhancedDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {showActions && !feature.aiEnhanced && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEnhance}
                disabled={isEnhancing}
              >
                {isEnhancing ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Category</h5>
              <Badge className={categoryBadgeClasses[feature.category as Category]}>
                <FlagIcon className="mr-1 h-3 w-3" /> 
                {categoryNames[feature.category as Category]}
              </Badge>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Drag to Categorize</h5>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drag this feature card to a category zone to prioritize it
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

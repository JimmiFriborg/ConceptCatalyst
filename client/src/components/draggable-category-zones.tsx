import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraggableFeatureCard } from "./draggable-feature-card";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Feature {
  id: number;
  name: string;
  description: string;
  perspective: "technical" | "business" | "ux" | "security";
  category: "mvp" | "launch" | "v1.5" | "v2.0" | "rejected";
  tags?: string[];
  aiEnhanced?: any;
}

interface DraggableCategoryZonesProps {
  projectId: number;
  features: Feature[];
  onAddFeature: () => void;
  onEditFeature: (feature: Feature) => void;
  onAiEnhanceFeature?: (feature: Feature) => void;
}

type CategoryType = "mvp" | "launch" | "v1.5" | "v2.0" | "rejected";

export function DraggableCategoryZones({
  projectId,
  features,
  onAddFeature,
  onEditFeature,
  onAiEnhanceFeature
}: DraggableCategoryZonesProps) {
  const queryClient = useQueryClient();
  const [draggedFeature, setDraggedFeature] = useState<Feature | null>(null);
  const [targetCategory, setTargetCategory] = useState<CategoryType | null>(null);
  const [featuresByCategory, setFeaturesByCategory] = useState<Record<CategoryType, Feature[]>>({
    mvp: [],
    launch: [],
    "v1.5": [],
    "v2.0": [],
    rejected: []
  });
  
  // Update local state when features prop changes
  useEffect(() => {
    if (!features) return;
    
    const categorized: Record<CategoryType, Feature[]> = {
      mvp: [],
      launch: [],
      "v1.5": [],
      "v2.0": [],
      rejected: []
    };
    
    features.forEach(feature => {
      if (categorized[feature.category]) {
        categorized[feature.category].push(feature);
      }
    });
    
    setFeaturesByCategory(categorized);
  }, [features]);
  
  // Mutation for updating feature category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ featureId, category }: { featureId: number, category: CategoryType }) => {
      return await apiRequest(`/api/features/${featureId}/category`, {
        method: 'PUT',
        body: JSON.stringify({ category }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Feature Updated",
        description: "The feature category has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update feature category. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleDragStart = (e: React.DragEvent, feature: Feature) => {
    setDraggedFeature(feature);
  };
  
  const handleDragOver = (e: React.DragEvent, category: CategoryType) => {
    e.preventDefault();
    if (category !== targetCategory) {
      setTargetCategory(category);
    }
  };
  
  const handleDragLeave = () => {
    setTargetCategory(null);
  };
  
  const handleDrop = (e: React.DragEvent, category: CategoryType) => {
    e.preventDefault();
    
    if (!draggedFeature) return;
    
    if (draggedFeature.category !== category) {
      // Optimistically update UI
      const updatedFeaturesByCategory = { ...featuresByCategory };
      
      // Remove from old category
      updatedFeaturesByCategory[draggedFeature.category] = 
        updatedFeaturesByCategory[draggedFeature.category].filter(f => f.id !== draggedFeature.id);
      
      // Add to new category
      const updatedFeature = { ...draggedFeature, category };
      updatedFeaturesByCategory[category].push(updatedFeature);
      
      setFeaturesByCategory(updatedFeaturesByCategory);
      
      // Update in backend
      updateCategoryMutation.mutate({ 
        featureId: draggedFeature.id, 
        category 
      });
    }
    
    setDraggedFeature(null);
    setTargetCategory(null);
  };
  
  const getCategoryName = (category: CategoryType): string => {
    switch (category) {
      case 'mvp':
        return 'MVP';
      case 'launch':
        return 'Launch';
      case 'v1.5':
        return 'Version 1.5';
      case 'v2.0':
        return 'Version 2.0';
      case 'rejected':
        return 'Rejected';
      default:
        return category;
    }
  };
  
  const getCategoryColor = (category: CategoryType): string => {
    switch (category) {
      case 'mvp':
        return 'border-green-200 bg-green-50';
      case 'launch':
        return 'border-blue-200 bg-blue-50';
      case 'v1.5':
        return 'border-purple-200 bg-purple-50';
      case 'v2.0':
        return 'border-indigo-200 bg-indigo-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getCategoryHeaderColor = (category: CategoryType): string => {
    switch (category) {
      case 'mvp':
        return 'bg-green-100 text-green-800';
      case 'launch':
        return 'bg-blue-100 text-blue-800';
      case 'v1.5':
        return 'bg-purple-100 text-purple-800';
      case 'v2.0':
        return 'bg-indigo-100 text-indigo-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const categories: CategoryType[] = ['mvp', 'launch', 'v1.5', 'v2.0', 'rejected'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
      {categories.map((category) => (
        <div key={category} className="flex flex-col h-full">
          <Card 
            className={`border-2 h-full ${
              targetCategory === category ? 'border-dashed border-gray-400' : `border-solid ${getCategoryColor(category)}`
            }`}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category)}
          >
            <CardHeader className={`py-2 px-4 ${getCategoryHeaderColor(category)}`}>
              <CardTitle className="text-sm font-medium">
                {getCategoryName(category)}
                <span className="ml-2 text-xs font-normal opacity-75">
                  ({featuresByCategory[category]?.length || 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-3 overflow-y-auto flex-1 min-h-[400px]">
              {featuresByCategory[category]?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                  <p className="text-sm">Drag features here</p>
                </div>
              ) : (
                featuresByCategory[category].map((feature) => (
                  <DraggableFeatureCard
                    key={feature.id}
                    feature={feature}
                    onDragStart={handleDragStart}
                    onEdit={() => onEditFeature(feature)}
                    onEnhance={() => onAiEnhanceFeature ? onAiEnhanceFeature(feature) : null}
                  />
                ))
              )}
              
              {category === 'mvp' && (
                <Button 
                  variant="outline"
                  className="mt-3 w-full border-dashed border-slate-300"
                  onClick={onAddFeature}
                >
                  <Plus size={16} className="mr-1" />
                  Add Feature
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
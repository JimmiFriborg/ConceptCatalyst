import { useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  MessageSquarePlus, 
  Tag, 
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface DraggableFeatureCardProps {
  feature: Feature;
  onDragStart?: (e: React.DragEvent, feature: Feature) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onEnhance?: () => void;
}

export function DraggableFeatureCard({
  feature,
  onDragStart,
  onDelete,
  onEdit,
  onEnhance
}: DraggableFeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  
  // Mutation for enhancing feature with AI
  const enhanceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/ai/enhance-description`, {
        method: 'POST',
        body: JSON.stringify({ featureId: feature.id, description: feature.description }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Feature Enhanced",
        description: "AI has enhanced your feature description with more details.",
      });
      if (onEnhance) onEnhance();
    },
    onError: () => {
      toast({
        title: "Enhancement Failed",
        description: "Unable to enhance feature. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for generating tags
  const generateTagsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/ai/generate-tags`, {
        method: 'POST',
        body: JSON.stringify({ featureId: feature.id, description: feature.description }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Tags Generated",
        description: `Generated ${data.tags.length} tags for this feature.`,
      });
    },
    onError: () => {
      toast({
        title: "Tag Generation Failed",
        description: "Unable to generate tags. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a feature
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/features/${feature.id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Feature Deleted",
        description: "The feature has been removed.",
      });
      if (onDelete) onDelete();
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Unable to delete feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onDragStart) return;
    
    setIsDragging(true);
    
    // Set drag data
    e.dataTransfer.setData('application/json', JSON.stringify(feature));
    
    // Set a custom drag image (optional)
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        cardRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
    
    onDragStart(e, feature);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDeleteClick = () => {
    const confirmed = window.confirm("Are you sure you want to delete this feature?");
    if (confirmed) {
      deleteMutation.mutate();
    }
  };
  
  const handleEditClick = () => {
    if (onEdit) onEdit();
  };
  
  const handleEnhanceClick = () => {
    enhanceMutation.mutate();
  };
  
  const handleGenerateTagsClick = () => {
    generateTagsMutation.mutate();
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

  return (
    <Card
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`shadow-sm border-slate-200 transition-all ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="font-medium text-slate-900">{feature.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Feature Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit size={16} className="mr-2" />
                Edit Feature
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEnhanceClick}>
                <MessageSquarePlus size={16} className="mr-2" />
                Enhance with AI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleGenerateTagsClick}>
                <Tag size={16} className="mr-2" />
                Generate Tags
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          {feature.description}
          {feature.aiEnhanced && (
            <Badge variant="outline" className="ml-1 bg-purple-50 border-purple-200 text-purple-800">
              <Sparkles size={12} className="mr-1" /> AI Enhanced
            </Badge>
          )}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="outline" className={getPerspectiveColor(feature.perspective)}>
            {feature.perspective}
          </Badge>
          
          {feature.tags && feature.tags.length > 0 && 
            feature.tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-slate-50">
                {tag}
              </Badge>
            ))
          }
          
          {feature.tags && feature.tags.length > 2 && (
            <Badge variant="outline" className="bg-slate-50">
              +{feature.tags.length - 2} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 border-t border-slate-100 px-4 py-2">
        <Badge 
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-grab"
          variant="secondary"
        >
          Drag to prioritize
        </Badge>
      </CardFooter>
    </Card>
  );
}
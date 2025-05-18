import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileCode, 
  Users, 
  Activity, 
  Shield, 
  Lightbulb,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquarePlus
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
import { apiRequest } from "@/lib/api-helpers";

type Feature = {
  id: number;
  name: string;
  description: string;
  perspective: "technical" | "business" | "ux" | "security";
  category: "mvp" | "launch" | "v1.5" | "v2.0" | "rejected";
  tags?: string[];
};

type Category = "mvp" | "launch" | "v1.5" | "v2.0" | "rejected";

type SimpleDashboardProps = {
  projectId: number;
  features: Feature[];
  onAddFeature?: (feature: Omit<Feature, "id">) => Promise<any>;
  onUpdateFeature?: (id: number, feature: Partial<Feature>) => Promise<any>;
  onDeleteFeature?: (id: number) => Promise<any>;
  onGenerateAiSuggestions?: () => void;
};

export function SimpleFeatureDashboard({
  projectId,
  features = [],
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onGenerateAiSuggestions
}: SimpleDashboardProps) {
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePerspective, setFeaturePerspective] = useState<"technical" | "business" | "ux" | "security">("technical");
  const [featureCategory, setFeatureCategory] = useState<Category>("mvp");
  const [dragFeature, setDragFeature] = useState<Feature | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Group features by category
  const featuresByCategory: Record<Category, Feature[]> = {
    mvp: [],
    launch: [],
    "v1.5": [],
    "v2.0": [],
    rejected: []
  };
  
  features.forEach(feature => {
    if (featuresByCategory[feature.category]) {
      featuresByCategory[feature.category].push(feature);
    }
  });
  
  // Handle editing an existing feature
  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature);
    setFeatureName(feature.name);
    setFeatureDescription(feature.description);
    setFeaturePerspective(feature.perspective);
    setFeatureCategory(feature.category);
    setShowFeatureDialog(true);
  };
  
  // Handle adding a new feature
  const handleAddFeature = () => {
    setEditingFeature(null);
    setFeatureName("");
    setFeatureDescription("");
    setFeaturePerspective("technical");
    setFeatureCategory("mvp");
    setShowFeatureDialog(true);
  };
  
  // Handle saving a feature (add or update)
  const handleSaveFeature = async () => {
    if (!featureName || !featureDescription) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (editingFeature) {
        // Update existing feature
        if (onUpdateFeature) {
          await onUpdateFeature(editingFeature.id, {
            name: featureName,
            description: featureDescription,
            perspective: featurePerspective,
            category: featureCategory
          });
        }
        
        toast({
          title: "Success",
          description: "Feature updated successfully"
        });
      } else {
        // Add new feature
        if (onAddFeature) {
          await onAddFeature({
            name: featureName,
            description: featureDescription,
            perspective: featurePerspective,
            category: featureCategory
          });
        }
        
        toast({
          title: "Success", 
          description: "Feature added successfully"
        });
      }
      
      setShowFeatureDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save feature",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle deleting a feature
  const handleDeleteFeature = async (feature: Feature) => {
    if (confirm(`Are you sure you want to delete "${feature.name}"?`)) {
      setIsLoading(true);
      
      try {
        if (onDeleteFeature) {
          await onDeleteFeature(feature.id);
        }
        
        toast({
          title: "Success",
          description: "Feature deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete feature",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle feature drag start
  const handleDragStart = (e: React.DragEvent, feature: Feature) => {
    setDragFeature(feature);
    e.dataTransfer.setData('featureId', feature.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };
  
  // Handle drag over a category zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle dropping a feature into a category
  const handleDrop = async (e: React.DragEvent, category: Category) => {
    e.preventDefault();
    
    if (!dragFeature || dragFeature.category === category) return;
    
    if (onUpdateFeature) {
      try {
        await onUpdateFeature(dragFeature.id, { category });
        
        toast({
          title: "Success",
          description: `Feature moved to ${getCategoryDisplayName(category)}`
        });
      } catch (error) {
        toast({
          title: "Error", 
          description: "Failed to move feature",
          variant: "destructive"
        });
      }
    }
    
    setDragFeature(null);
  };
  
  const getCategoryDisplayName = (category: Category): string => {
    switch (category) {
      case 'mvp': return 'MVP';
      case 'launch': return 'Launch';
      case 'v1.5': return 'Version 1.5';
      case 'v2.0': return 'Version 2.0';
      case 'rejected': return 'Rejected';
    }
  };
  
  const getCategoryColor = (category: Category): string => {
    switch (category) {
      case 'mvp': return 'bg-green-100 text-green-800 border-green-200';
      case 'launch': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'v1.5': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'v2.0': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    }
  };
  
  const getPerspectiveIcon = (perspective: string) => {
    switch (perspective) {
      case 'technical': return <FileCode className="h-4 w-4" />;
      case 'business': return <Users className="h-4 w-4" />;
      case 'ux': return <Activity className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getPerspectiveColor = (perspective: string): string => {
    switch (perspective) {
      case 'technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'business': return 'bg-green-100 text-green-800 border-green-200';
      case 'ux': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'security': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Features Dashboard</h2>
        <div className="flex space-x-2">
          {onGenerateAiSuggestions && (
            <Button 
              variant="outline" 
              onClick={onGenerateAiSuggestions}
              className="bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Generate AI Suggestions
            </Button>
          )}
          <Button onClick={handleAddFeature}>
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>
      
      {/* Feature boards by category */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
          <div 
            key={category}
            className={`border-2 rounded-lg ${dragFeature && dragFeature.category !== category ? 'border-dashed' : 'border-solid'}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category as Category)}
          >
            <div className={`p-2 text-sm font-medium rounded-t-lg ${getCategoryColor(category as Category)}`}>
              {getCategoryDisplayName(category as Category)}
              <span className="ml-1 text-xs opacity-70">({categoryFeatures.length})</span>
            </div>
            <div className="p-2 min-h-[200px] bg-slate-50 rounded-b-lg">
              {categoryFeatures.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-500">
                  Drag features here
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryFeatures.map(feature => (
                    <Card 
                      key={feature.id}
                      className="shadow-sm cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleDragStart(e, feature)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm">{feature.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditFeature(feature)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteFeature(feature)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {feature.description}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getPerspectiveColor(feature.perspective)}`}>
                          <span className="mr-1">{getPerspectiveIcon(feature.perspective)}</span>
                          {feature.perspective}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Feature dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="feature-name">Name</Label>
              <Input
                id="feature-name"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                placeholder="Feature name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea
                id="feature-description"
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                placeholder="Describe the feature"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature-perspective">Perspective</Label>
                <Select
                  value={featurePerspective}
                  onValueChange={(value: any) => setFeaturePerspective(value)}
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="feature-category">Category</Label>
                <Select
                  value={featureCategory}
                  onValueChange={(value: any) => setFeatureCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
            <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeature} disabled={isLoading}>
              {isLoading ? 'Saving...' : (editingFeature ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
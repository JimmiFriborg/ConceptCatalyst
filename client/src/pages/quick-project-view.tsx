import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Edit,
  Trash2,
  Brain,
} from "lucide-react";

// Simple direct fetch functions
const getProject = async (id: string) => {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
};

const getFeatures = async (projectId: string) => {
  const res = await fetch(`/api/projects/${projectId}/features`);
  if (!res.ok) throw new Error("Failed to fetch features");
  return res.json();
};

const addFeature = async (projectId: string, feature: any) => {
  const res = await fetch(`/api/projects/${projectId}/features`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feature),
  });
  if (!res.ok) throw new Error("Failed to add feature");
  return res.json();
};

const updateFeature = async (featureId: number, feature: any) => {
  const res = await fetch(`/api/features/${featureId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feature),
  });
  if (!res.ok) throw new Error("Failed to update feature");
  return res.json();
};

const deleteFeature = async (featureId: number) => {
  const res = await fetch(`/api/features/${featureId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete feature");
  return res.json();
};

const updateFeatureCategory = async (featureId: number, category: string) => {
  const res = await fetch(`/api/features/${featureId}/category`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
};

export default function QuickProjectView() {
  const { projectId } = useParams();
  const [, navigate] = useLocation();
  
  // State
  const [project, setProject] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  
  // Form state
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePerspective, setFeaturePerspective] = useState("technical");
  const [featureCategory, setFeatureCategory] = useState("mvp");
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (projectId) {
          const projectData = await getProject(projectId);
          setProject(projectData);
          
          const featuresData = await getFeatures(projectId);
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);
  
  // Handle adding a new feature
  const handleAddFeature = () => {
    setEditingFeature(null);
    setFeatureName("");
    setFeatureDescription("");
    setFeaturePerspective("technical");
    setFeatureCategory("mvp");
    setShowFeatureDialog(true);
  };
  
  // Handle editing a feature
  const handleEditFeature = (feature: any) => {
    setEditingFeature(feature);
    setFeatureName(feature.name);
    setFeatureDescription(feature.description);
    setFeaturePerspective(feature.perspective);
    setFeatureCategory(feature.category);
    setShowFeatureDialog(true);
  };
  
  // Handle saving a feature
  const handleSaveFeature = async () => {
    if (!featureName || !featureDescription) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingFeature) {
        // Update existing feature
        await updateFeature(editingFeature.id, {
          name: featureName,
          description: featureDescription,
          perspective: featurePerspective,
          category: featureCategory,
        });
        
        // Update local state
        setFeatures(features.map(f => 
          f.id === editingFeature.id 
            ? { ...f, name: featureName, description: featureDescription, perspective: featurePerspective, category: featureCategory }
            : f
        ));
        
        toast({
          title: "Success",
          description: "Feature updated successfully",
        });
      } else {
        // Add new feature
        const newFeature = await addFeature(projectId!, {
          name: featureName,
          description: featureDescription,
          perspective: featurePerspective,
          category: featureCategory,
        });
        
        // Update local state
        setFeatures([...features, newFeature]);
        
        toast({
          title: "Success",
          description: "Feature added successfully",
        });
      }
      
      setShowFeatureDialog(false);
    } catch (error) {
      console.error("Error saving feature:", error);
      toast({
        title: "Error",
        description: "Failed to save feature",
        variant: "destructive",
      });
    }
  };
  
  // Handle deleting a feature
  const handleDeleteFeature = async (feature: any) => {
    if (confirm(`Are you sure you want to delete "${feature.name}"?`)) {
      try {
        await deleteFeature(feature.id);
        
        // Update local state
        setFeatures(features.filter(f => f.id !== feature.id));
        
        toast({
          title: "Success",
          description: "Feature deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting feature:", error);
        toast({
          title: "Error",
          description: "Failed to delete feature",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle updating feature category
  const handleUpdateCategory = async (feature: any, newCategory: string) => {
    if (feature.category === newCategory) return;
    
    try {
      await updateFeatureCategory(feature.id, newCategory);
      
      // Update local state
      setFeatures(features.map(f => 
        f.id === feature.id 
          ? { ...f, category: newCategory }
          : f
      ));
      
      toast({
        title: "Success",
        description: `Feature moved to ${newCategory.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };
  
  // Group features by category
  const featuresByCategory: Record<string, any[]> = {
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
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading project...</div>;
  }
  
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">Project Not Found</h2>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600">{project.description}</p>
          )}
        </div>
      </div>
      
      {/* Feature Management */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Features</h2>
          <Button onClick={handleAddFeature}>
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>
        
        {/* Feature Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="bg-slate-50 py-3">
                <CardTitle className="text-sm font-medium">
                  {category.toUpperCase()}
                  <span className="text-xs text-slate-500 ml-1">({categoryFeatures.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 min-h-[200px] max-h-[400px] overflow-y-auto">
                {categoryFeatures.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-slate-400">No features</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categoryFeatures.map((feature) => (
                      <Card key={feature.id} className="shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-sm">{feature.name}</h3>
                            <div className="flex">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleEditFeature(feature)}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-500"
                                onClick={() => handleDeleteFeature(feature)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">
                            {feature.description}
                          </p>
                          
                          {/* Category dropdown for mobile */}
                          <div className="mt-2 sm:hidden">
                            <Select
                              value={feature.category}
                              onValueChange={(value) => handleUpdateCategory(feature, value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mvp">MVP</SelectItem>
                                <SelectItem value="launch">Launch</SelectItem>
                                <SelectItem value="v1.5">v1.5</SelectItem>
                                <SelectItem value="v2.0">v2.0</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Feature Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFeature ? "Edit Feature" : "Add Feature"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                  onValueChange={setFeaturePerspective}
                >
                  <SelectTrigger id="feature-perspective">
                    <SelectValue />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mvp">MVP</SelectItem>
                    <SelectItem value="launch">Launch</SelectItem>
                    <SelectItem value="v1.5">v1.5</SelectItem>
                    <SelectItem value="v2.0">v2.0</SelectItem>
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
            <Button onClick={handleSaveFeature}>
              {editingFeature ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
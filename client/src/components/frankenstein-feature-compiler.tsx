import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lightbulb, Zap, Sparkles, Braces } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Feature {
  id: number;
  name: string;
  description: string;
  perspective: string;
  category: string;
}

interface ConceptIdea {
  id: string;
  title: string;
  description: string;
  sourcedFeatures: number[];
  innovations: string[];
  implementation: string;
}

interface FrankensteinFeatureCompilerProps {
  projectId: number;
}

export function FrankensteinFeatureCompiler({ projectId }: FrankensteinFeatureCompilerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [generatedConcept, setGeneratedConcept] = useState<ConceptIdea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch all projects to find features from different projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch all features for the current project
  const { data: currentProjectFeatures, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['/api/projects', projectId, 'features'],
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
  
  // Mutation to generate Frankenstein concept
  const generateConceptMutation = useMutation({
    mutationFn: async (featureIds: number[]) => {
      return await apiRequest(`/api/projects/${projectId}/frankenstein-concept`, {
        method: 'POST',
        body: JSON.stringify({ featureIds }),
      });
    },
    onSuccess: (data) => {
      setGeneratedConcept(data);
      toast({
        title: "Concept Generated!",
        description: "A new innovative concept has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate concept. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to save concept
  const saveConceptMutation = useMutation({
    mutationFn: async (concept: ConceptIdea) => {
      return await apiRequest(`/api/projects/${projectId}/concepts`, {
        method: 'POST',
        body: JSON.stringify(concept),
      });
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setGeneratedConcept(null);
      setSelectedFeatures([]);
      toast({
        title: "Concept Saved",
        description: "Your Frankenstein concept has been saved successfully.",
      });
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'concepts'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save concept. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Get features from all projects
  const getAllFeatures = () => {
    if (!projects) return [];
    
    const allFeatures: Feature[] = [];
    
    projects.forEach((project: any) => {
      if (project.features && project.features.length > 0) {
        allFeatures.push(
          ...project.features.map((feature: Feature) => ({
            ...feature,
            projectName: project.name,
          }))
        );
      }
    });
    
    return allFeatures;
  };
  
  const handleFeatureSelect = (feature: Feature) => {
    const isSelected = selectedFeatures.some(f => f.id === feature.id);
    
    if (isSelected) {
      setSelectedFeatures(selectedFeatures.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  const handleGenerateConcept = () => {
    if (selectedFeatures.length < 2) {
      toast({
        title: "Not Enough Features",
        description: "Please select at least 2 features to combine.",
        variant: "destructive",
      });
      return;
    }
    
    generateConceptMutation.mutate(selectedFeatures.map(f => f.id));
  };
  
  const handleSaveConcept = () => {
    if (!generatedConcept) return;
    
    saveConceptMutation.mutate(generatedConcept);
  };
  
  // Handle editing the generated concept
  const handleEditConcept = () => {
    setIsEditing(true);
  };
  
  // Update concept fields
  const updateConceptField = (field: keyof ConceptIdea, value: any) => {
    if (!generatedConcept) return;
    
    setGeneratedConcept({
      ...generatedConcept,
      [field]: value,
    });
  };
  
  // Handle adding a new innovation
  const handleAddInnovation = () => {
    if (!generatedConcept) return;
    
    setGeneratedConcept({
      ...generatedConcept,
      innovations: [...generatedConcept.innovations, ""],
    });
  };
  
  // Handle updating an innovation
  const handleUpdateInnovation = (index: number, value: string) => {
    if (!generatedConcept) return;
    
    const newInnovations = [...generatedConcept.innovations];
    newInnovations[index] = value;
    
    setGeneratedConcept({
      ...generatedConcept,
      innovations: newInnovations,
    });
  };
  
  // Handle removing an innovation
  const handleRemoveInnovation = (index: number) => {
    if (!generatedConcept) return;
    
    setGeneratedConcept({
      ...generatedConcept,
      innovations: generatedConcept.innovations.filter((_, i) => i !== index),
    });
  };
  
  return (
    <>
      <Card className="shadow-md border-slate-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Sparkles size={20} />
            Frankenstein Feature Compilation
          </CardTitle>
          <CardDescription>
            Mix and match features from different projects to create innovative concept ideas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <p>Select features from different projects to combine them into a new innovative concept. The AI will help you identify potential synergies and create a unique implementation approach.</p>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Selected Features ({selectedFeatures.length})</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedFeatures.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No features selected</p>
                ) : (
                  selectedFeatures.map(feature => (
                    <Badge 
                      key={feature.id} 
                      variant="secondary"
                      className="py-1 px-3 bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                      onClick={() => handleFeatureSelect(feature)}
                    >
                      {feature.name}
                    </Badge>
                  ))
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
                className="w-full"
              >
                <Zap size={16} className="mr-2" />
                Browse Features
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button
            onClick={handleGenerateConcept}
            disabled={selectedFeatures.length < 2 || generateConceptMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generateConceptMutation.isPending ? "Generating..." : "Generate Concept"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Features selection dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Features to Combine</DialogTitle>
            <DialogDescription>
              Choose features from any project to generate a new concept idea.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 mt-4 pr-4">
            <div className="space-y-6">
              {isLoadingProjects ? (
                <div className="text-center py-4">Loading projects...</div>
              ) : (
                projects?.map((project: any) => (
                  <div key={project.id} className="space-y-2">
                    <h3 className="font-medium text-sm">{project.name}</h3>
                    <div className="space-y-1">
                      {project.features?.length > 0 ? (
                        project.features.map((feature: any) => (
                          <div 
                            key={feature.id} 
                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"
                          >
                            <Checkbox 
                              id={`feature-${feature.id}`}
                              checked={selectedFeatures.some(f => f.id === feature.id)}
                              onCheckedChange={() => handleFeatureSelect(feature)}
                            />
                            <div className="flex flex-col">
                              <label 
                                htmlFor={`feature-${feature.id}`}
                                className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {feature.name}
                              </label>
                              <p className="text-xs text-slate-500 mt-1">
                                {feature.description.length > 100 
                                  ? `${feature.description.substring(0, 100)}...` 
                                  : feature.description
                                }
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No features in this project</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">Cancel</Button>
            <Button 
              onClick={() => setIsDialogOpen(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Done ({selectedFeatures.length} selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Concept display dialog */}
      {generatedConcept && (
        <Dialog open={!!generatedConcept} onOpenChange={(open) => !open && setGeneratedConcept(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={20} />
                {isEditing ? (
                  <Input 
                    value={generatedConcept.title}
                    onChange={(e) => updateConceptField('title', e.target.value)}
                    className="font-semibold"
                  />
                ) : (
                  generatedConcept.title
                )}
              </DialogTitle>
              <DialogDescription>
                Generated from {selectedFeatures.length} features
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 mt-4 pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Concept Description</h3>
                  {isEditing ? (
                    <Textarea
                      value={generatedConcept.description}
                      onChange={(e) => updateConceptField('description', e.target.value)}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{generatedConcept.description}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Source Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map(feature => (
                      <Badge key={feature.id} variant="outline" className="bg-slate-100">
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Innovations & Unique Aspects</h3>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddInnovation}
                        className="h-7 text-xs"
                      >
                        Add
                      </Button>
                    )}
                  </div>
                  <ul className="list-disc list-inside space-y-2">
                    {generatedConcept.innovations.map((innovation, idx) => (
                      <li key={idx} className="text-sm text-slate-700">
                        {isEditing ? (
                          <div className="flex items-center gap-2 ml-6 -mt-5">
                            <Input 
                              value={innovation}
                              onChange={(e) => handleUpdateInnovation(idx, e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleRemoveInnovation(idx)}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          innovation
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Implementation Approach</h3>
                  {isEditing ? (
                    <Textarea
                      value={generatedConcept.implementation}
                      onChange={(e) => updateConceptField('implementation', e.target.value)}
                      className="min-h-[120px]"
                    />
                  ) : (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {generatedConcept.implementation}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="mt-4">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel Editing
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Apply Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleEditConcept}
                  >
                    Edit Concept
                  </Button>
                  <Button 
                    onClick={handleSaveConcept}
                    disabled={saveConceptMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saveConceptMutation.isPending ? "Saving..." : "Save Concept"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
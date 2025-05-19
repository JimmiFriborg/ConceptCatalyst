import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Feature } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Braces, Sparkles, Brain, Lightbulb, X, Plus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FrankensteinFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

interface ConceptIdea {
  id: string;
  title: string;
  description: string;
  sourcedFeatures: number[];
  innovations: string[];
  implementation: string;
}

export function FrankensteinFeatureDialog({
  open,
  onOpenChange,
  projectId
}: FrankensteinFeatureDialogProps) {
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConcept, setGeneratedConcept] = useState<ConceptIdea | null>(null);
  const [innovationIdea, setInnovationIdea] = useState("");
  const [innovations, setInnovations] = useState<string[]>([]);
  
  // Fetch all features from the feature bank
  const { data: featureBank = [], isLoading } = useQuery<Feature[]>({
    queryKey: ["/api/features"],
    queryFn: async () => {
      // This is a placeholder - we'll need to implement an API endpoint for all features
      const res = await fetch("/api/features");
      if (!res.ok) return [];
      return res.json();
    },
  });
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedFeatures([]);
      setGeneratedConcept(null);
      setInnovations([]);
      setInnovationIdea("");
    }
  }, [open]);
  
  const handleFeatureSelect = (feature: Feature) => {
    if (selectedFeatures.some(f => f.id === feature.id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  const handleAddInnovation = () => {
    if (innovationIdea.trim()) {
      setInnovations([...innovations, innovationIdea.trim()]);
      setInnovationIdea("");
    }
  };
  
  const handleRemoveInnovation = (index: number) => {
    setInnovations(innovations.filter((_, i) => i !== index));
  };
  
  const generateConcept = async () => {
    if (selectedFeatures.length < 2) {
      toast({
        title: "Not enough features selected",
        description: "Please select at least 2 features to combine.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API endpoint that uses OpenAI
      // For now, we'll simulate the concept generation
      setTimeout(() => {
        const concept: ConceptIdea = {
          id: Math.random().toString(36).substr(2, 9),
          title: "Combined Feature Concept",
          description: `A new feature concept that combines elements from ${selectedFeatures.length} different features with ${innovations.length} innovative additions.`,
          sourcedFeatures: selectedFeatures.map(f => f.id),
          innovations: innovations,
          implementation: "This feature can be implemented by integrating the core functionality from the selected features and enhancing them with the innovative elements."
        };
        
        setGeneratedConcept(concept);
        setIsGenerating(false);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error generating concept",
        description: "There was an error generating your feature concept.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };
  
  const saveAsConcept = async (concept: ConceptIdea) => {
    try {
      // Create a new concept (essentially a project with type concept)
      const newConcept = await apiRequest("/api/concepts", "POST", {
        name: concept.title,
        description: concept.description,
        frankensteinFeatures: concept.sourcedFeatures,
        innovations: concept.innovations,
        implementation: concept.implementation,
        parentId: projectId
      });
      
      toast({
        title: "Concept created",
        description: "Your new feature concept has been saved.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error saving concept",
        description: "There was an error saving your feature concept.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Braces className="h-5 w-5 text-primary" />
            Frankenstein Feature Generator
          </DialogTitle>
          <DialogDescription>
            Combine existing features with new ideas to create innovative concepts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Feature Selection Panel */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Select Features
            </h3>
            
            {isLoading ? (
              <div className="flex-1 grid grid-cols-1 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="h-24 animate-pulse bg-secondary/20" />
                ))}
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4 h-[300px]">
                <div className="space-y-3">
                  {featureBank.map(feature => (
                    <div
                      key={feature.id}
                      className={`p-3 border rounded-md transition-colors cursor-pointer ${
                        selectedFeatures.some(f => f.id === feature.id)
                          ? "border-primary bg-primary/10"
                          : "hover:bg-secondary/20"
                      }`}
                      onClick={() => handleFeatureSelect(feature)}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={selectedFeatures.some(f => f.id === feature.id)}
                          onCheckedChange={() => handleFeatureSelect(feature)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{feature.name}</div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {feature.description}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {feature.perspective}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {feature.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
              </p>
              
              <div className="flex flex-wrap gap-2">
                {selectedFeatures.map(feature => (
                  <Badge 
                    key={feature.id}
                    variant="secondary"
                    className="gap-1 pl-2"
                  >
                    {feature.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFeatureSelect(feature)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Innovation Panel */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Add Innovations
            </h3>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a new innovative idea..."
                value={innovationIdea}
                onChange={(e) => setInnovationIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddInnovation()}
              />
              <Button onClick={handleAddInnovation} disabled={!innovationIdea.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 pr-4 h-[150px]">
              <div className="space-y-2">
                {innovations.map((innovation, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{innovation}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInnovation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {innovations.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>Add innovative ideas to enhance your feature concept</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
            
            <Button 
              onClick={generateConcept} 
              disabled={selectedFeatures.length < 2 || isGenerating}
              className="mt-auto"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Concept
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Generated Concept */}
        {generatedConcept && (
          <>
            <Separator className="my-4" />
            
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {generatedConcept.title}
              </h3>
              
              <p className="mb-4">{generatedConcept.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Sourced Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map(feature => (
                      <Badge key={feature.id} variant="outline">
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Innovative Additions</h4>
                  <div className="flex flex-wrap gap-2">
                    {innovations.map((innovation, index) => (
                      <Badge key={index} variant="secondary">
                        {innovation}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2">Implementation Notes</h4>
              <p className="text-sm text-muted-foreground">
                {generatedConcept.implementation}
              </p>
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setGeneratedConcept(null)}
              >
                Regenerate
              </Button>
              <Button 
                onClick={() => saveAsConcept(generatedConcept)}
              >
                Save as Concept
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
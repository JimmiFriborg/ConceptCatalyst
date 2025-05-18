import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Feature, Project } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [randomizedFeatures, setRandomizedFeatures] = useState<Feature[]>([]);
  const [generatedConcepts, setGeneratedConcepts] = useState<ConceptIdea[]>([]);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [numberOfFeatures, setNumberOfFeatures] = useState(3);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock data for now (to be replaced with actual data from API call)
  const mockProjects = [
    { id: 1, name: "Project Alpha" },
    { id: 2, name: "Project Beta" },
    { id: 3, name: "Project Gamma" }
  ];

  // Mock function to get all features across projects
  const getAllFeatures = async () => {
    // This would be replaced with an actual API call
    console.log("Fetching all features across projects");
    return [
      { id: 1, name: "User Authentication", description: "Secure login system with 2FA", category: "mvp", projectId: 1 },
      { id: 2, name: "Data Visualization", description: "Interactive charts and graphs", category: "v1.5", projectId: 1 },
      { id: 3, name: "Export to PDF", description: "Generate PDF reports", category: "v2.0", projectId: 2 },
      { id: 4, name: "Real-time Notifications", description: "Push notifications for updates", category: "launch", projectId: 3 },
      { id: 5, name: "AI Recommendations", description: "Personalized content suggestions", category: "mvp", projectId: 2 },
    ] as Feature[];
  };

  // Use react-query to fetch features from all user projects
  const { data: allFeatures = [], isLoading } = useQuery({
    queryKey: ['all-features'],
    queryFn: getAllFeatures
  });

  const handleFeatureSelect = (feature: Feature) => {
    if (selectedFeatures.find(f => f.id === feature.id)) {
      setSelectedFeatures(selectedFeatures.filter(f => f.id !== feature.id));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const randomizeFeatures = () => {
    // Randomly select N features from the available pool
    const shuffled = [...allFeatures].sort(() => 0.5 - Math.random());
    setRandomizedFeatures(shuffled.slice(0, numberOfFeatures));
    setSelectedFeatures(shuffled.slice(0, numberOfFeatures));
  };

  const generateConcepts = async () => {
    if (selectedFeatures.length < 2) {
      toast({
        title: "Not enough features",
        description: "Please select at least 2 features to generate concepts",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingConcepts(true);
    
    try {
      // This would be an actual API call to the AI service
      // For now, we'll just wait and return mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockConcepts: ConceptIdea[] = [
        {
          id: '1',
          title: "Intelligent Reporting System",
          description: "A system that combines data visualization with AI recommendations to create smart, context-aware reports that users can export as PDFs.",
          sourcedFeatures: selectedFeatures.map(f => f.id),
          innovations: [
            "Context-aware data presentation",
            "Learning from user interactions to improve future reports"
          ],
          implementation: "Combine the data visualization engine with the AI recommendation system, then pipe the output to the PDF export module."
        },
        {
          id: '2',
          title: "Security Insight Platform",
          description: "Leverage authentication data and AI to provide personalized security recommendations, with visual representations of potential vulnerabilities.",
          sourcedFeatures: selectedFeatures.map(f => f.id),
          innovations: [
            "Predictive security profiling",
            "Visual security posture assessment"
          ],
          implementation: "Use authentication patterns to feed the AI recommendation engine, then visualize the outputs."
        }
      ];
      
      setGeneratedConcepts(mockConcepts);
      toast({
        title: "Concepts generated",
        description: `Created ${mockConcepts.length} innovative concept ideas!`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate concepts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const saveAsConcept = async (concept: ConceptIdea) => {
    try {
      // This would be an actual API call to save the concept
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Concept saved",
        description: `"${concept.title}" has been saved as a new concept feature.`
      });
      
      // Update the data cache to reflect the new concept
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save concept. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = mockProjects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Frankenstein Feature Compilation</DialogTitle>
          <DialogDescription>
            Mix and match features from your projects to create innovative concepts
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="selection" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="selection">Feature Selection</TabsTrigger>
            <TabsTrigger value="combination">Feature Combination</TabsTrigger>
            <TabsTrigger value="concepts">Generated Concepts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="selection" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Select Features</h3>
                <p className="text-sm text-gray-500">Choose features from your projects to combine</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm">Number of random features: {numberOfFeatures}</span>
                  <Slider 
                    value={[numberOfFeatures]} 
                    min={2} 
                    max={5} 
                    step={1} 
                    onValueChange={(value) => setNumberOfFeatures(value[0])} 
                    className="w-[150px]" 
                  />
                </div>
                <Button onClick={randomizeFeatures} variant="secondary">
                  Randomize
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {allFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={`feature-${feature.id}`} 
                          checked={!!selectedFeatures.find(f => f.id === feature.id)}
                          onCheckedChange={() => handleFeatureSelect(feature)}
                        />
                        <div>
                          <label 
                            htmlFor={`feature-${feature.id}`} 
                            className="font-medium cursor-pointer"
                          >
                            {feature.name}
                          </label>
                          <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{feature.category}</Badge>
                        <Badge variant="secondary">{getProjectName(feature.projectId)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => document.querySelector('[data-value="combination"]')?.click()}>
                Next: Combine Features
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="combination" className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-medium">Selected Features ({selectedFeatures.length})</h3>
              <p className="text-sm text-gray-500">Review your feature selection before generating concepts</p>
            </div>
            
            {selectedFeatures.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-gray-500">No features selected. Go back to select features.</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => document.querySelector('[data-value="selection"]')?.click()}
                >
                  Select Features
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFeatures.map((feature) => (
                  <Card key={feature.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{feature.name}</CardTitle>
                        <Badge variant="outline">{feature.category}</Badge>
                      </div>
                      <CardDescription>{getProjectName(feature.projectId)}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>{feature.description}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-2 pb-2 bg-gray-50 dark:bg-gray-800">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-auto text-xs"
                        onClick={() => handleFeatureSelect(feature)}
                      >
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={() => document.querySelector('[data-value="selection"]')?.click()}
              >
                Back to Selection
              </Button>
              
              <Button 
                disabled={selectedFeatures.length < 2 || isGeneratingConcepts}
                onClick={generateConcepts}
              >
                {isGeneratingConcepts ? "Generating..." : "Generate Concepts"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="concepts" className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-medium">Generated Concepts</h3>
              <p className="text-sm text-gray-500">AI-generated concepts from your selected features</p>
            </div>
            
            {generatedConcepts.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-gray-500">No concepts generated yet. Combine features to create concepts.</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => document.querySelector('[data-value="combination"]')?.click()}
                >
                  Combine Features
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedConcepts.map((concept) => (
                  <Card key={concept.id} className="overflow-hidden">
                    <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
                      <CardTitle className="text-lg">{concept.title}</CardTitle>
                      <CardDescription className="text-sm">
                        AI-generated concept from {concept.sourcedFeatures.length} features
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Concept Description</h4>
                        <p className="text-sm">{concept.description}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Innovative Aspects</h4>
                        <ul className="space-y-1 text-sm">
                          {concept.innovations.map((innovation, idx) => (
                            <li key={idx} className="flex items-baseline">
                              <span className="text-blue-500 mr-2">•</span>
                              <span>{innovation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Implementation Approach</h4>
                        <p className="text-sm">{concept.implementation}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Source Features</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedFeatures.map((feature) => (
                            <Badge key={feature.id} variant="outline" className="text-xs">
                              {feature.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
                      <Button
                        onClick={() => saveAsConcept(concept)}
                        className="ml-auto"
                      >
                        Save as Feature Concept
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
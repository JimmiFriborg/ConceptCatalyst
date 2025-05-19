import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, Save } from "lucide-react";

interface WhatIfGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: number;
  projectData?: {
    name: string;
    description: string;
    projectCategory?: string;
  };
  features?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

interface WhatIfPrompt {
  type: "category_switch" | "concept_remix" | "feature_combo" | "constraints" | "custom";
  title: string;
  description: string;
}

interface WhatIfIdea {
  title: string;
  description: string;
  features: string[];
  uniqueValue: string;
  feasibility: "high" | "medium" | "low";
}

const WHAT_IF_PROMPTS: WhatIfPrompt[] = [
  {
    type: "category_switch",
    title: "Category Switch",
    description: "What if this project was in a completely different category?"
  },
  {
    type: "concept_remix",
    title: "Concept Remix",
    description: "What if we combined this concept with another popular service or product?"
  },
  {
    type: "feature_combo",
    title: "Feature Combination",
    description: "What if we combined several unrelated features into something new?"
  },
  {
    type: "constraints",
    title: "New Constraints",
    description: "What if we had unusual constraints (e.g., offline-only, voice-only, etc.)?"
  },
  {
    type: "custom",
    title: "Custom What-If",
    description: "Create your own what-if scenario"
  }
];

const TARGET_CATEGORIES = [
  "game", "tool", "business", "social", "education", 
  "entertainment", "productivity", "health", "finance"
];

export function WhatIfGenerator({ 
  open, 
  onOpenChange, 
  projectId,
  projectData,
  features = []
}: WhatIfGeneratorProps) {
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<WhatIfPrompt | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [targetCategory, setTargetCategory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<WhatIfIdea[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

  const handlePromptSelect = (promptType: string) => {
    const prompt = WHAT_IF_PROMPTS.find(p => p.type === promptType);
    if (prompt) {
      setSelectedPrompt(prompt);
      // Reset other inputs when changing prompt type
      if (prompt.type !== "category_switch") setTargetCategory("");
      if (prompt.type !== "feature_combo") setSelectedFeatures([]);
      if (prompt.type !== "custom") setCustomPrompt("");
    }
  };

  const toggleFeatureSelection = (featureId: number) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const generateWhatIfIdeas = async () => {
    if (!selectedPrompt) {
      toast({
        title: "Please select a what-if scenario",
        description: "Choose a scenario type to generate creative ideas",
        variant: "destructive"
      });
      return;
    }

    // Validate scenario-specific inputs
    if (selectedPrompt.type === "category_switch" && !targetCategory) {
      toast({
        title: "Missing target category",
        description: "Please select a target category for your what-if scenario",
        variant: "destructive"
      });
      return;
    }

    if (selectedPrompt.type === "feature_combo" && selectedFeatures.length < 2) {
      toast({
        title: "Select more features",
        description: "Please select at least 2 features to combine",
        variant: "destructive"
      });
      return;
    }

    if (selectedPrompt.type === "custom" && !customPrompt.trim()) {
      toast({
        title: "Missing custom prompt",
        description: "Please enter your custom what-if scenario",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // In a real implementation, this would make a request to the AI service
      // For now, we'll simulate the response with mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock ideas based on the scenario type
      const mockIdeas = generateMockIdeas();
      setGeneratedIdeas(mockIdeas);

      toast({
        title: "Ideas generated!",
        description: `Generated ${mockIdeas.length} creative what-if ideas`,
      });
    } catch (error) {
      console.error("Error generating what-if ideas:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdeaAsConcept = async (idea: WhatIfIdea) => {
    try {
      // In a real implementation, this would save to the database
      console.log("Saving idea as concept:", idea);
      
      toast({
        title: "Concept saved!",
        description: `"${idea.title}" has been saved as a new concept`,
      });
    } catch (error) {
      console.error("Error saving concept:", error);
      toast({
        title: "Save failed",
        description: "Failed to save concept. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateMockIdeas = (): WhatIfIdea[] => {
    if (!selectedPrompt) return [];

    const mockIdeas: WhatIfIdea[] = [];
    const projectName = projectData?.name || "Project";
    const projectDesc = projectData?.description || "A software project";

    if (selectedPrompt.type === "category_switch") {
      mockIdeas.push({
        title: `${targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1)} Version of ${projectName}`,
        description: `A reimagined version of ${projectName} as a ${targetCategory} application, with all the core functionality preserved but adapted to the ${targetCategory} context.`,
        features: ["Adapted user interface", "Category-specific features", "Modified user flow"],
        uniqueValue: `Brings the value of ${projectName} to the ${targetCategory} space, opening new markets and use cases.`,
        feasibility: "medium"
      });
      
      mockIdeas.push({
        title: `${projectName} ${targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1)} Edition`,
        description: `A specialized version of ${projectName} that focuses exclusively on ${targetCategory}-related functionality, simplifying the experience for this specific domain.`,
        features: ["Streamlined workflow", "Domain-specific tools", "Integrated analytics"],
        uniqueValue: `Provides a focused, optimized experience for ${targetCategory} users with specialized needs.`,
        feasibility: "high"
      });
    } 
    else if (selectedPrompt.type === "concept_remix") {
      mockIdeas.push({
        title: `${projectName} + Spotify`,
        description: `A version of ${projectName} that integrates deeply with music streaming, allowing users to create themed playlists based on their activity in the app.`,
        features: ["Music integration", "Mood-based recommendations", "Activity soundtracks"],
        uniqueValue: "Creates an emotional connection with users through personalized music experiences.",
        feasibility: "medium"
      });
      
      mockIdeas.push({
        title: `${projectName} + Reddit`,
        description: `A community-powered version of ${projectName} with upvoting, discussion threads, and community moderation built directly into the core experience.`,
        features: ["Voting system", "Discussion threads", "Community curation"],
        uniqueValue: "Harnesses collective intelligence to improve content quality and user engagement.",
        feasibility: "high"
      });
    }
    else if (selectedPrompt.type === "feature_combo") {
      const selectedFeatureNames = selectedFeatures
        .map(id => features.find(f => f.id === id)?.name || "")
        .filter(Boolean);
      
      mockIdeas.push({
        title: `${selectedFeatureNames.join(" + ")} Fusion`,
        description: `A novel approach that combines the unique aspects of ${selectedFeatureNames.join(" and ")} into a seamless experience.`,
        features: ["Integrated workflow", "Cross-feature data sharing", "Unified interface"],
        uniqueValue: "Creates unexpected synergies between previously separate features.",
        feasibility: "medium"
      });
    }
    else if (selectedPrompt.type === "constraints") {
      mockIdeas.push({
        title: `Offline-first ${projectName}`,
        description: `A version of ${projectName} designed to work primarily offline, syncing when connections are available, ideal for low-connectivity environments.`,
        features: ["Full offline functionality", "Background syncing", "Conflict resolution"],
        uniqueValue: "Makes the service accessible to users with limited internet access.",
        feasibility: "medium"
      });
      
      mockIdeas.push({
        title: `Voice-only ${projectName}`,
        description: `A reimagined version of ${projectName} that works entirely through voice commands, making it accessible while driving or for visually impaired users.`,
        features: ["Natural language input", "Voice feedback", "Hands-free operation"],
        uniqueValue: "Opens up new use contexts and accessibility options.",
        feasibility: "low"
      });
    }
    else if (selectedPrompt.type === "custom") {
      mockIdeas.push({
        title: `Custom Concept: ${projectName} Reimagined`,
        description: `A creative take on ${projectName} that explores: ${customPrompt}`,
        features: ["Innovative approach", "Unexpected functionality", "Novel user experience"],
        uniqueValue: "Breaks conventional thinking about the problem space.",
        feasibility: "medium"
      });
    }

    // Add a third random idea for variety
    mockIdeas.push({
      title: `AI-powered ${projectName}`,
      description: `A version of ${projectName} that uses advanced AI to predict user needs, automate routine tasks, and provide intelligent recommendations.`,
      features: ["Predictive analytics", "Automated workflows", "Smart suggestions"],
      uniqueValue: "Dramatically reduces user effort while improving outcomes.",
      feasibility: "medium"
    });

    return mockIdeas;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" /> 
            What-If Idea Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select a What-If Scenario</h3>
            <Select onValueChange={handlePromptSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a what-if scenario" />
              </SelectTrigger>
              <SelectContent>
                {WHAT_IF_PROMPTS.map(prompt => (
                  <SelectItem key={prompt.type} value={prompt.type}>
                    {prompt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPrompt && (
              <p className="text-sm text-muted-foreground">
                {selectedPrompt.description}
              </p>
            )}
          </div>
          
          {/* Scenario-specific inputs */}
          {selectedPrompt?.type === "category_switch" && (
            <div className="space-y-4">
              <h3 className="text-md font-medium">Target Category</h3>
              <Select onValueChange={setTargetCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedPrompt?.type === "feature_combo" && features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium">Select Features to Combine</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Choose 2 or more features to create an unexpected combination
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto p-2">
                {features.map(feature => (
                  <div 
                    key={feature.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedFeatures.includes(feature.id) ? 'bg-secondary border-primary' : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => toggleFeatureSelection(feature.id)}
                  >
                    <div className="font-medium">{feature.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {feature.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedPrompt?.type === "custom" && (
            <div className="space-y-4">
              <h3 className="text-md font-medium">Custom What-If Scenario</h3>
              <Textarea 
                placeholder="Describe your what-if scenario... (e.g., What if this project had to work underwater?)"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
          
          <Button 
            className="w-full" 
            onClick={generateWhatIfIdeas}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate What-If Ideas
              </>
            )}
          </Button>
          
          {/* Generated ideas section */}
          {generatedIdeas.length > 0 && (
            <div className="space-y-4 mt-4">
              <Separator />
              <h3 className="text-lg font-medium">Generated Ideas</h3>
              
              <div className="space-y-4">
                {generatedIdeas.map((idea, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-semibold">{idea.title}</h4>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        idea.feasibility === 'high' ? 'bg-green-100 text-green-800' :
                        idea.feasibility === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {idea.feasibility.charAt(0).toUpperCase() + idea.feasibility.slice(1)} Feasibility
                      </div>
                    </div>
                    
                    <p className="text-sm">{idea.description}</p>
                    
                    {idea.features.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-1">Key Features:</h5>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {idea.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Unique Value:</h5>
                      <p className="text-sm text-muted-foreground">{idea.uniqueValue}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 gap-1"
                      onClick={() => saveIdeaAsConcept(idea)}
                    >
                      <Save className="h-4 w-4" />
                      Save as New Concept
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
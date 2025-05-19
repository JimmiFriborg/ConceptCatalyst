import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Loader2, Save, Zap } from "lucide-react";

interface ConceptGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GeneratedConcept {
  title: string;
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  uniqueValue: string;
}

export function ConceptGenerator({ open, onOpenChange }: ConceptGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"name-to-concept" | "description-to-title">("name-to-concept");
  const [conceptName, setConceptName] = useState("");
  const [conceptDescription, setConceptDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConcept, setGeneratedConcept] = useState<GeneratedConcept | null>(null);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const generateConceptFromName = async () => {
    if (!conceptName.trim()) {
      toast({
        title: "Missing concept name",
        description: "Please enter a name to generate a concept",
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

      // Generate a concept based on the name
      const concept = generateMockConceptFromName(conceptName);
      setGeneratedConcept(concept);

      toast({
        title: "Concept generated!",
        description: "AI has generated a concept based on your name",
      });
    } catch (error) {
      console.error("Error generating concept:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate concept. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTitlesFromDescription = async () => {
    if (!conceptDescription.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a description to generate titles",
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

      // Generate titles based on the description
      const titles = generateMockTitles(conceptDescription);
      setGeneratedTitles(titles);

      toast({
        title: "Titles generated!",
        description: `Generated ${titles.length} potential titles for your concept`,
      });
    } catch (error) {
      console.error("Error generating titles:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate titles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveConcept = async (concept: GeneratedConcept) => {
    try {
      // In a real implementation, this would save to the database
      console.log("Saving concept:", concept);
      
      toast({
        title: "Concept saved!",
        description: `"${concept.title}" has been saved as a new concept`,
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

  const saveTitle = async (title: string) => {
    try {
      // In a real implementation, this would update the concept with the new title
      console.log("Saving title:", title);
      
      toast({
        title: "Title saved!",
        description: `"${title}" has been saved as your concept title`,
      });
      
      setGeneratedTitles([]);
      setConceptDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving title:", error);
      toast({
        title: "Save failed",
        description: "Failed to save title. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateMockConceptFromName = (name: string): GeneratedConcept => {
    // Create different concept types based on word patterns in the name
    const isApp = name.toLowerCase().includes("app") || name.toLowerCase().includes("ly");
    const isTool = name.toLowerCase().includes("tool") || name.toLowerCase().includes("hub") || name.toLowerCase().includes("pro");
    const isPlatform = name.toLowerCase().includes("platform") || name.toLowerCase().includes("space");
    
    if (isApp) {
      return {
        title: name,
        description: `${name} is a mobile application that helps users organize their daily tasks and increase productivity through smart notifications and AI-powered suggestions.`,
        keyFeatures: [
          "Smart task organization",
          "AI-powered priority suggestions",
          "Customizable notification system",
          "Cross-device synchronization"
        ],
        targetAudience: "Busy professionals, students, and anyone seeking to improve their productivity and time management skills.",
        uniqueValue: "Unlike traditional task managers, our AI learns from your behavior to provide increasingly accurate suggestions and eliminate productivity bottlenecks."
      };
    } else if (isTool) {
      return {
        title: name,
        description: `${name} is a specialized tool for creative professionals that streamlines the content creation process from ideation to publication with advanced automation features.`,
        keyFeatures: [
          "Integrated creative workflow",
          "Asset management system",
          "Collaboration tools",
          "Publishing automation"
        ],
        targetAudience: "Content creators, designers, marketing teams, and creative professionals looking to streamline their workflow.",
        uniqueValue: "By combining multiple stages of the creative process in one seamless tool, ${name} reduces context switching and increases creative output."
      };
    } else if (isPlatform) {
      return {
        title: name,
        description: `${name} is a comprehensive platform that connects service providers with customers in the home improvement industry, facilitating seamless booking, payment processing, and follow-up management.`,
        keyFeatures: [
          "Intelligent provider matching",
          "Secure payment processing",
          "Scheduling automation",
          "Feedback and rating system"
        ],
        targetAudience: "Homeowners seeking reliable service providers and professionals looking to expand their client base in the home improvement sector.",
        uniqueValue: "Our dual-sided platform creates value for both customers and service providers by removing friction from every step of the home improvement process."
      };
    } else {
      // Default concept
      return {
        title: name,
        description: `${name} is an innovative service that leverages cutting-edge technology to solve everyday problems in a user-friendly and accessible way.`,
        keyFeatures: [
          "Intuitive user interface",
          "Personalized user experience",
          "Integration with existing systems",
          "Comprehensive analytics"
        ],
        targetAudience: "Tech-savvy individuals and businesses looking to adopt the latest solutions for improved efficiency and outcomes.",
        uniqueValue: "By focusing on both technological innovation and user experience, ${name} delivers powerful functionality without the complexity often associated with advanced solutions."
      };
    }
  };

  const generateMockTitles = (description: string): string[] => {
    // Extract key themes from the description
    const words = description.toLowerCase().split(/\s+/);
    const themes = ["digital", "smart", "eco", "tech", "flow", "nova", "pulse", "spark", "core", "nexus"];
    const foundThemes = themes.filter(theme => words.some(word => word.includes(theme)));
    
    // Generate titles based on themes found in the description
    const titles: string[] = [];
    
    if (words.includes("app") || words.includes("mobile") || words.includes("phone")) {
      titles.push(`${foundThemes[0] || "Flow"}App`);
      titles.push(`${foundThemes[1] || "Pulse"}ify`);
      titles.push(`${foundThemes[0] || "Smart"}Track`);
    } else if (words.includes("tool") || words.includes("platform") || words.includes("system")) {
      titles.push(`${foundThemes[0] || "Tech"}Pro`);
      titles.push(`${foundThemes[1] || "Core"}Hub`);
      titles.push(`${foundThemes[0] || "Nova"}Suite`);
    } else if (words.includes("service") || words.includes("solution") || words.includes("help")) {
      titles.push(`${foundThemes[0] || "Nexus"}Serve`);
      titles.push(`${foundThemes[1] || "Smart"}Solutions`);
      titles.push(`${foundThemes[0] || "Pulse"}Assist`);
    } else {
      // Default titles
      titles.push(`${foundThemes[0] || "Nova"}`);
      titles.push(`${foundThemes[0] || "Spark"}${foundThemes[1] || "Flow"}`);
      titles.push(`${foundThemes[0] || "Tech"}${words.length % 2 === 0 ? "ify" : "Pro"}`);
    }
    
    // Add one more random title for variety
    const prefixes = ["Ultra", "Meta", "Hyper", "Vital", "Peak", "Prime", "Flux", "Echo"];
    const suffixes = ["AI", "ify", "Hub", "Pro", "Plus", "X", "Now", "Connect"];
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    titles.push(`${randomPrefix}${randomSuffix}`);
    
    return titles;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Lightbulb className="h-6 w-6 text-primary" /> 
            AI Concept Generator
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="name-to-concept">Name to Concept</TabsTrigger>
            <TabsTrigger value="description-to-title">Description to Title</TabsTrigger>
          </TabsList>
          
          <TabsContent value="name-to-concept">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Generate a concept from a name</h3>
                <p className="text-sm text-muted-foreground">
                  Have a great name but not sure what it could be? Let AI generate a complete concept based on just the name.
                </p>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter a concept name (e.g., FlowApp, TechHub, etc.)"
                    value={conceptName}
                    onChange={(e) => setConceptName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={generateConceptFromName}
                    disabled={isGenerating || !conceptName.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Generated concept */}
              {generatedConcept && (
                <div className="space-y-4 mt-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Generated Concept</h3>
                  
                  <div className="p-4 border rounded-lg space-y-3">
                    <h4 className="text-xl font-semibold">{generatedConcept.title}</h4>
                    <p className="text-sm">{generatedConcept.description}</p>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Key Features:</h5>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        {generatedConcept.keyFeatures.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Target Audience:</h5>
                      <p className="text-sm text-muted-foreground">{generatedConcept.targetAudience}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Unique Value Proposition:</h5>
                      <p className="text-sm text-muted-foreground">{generatedConcept.uniqueValue}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-2 gap-1"
                      onClick={() => saveConcept(generatedConcept)}
                    >
                      <Save className="h-4 w-4" />
                      Save as New Concept
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="description-to-title">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Generate titles from a description</h3>
                <p className="text-sm text-muted-foreground">
                  Have a concept but struggling to find the perfect name? Let AI suggest titles based on your description.
                </p>
                
                <Textarea 
                  placeholder="Describe your concept in detail..."
                  value={conceptDescription}
                  onChange={(e) => setConceptDescription(e.target.value)}
                  className="min-h-[150px]"
                />
                
                <Button 
                  className="w-full"
                  onClick={generateTitlesFromDescription}
                  disabled={isGenerating || !conceptDescription.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Titles...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Generate Titles
                    </>
                  )}
                </Button>
              </div>
              
              {/* Generated titles */}
              {generatedTitles.length > 0 && (
                <div className="space-y-4 mt-4">
                  <Separator />
                  <h3 className="text-lg font-medium">Generated Titles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedTitles.map((title, index) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded-lg flex justify-between items-center hover:bg-secondary/30 cursor-pointer"
                        onClick={() => saveTitle(title)}
                      >
                        <span className="text-lg font-medium">{title}</span>
                        <Button size="sm" variant="ghost">
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Click on a title to select it for your concept.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
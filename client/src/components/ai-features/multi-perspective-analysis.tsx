import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Code, BarChart4, Layers, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MultiPerspectiveAnalysisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  featureId?: number;
  featureName?: string;
  featureDescription?: string;
}

type Perspective = "technical" | "security" | "business" | "ux";

interface PerspectiveAnalysis {
  title: string;
  summary: string;
  considerations: string[];
  recommendations: string[];
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
}

export function MultiPerspectiveAnalysis({ 
  open, 
  onOpenChange,
  projectId,
  featureId,
  featureName = "Feature",
  featureDescription = "A feature description"
}: MultiPerspectiveAnalysisProps) {
  const { toast } = useToast();
  const [activePerspective, setActivePerspective] = useState<Perspective>("technical");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<Record<Perspective, PerspectiveAnalysis | null>>({
    technical: null,
    security: null,
    business: null,
    ux: null
  });

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // For each perspective, we'd make an API call to the server
      // For now, we'll simulate responses with mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults: Record<Perspective, PerspectiveAnalysis> = {
        technical: generateMockTechnicalAnalysis(),
        security: generateMockSecurityAnalysis(),
        business: generateMockBusinessAnalysis(),
        ux: generateMockUxAnalysis()
      };
      
      setAnalysisResults(mockResults);
      
      toast({
        title: "Analysis complete",
        description: "Multi-perspective analysis has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to generate perspective analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockTechnicalAnalysis = (): PerspectiveAnalysis => {
    return {
      title: "Technical Perspective Analysis",
      summary: `From a technical standpoint, implementing "${featureName}" requires careful consideration of the existing architecture and potential dependencies.`,
      considerations: [
        "Integration with existing codebase and systems",
        "Potential performance impacts on the application",
        "Scalability considerations for growing user base",
        "Technical debt implications"
      ],
      recommendations: [
        "Use a modular approach to minimize coupling with existing systems",
        "Implement comprehensive unit and integration tests",
        "Consider implementing as a microservice if complexity warrants",
        "Document technical decisions and architectural choices"
      ],
      impact: "medium",
      effort: "high"
    };
  };

  const generateMockSecurityAnalysis = (): PerspectiveAnalysis => {
    return {
      title: "Security Perspective Analysis",
      summary: `The "${featureName}" feature introduces several security considerations that should be addressed before implementation.`,
      considerations: [
        "Data privacy implications and regulatory compliance",
        "Authentication and authorization requirements",
        "Potential attack vectors and vulnerabilities",
        "Secure data storage and transmission"
      ],
      recommendations: [
        "Implement proper input validation and sanitization",
        "Use encryption for sensitive data in transit and at rest",
        "Conduct a security review before deployment",
        "Consider implementing rate limiting to prevent abuse"
      ],
      impact: "high",
      effort: "medium"
    };
  };

  const generateMockBusinessAnalysis = (): PerspectiveAnalysis => {
    return {
      title: "Business Perspective Analysis",
      summary: `From a business perspective, "${featureName}" presents opportunities for growth and differentiation in the market.`,
      considerations: [
        "Market demand and competitive analysis",
        "Revenue potential and monetization strategies",
        "Customer acquisition and retention impact",
        "Resource allocation and ROI"
      ],
      recommendations: [
        "Conduct user research to validate market need",
        "Consider tiered pricing models for premium aspects",
        "Develop marketing materials highlighting the new capabilities",
        "Establish KPIs to measure business impact post-launch"
      ],
      impact: "high",
      effort: "low"
    };
  };

  const generateMockUxAnalysis = (): PerspectiveAnalysis => {
    return {
      title: "UX Perspective Analysis",
      summary: `The user experience of "${featureName}" will significantly impact adoption and satisfaction with the overall product.`,
      considerations: [
        "Intuitive user interface and interaction patterns",
        "Learning curve and onboarding requirements",
        "Accessibility compliance and inclusive design",
        "Integration with existing user workflows"
      ],
      recommendations: [
        "Create low-fidelity prototypes to test user flows",
        "Implement progressive disclosure for complex functionality",
        "Ensure WCAG compliance for accessibility",
        "Conduct usability testing with different user personas"
      ],
      impact: "medium",
      effort: "medium"
    };
  };

  const getAnalysisIcon = (perspective: Perspective) => {
    switch (perspective) {
      case "technical":
        return <Code className="h-5 w-5" />;
      case "security":
        return <ShieldCheck className="h-5 w-5" />;
      case "business":
        return <BarChart4 className="h-5 w-5" />;
      case "ux":
        return <Layers className="h-5 w-5" />;
    }
  };

  const getImpactEffortColor = (level: "high" | "medium" | "low", type: "impact" | "effort") => {
    if (type === "impact") {
      switch (level) {
        case "high": return "text-green-600 bg-green-50";
        case "medium": return "text-amber-600 bg-amber-50";
        case "low": return "text-red-600 bg-red-50";
      }
    } else { // effort
      switch (level) {
        case "high": return "text-red-600 bg-red-50";
        case "medium": return "text-amber-600 bg-amber-50";
        case "low": return "text-green-600 bg-green-50";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Layers className="h-6 w-6 text-primary" /> 
            Multi-Perspective Analysis
          </DialogTitle>
          <DialogDescription>
            Analyze this feature from technical, security, business, and UX perspectives.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Feature being analyzed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{featureName}</CardTitle>
              <CardDescription>Feature under analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{featureDescription}</p>
            </CardContent>
          </Card>
          
          {/* Analysis action or results */}
          {Object.values(analysisResults).every(result => result === null) ? (
            <div className="flex justify-center">
              <Button 
                size="lg"
                onClick={generateAnalysis}
                disabled={isAnalyzing}
                className="w-full md:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing from all perspectives...
                  </>
                ) : (
                  <>
                    <Layers className="mr-2 h-4 w-4" />
                    Generate Multi-Perspective Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={activePerspective} onValueChange={(value) => setActivePerspective(value as Perspective)}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="technical" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Technical</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center gap-1">
                  <BarChart4 className="h-4 w-4" />
                  <span className="hidden sm:inline">Business</span>
                </TabsTrigger>
                <TabsTrigger value="ux" className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">UX</span>
                </TabsTrigger>
              </TabsList>
              
              {Object.entries(analysisResults).map(([perspective, analysis]) => {
                if (!analysis) return null;
                
                return (
                  <TabsContent key={perspective} value={perspective} className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getAnalysisIcon(perspective as Perspective)}
                      <h3 className="text-lg font-medium">{analysis.title}</h3>
                    </div>
                    
                    <p className="text-sm">{analysis.summary}</p>
                    
                    <div className="flex flex-col md:flex-row gap-4 mt-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium mb-2">Key Considerations</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {analysis.considerations.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          {analysis.recommendations.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          analysis.impact === 'high' ? 'bg-green-100 text-green-800' :
                          analysis.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analysis.impact.charAt(0).toUpperCase() + analysis.impact.slice(1)} Impact
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          analysis.effort === 'low' ? 'bg-green-100 text-green-800' :
                          analysis.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                          {analysis.effort.charAt(0).toUpperCase() + analysis.effort.slice(1)} Effort
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Add to Feature Notes
                      </Button>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
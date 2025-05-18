import { useState } from "react";
import { Bot, FileText, ArrowRight, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/api";
import { Feature, Project } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ProjectEvaluationProps {
  projectId: number;
  project?: Project;
  features: Feature[];
}

interface EvaluationResult {
  score: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiExplanation: string;
}

export function ProjectEvaluation({ projectId, project, features }: ProjectEvaluationProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const { toast } = useToast();

  // Run the AI evaluation of the project
  const handleEvaluateProject = async () => {
    if (!project || !features || features.length === 0) {
      toast({
        title: "Cannot evaluate project",
        description: "The project needs features to evaluate.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEvaluating(true);
    
    try {
      // Simulating AI evaluation since we don't have the backend endpoint yet
      // This would typically be an API call like this:
      // const result = await apiRequest<EvaluationResult>(`/api/projects/${projectId}/ai/evaluate`, 'POST');
      
      // For now, we'll create a simulated response with delays to mimic AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Sample data - this would come from our API endpoint
      const result: EvaluationResult = {
        score: calculateScore(features),
        rating: getRating(features),
        strengths: generateStrengths(features),
        weaknesses: generateWeaknesses(features),
        recommendations: generateRecommendations(features),
        aiExplanation: "This evaluation is based on feature distribution, completeness, and alignment with project goals."
      };
      
      setEvaluationResult(result);
    } catch (error) {
      toast({
        title: "Evaluation failed",
        description: "Could not complete the project evaluation.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };
  
  // Helper functions for our simulation
  const calculateScore = (features: Feature[]): number => {
    // Simple scoring based on number of features and their distribution
    const baseScore = Math.min(85, features.length * 5);
    const mvpCount = features.filter(f => f.category === 'mvp').length;
    const distribution = mvpCount > 0 ? Math.min(15, (mvpCount / features.length) * 30) : 0;
    return Math.min(100, Math.round(baseScore + distribution));
  };
  
  const getRating = (features: Feature[]): string => {
    const score = calculateScore(features);
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 40) return "Needs Improvement";
    return "Insufficient";
  };
  
  const generateStrengths = (features: Feature[]): string[] => {
    const strengths = [];
    
    if (features.length >= 5) {
      strengths.push("Good number of features documented");
    }
    
    const mvpFeatures = features.filter(f => f.category === 'mvp');
    if (mvpFeatures.length >= 3) {
      strengths.push("Clear MVP priorities established");
    }
    
    const enhancedFeatures = features.filter(f => f.aiEnhanced);
    if (enhancedFeatures.length >= 2) {
      strengths.push("Enhanced feature descriptions provide good detail");
    }
    
    const perspectives = new Set(features.map(f => f.perspective));
    if (perspectives.size >= 3) {
      strengths.push("Multiple perspectives considered in feature planning");
    }
    
    // Always have at least one strength
    if (strengths.length === 0) {
      strengths.push("Project has started capturing features");
    }
    
    return strengths;
  };
  
  const generateWeaknesses = (features: Feature[]): string[] => {
    const weaknesses = [];
    
    if (features.length < 5) {
      weaknesses.push("Limited number of features documented");
    }
    
    const mvpFeatures = features.filter(f => f.category === 'mvp');
    if (mvpFeatures.length < 2) {
      weaknesses.push("MVP scope not clearly defined");
    }
    
    const perspectives = new Set(features.map(f => f.perspective));
    if (perspectives.size < 3) {
      weaknesses.push("Limited perspective diversity in feature planning");
    }
    
    const tagsCount = features.filter(f => f.tags && Array.isArray(f.tags) && f.tags.length > 0).length;
    if (tagsCount < features.length / 2) {
      weaknesses.push("Many features lack proper tagging for categorization");
    }
    
    // If we have no weaknesses, add a general one
    if (weaknesses.length === 0) {
      weaknesses.push("Consider adding more detail to feature descriptions");
    }
    
    return weaknesses;
  };
  
  const generateRecommendations = (features: Feature[]): string[] => {
    const recommendations = [];
    
    const mvpFeatures = features.filter(f => f.category === 'mvp');
    if (mvpFeatures.length < 3) {
      recommendations.push("Add more core features to your MVP category");
    }
    
    const enhancedFeatures = features.filter(f => f.aiEnhanced);
    if (enhancedFeatures.length < features.length / 2) {
      recommendations.push("Use AI enhancement to improve more feature descriptions");
    }
    
    const perspectives = new Set(features.map(f => f.perspective));
    if (!perspectives.has('security')) {
      recommendations.push("Consider adding security-focused features");
    }
    
    if (!perspectives.has('ux')) {
      recommendations.push("Add features focused on user experience");
    }
    
    // Always have recommendations
    if (recommendations.length === 0) {
      recommendations.push("Continue refining feature priorities as the project evolves");
      recommendations.push("Consider branching the project if new directions emerge");
    }
    
    return recommendations;
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-6 w-6 text-blue-500" />
          AI Project Evaluation
        </CardTitle>
        <CardDescription>
          Get an AI-powered evaluation of your project planning and feature prioritization
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isEvaluating ? (
          <div className="space-y-4 p-6">
            <div className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 ml-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : evaluationResult ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">
                  {evaluationResult.rating}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Overall project evaluation
                </p>
              </div>
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {evaluationResult.score}%
                  </span>
                </div>
                <svg className="h-24 w-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-500"
                    strokeWidth="8"
                    strokeDasharray={`${40 * 2 * Math.PI}`}
                    strokeDashoffset={`${40 * 2 * Math.PI * (1 - evaluationResult.score / 100)}`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-1 text-sm">
                  {evaluationResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1 text-sm">
                  {evaluationResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm">
                {evaluationResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="mr-2 h-4 w-4 text-blue-500 mt-0.5" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Bot className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-800 dark:text-blue-200">AI Analysis</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                {evaluationResult.aiExplanation}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="text-center py-6">
            <Bot className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Evaluation Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Generate an AI-powered evaluation of your project to get insights on strengths, weaknesses, and recommendations.
            </p>
            <Button 
              onClick={handleEvaluateProject}
              disabled={!features || features.length === 0}
            >
              <Bot className="mr-2 h-4 w-4" />
              Evaluate Project
            </Button>
          </div>
        )}
      </CardContent>
      
      {evaluationResult && (
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => handleEvaluateProject()}
          >
            <Bot className="mr-2 h-4 w-4" />
            Refresh Evaluation
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
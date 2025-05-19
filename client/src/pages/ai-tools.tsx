import { useState } from "react";
import { WhatIfGenerator } from "@/components/ai-features/what-if-generator";
import { ConceptGenerator } from "@/components/ai-features/concept-generator";
import { MultiPerspectiveAnalysis } from "@/components/ai-features/multi-perspective-analysis";
import { BranchRecommendationDialog } from "@/components/ai-features/branch-recommendation-dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Lightbulb, 
  GitBranchPlus, 
  Layers,
  ChevronsRight,
  Zap
} from "lucide-react";

export default function AITools() {
  const [openWhatIf, setOpenWhatIf] = useState(false);
  const [openConceptGenerator, setOpenConceptGenerator] = useState(false);
  const [openPerspectiveAnalysis, setOpenPerspectiveAnalysis] = useState(false);
  const [openBranchRecommendation, setOpenBranchRecommendation] = useState(false);
  
  // Mock data for demos
  const mockProject = {
    id: 1,
    name: "Feature Priority AI",
    description: "An AI-powered feature prioritization and roadmapping tool"
  };
  
  const mockFeature = {
    id: 1,
    name: "Multi-Perspective Analysis",
    description: "Analyze features from technical, security, business, and UX perspectives"
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          AI Features
        </h1>
        <p className="text-muted-foreground mb-8">
          Powerful AI-powered tools to enhance your project planning and feature prioritization
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concept Generator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold">Concept Generator</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Generate complete concept ideas from just a name, or generate perfect titles based on descriptions.
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>When to use:</strong> During early ideation phases, when you need creative inspiration.
              </div>
              <div className="text-sm">
                <strong>Capabilities:</strong> Create detailed concepts with key features, target audience, and unique value propositions.
              </div>
            </div>
            
            <Button 
              onClick={() => setOpenConceptGenerator(true)} 
              className="mt-6 w-full gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Open Concept Generator
            </Button>
          </div>
        </div>

        {/* What-If Generator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">What-If Generator</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore alternative paths for your project by applying creative constraints and transformations.
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>When to use:</strong> When you want to explore new directions or overcome creative blocks.
              </div>
              <div className="text-sm">
                <strong>Capabilities:</strong> Switch categories, combine features, introduce constraints, and create custom scenarios.
              </div>
            </div>
            
            <Button 
              onClick={() => setOpenWhatIf(true)} 
              className="mt-6 w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Open What-If Generator
            </Button>
          </div>
        </div>

        {/* Multi-Perspective Analysis Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" />
              <h2 className="text-xl font-bold">Multi-Perspective Analysis</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Analyze features from technical, security, business, and UX perspectives for comprehensive insights.
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>When to use:</strong> Before committing to feature implementation to understand all impacts.
              </div>
              <div className="text-sm">
                <strong>Capabilities:</strong> Get detailed considerations, recommendations, and impact/effort assessments.
              </div>
            </div>
            
            <Button 
              onClick={() => setOpenPerspectiveAnalysis(true)} 
              className="mt-6 w-full gap-2"
            >
              <Layers className="h-4 w-4" />
              Open Multi-Perspective Analysis
            </Button>
          </div>
        </div>

        {/* Branch Recommendation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <GitBranchPlus className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-bold">Project Branching</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Get AI recommendations on when to branch your project to explore new directions without losing focus.
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>When to use:</strong> When feature scope is expanding beyond the original project vision.
              </div>
              <div className="text-sm">
                <strong>Capabilities:</strong> Detect feature drift, provide branching rationale, and suggest project organization.
              </div>
            </div>
            
            <Button 
              onClick={() => setOpenBranchRecommendation(true)} 
              className="mt-6 w-full gap-2"
            >
              <GitBranchPlus className="h-4 w-4" />
              Open Branch Recommendation
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ChevronsRight className="h-5 w-5 text-primary" />
          Coming Soon
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 dark:bg-gray-850 rounded-lg p-4 opacity-70">
            <h3 className="font-medium">Feature Combo Generator</h3>
            <p className="text-sm text-muted-foreground">Combine existing features into innovative new concepts.</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-850 rounded-lg p-4 opacity-70">
            <h3 className="font-medium">AI Project Templates</h3>
            <p className="text-sm text-muted-foreground">Start with intelligent templates for common project types.</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-850 rounded-lg p-4 opacity-70">
            <h3 className="font-medium">Feature Drift Detection</h3>
            <p className="text-sm text-muted-foreground">Automatically identify when features are moving in different directions.</p>
          </div>
        </div>
      </div>

      {/* AI Feature Dialogs */}
      <WhatIfGenerator
        open={openWhatIf}
        onOpenChange={setOpenWhatIf}
        projectId={mockProject.id}
        projectData={{
          name: mockProject.name,
          description: mockProject.description
        }}
        features={[mockFeature]}
      />
      
      <ConceptGenerator
        open={openConceptGenerator}
        onOpenChange={setOpenConceptGenerator}
      />
      
      <MultiPerspectiveAnalysis
        open={openPerspectiveAnalysis}
        onOpenChange={setOpenPerspectiveAnalysis}
        projectId={mockProject.id}
        featureId={mockFeature.id}
        featureName={mockFeature.name}
        featureDescription={mockFeature.description}
      />
      
      <BranchRecommendationDialog
        open={openBranchRecommendation}
        onOpenChange={setOpenBranchRecommendation}
        parentProjectId={mockProject.id}
        branchRecommendation={{
          shouldBranch: true,
          reason: "Recent feature additions suggest this project is evolving in two distinct directions. Creating a branch would help maintain clearer focus on each path.",
          suggestedName: "Feature Priority AI - Extended"
        }}
      />
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Lightbulb,
  GitBranchPlus,
  Layers,
  ChevronDown
} from "lucide-react";
import { WhatIfGenerator } from "./ai-features/what-if-generator";
import { ConceptGenerator } from "./ai-features/concept-generator";
import { MultiPerspectiveAnalysis } from "./ai-features/multi-perspective-analysis";
import { BranchRecommendationDialog } from "./ai-features/branch-recommendation-dialog";

interface AIFeaturesMenuProps {
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
  selectedFeature?: {
    id: number;
    name: string;
    description: string;
  };
}

export function AIFeaturesMenu({ 
  projectId, 
  projectData, 
  features = [],
  selectedFeature 
}: AIFeaturesMenuProps) {
  const [openWhatIf, setOpenWhatIf] = useState(false);
  const [openConceptGenerator, setOpenConceptGenerator] = useState(false);
  const [openPerspectiveAnalysis, setOpenPerspectiveAnalysis] = useState(false);
  const [openBranchRecommendation, setOpenBranchRecommendation] = useState(false);

  // Mock branch recommendation for demonstration
  const mockBranchRecommendation = {
    shouldBranch: true,
    reason: "Recent feature additions suggest this project is evolving in two distinct directions. Creating a branch would help maintain clearer focus on each path.",
    suggestedName: projectData?.name ? `${projectData.name}-Extended` : "New Branch"
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Features
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenWhatIf(true)} className="gap-2 cursor-pointer">
            <Sparkles className="h-4 w-4" />
            What-If Generator
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setOpenConceptGenerator(true)} className="gap-2 cursor-pointer">
            <Lightbulb className="h-4 w-4" />
            Concept Generator
          </DropdownMenuItem>
          
          {selectedFeature && (
            <DropdownMenuItem onClick={() => setOpenPerspectiveAnalysis(true)} className="gap-2 cursor-pointer">
              <Layers className="h-4 w-4" />
              Multi-Perspective Analysis
            </DropdownMenuItem>
          )}
          
          {projectId && (
            <DropdownMenuItem onClick={() => setOpenBranchRecommendation(true)} className="gap-2 cursor-pointer">
              <GitBranchPlus className="h-4 w-4" />
              Analyze for Branching
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AI Feature Dialogs */}
      <WhatIfGenerator
        open={openWhatIf}
        onOpenChange={setOpenWhatIf}
        projectId={projectId}
        projectData={projectData}
        features={features}
      />
      
      <ConceptGenerator
        open={openConceptGenerator}
        onOpenChange={setOpenConceptGenerator}
      />
      
      {selectedFeature && (
        <MultiPerspectiveAnalysis
          open={openPerspectiveAnalysis}
          onOpenChange={setOpenPerspectiveAnalysis}
          projectId={projectId || 0}
          featureId={selectedFeature.id}
          featureName={selectedFeature.name}
          featureDescription={selectedFeature.description}
        />
      )}
      
      {projectId && (
        <BranchRecommendationDialog
          open={openBranchRecommendation}
          onOpenChange={setOpenBranchRecommendation}
          parentProjectId={projectId}
          branchRecommendation={mockBranchRecommendation}
        />
      )}
    </>
  );
}
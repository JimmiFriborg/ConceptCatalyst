import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BranchRecommendationDialog } from "./branch-recommendation-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

interface BranchAnalyzerProps {
  projectId: number;
  features: any[];
}

export function BranchAnalyzer({ projectId, features }: BranchAnalyzerProps) {
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [analyzeInProgress, setAnalyzeInProgress] = useState(false);
  const [branchRecommendation, setBranchRecommendation] = useState<{
    shouldBranch: boolean;
    reason: string;
    suggestedName?: string;
  } | null>(null);
  
  const queryClient = useQueryClient();
  
  // Analyze features for potential project branching
  const analyzeBranchingMutation = useMutation({
    mutationFn: async () => {
      setAnalyzeInProgress(true);
      try {
        const response = await apiRequest(`/api/projects/${projectId}/ai/analyze-branching`, {
          method: 'POST',
        });
        return response;
      } finally {
        setAnalyzeInProgress(false);
      }
    },
    onSuccess: (data) => {
      setBranchRecommendation(data);
      if (data.shouldBranch) {
        setShowBranchDialog(true);
      }
    },
  });
  
  // Get features that might be causing drift
  const getDriftingFeatures = () => {
    if (!features || features.length === 0) return [];
    
    // For now, a simple implementation - consider features that:
    // 1. Were recently added (last 3)
    // 2. Have a different perspective from the majority
    const perspectives = features.map(f => f.perspective);
    const counts: Record<string, number> = {};
    
    perspectives.forEach(p => {
      if (!counts[p]) counts[p] = 0;
      counts[p]++;
    });
    
    const majorityPerspective = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)[0];
    
    // Find features with different perspectives
    const driftFeatures = features
      .filter(f => f.perspective !== majorityPerspective)
      .slice(0, 3);
    
    return driftFeatures;
  };
  
  const driftingFeatures = getDriftingFeatures();
  const hasPotentialDrift = driftingFeatures.length > 0;
  
  // Check if we have enough features to analyze
  const hasEnoughFeatures = features.length >= 5;
  
  const handleAnalyzeClick = () => {
    analyzeBranchingMutation.mutate();
  };
  
  return (
    <>
      <Card className="shadow-md border-slate-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <AlertTriangle size={20} />
            AI Branch Analysis
          </CardTitle>
          <CardDescription>
            Analyzes your features for potential project drift that might benefit from branching
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!hasEnoughFeatures ? (
            <div className="text-slate-600 text-sm">
              <p>Add more features before analyzing for potential branching.</p>
              <p className="mt-2 font-medium">At least 5 features are recommended for accurate analysis.</p>
            </div>
          ) : hasPotentialDrift ? (
            <div className="space-y-3">
              <div className="text-amber-600 font-medium flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Potential scope drift detected</span>
              </div>
              <p className="text-sm text-slate-600">
                Recent features appear to be taking a different direction:
              </p>
              <div className="space-y-2 pt-1">
                {driftingFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                      {feature.perspective}
                    </Badge>
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-green-600 text-sm">
              <p>No project drift detected in current features.</p>
              <p className="mt-2">Features appear to be aligned with the project scope.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button
            onClick={handleAnalyzeClick}
            disabled={!hasEnoughFeatures || analyzeInProgress}
            variant={hasPotentialDrift ? "default" : "outline"}
            className={hasPotentialDrift ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          >
            {analyzeInProgress ? "Analyzing..." : "Analyze for Branching"}
          </Button>
        </CardFooter>
      </Card>
      
      {branchRecommendation && (
        <BranchRecommendationDialog
          open={showBranchDialog}
          onOpenChange={setShowBranchDialog}
          parentProjectId={projectId}
          branchRecommendation={branchRecommendation}
        />
      )}
    </>
  );
}
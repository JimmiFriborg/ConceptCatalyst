import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeBranching } from "@/lib/api";
import { BranchRecommendationDialog } from "./branch-recommendation-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GitBranch, AlertCircle, X } from "lucide-react";

interface DriftDetectionAlertProps {
  projectId: number;
  features: any[];
}

export function DriftDetectionAlert({ projectId, features }: DriftDetectionAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastCheckedCount, setLastCheckedCount] = useState(0);
  const [isCheckingDrift, setIsCheckingDrift] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    shouldBranch: boolean;
    reason: string;
    suggestedName?: string;
  } | null>(null);

  // Don't check for drift too frequently - only when feature count increases by 3 or more
  useEffect(() => {
    if (!features || features.length < 3 || isDismissed || isCheckingDrift) return;

    // Only check for drift when:
    // 1. We haven't checked before (lastCheckedCount === 0) and we have enough features
    // 2. Feature count has increased by at least 3 since last check
    if (
      (lastCheckedCount === 0 && features.length >= 5) || 
      (features.length - lastCheckedCount >= 3)
    ) {
      checkForDrift();
    }
  }, [features, lastCheckedCount, isDismissed, isCheckingDrift]);

  const checkForDrift = async () => {
    if (!features || features.length < 3) return;
    
    try {
      setIsCheckingDrift(true);
      
      // Get the last 3 added features to check if they're drifting from the project scope
      const recentFeatureIds = [...features]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map(f => f.id);
      
      // Call API to analyze if these features suggest branching
      const result = await analyzeBranching(projectId, recentFeatureIds);
      setRecommendation(result);
      setLastCheckedCount(features.length);
      
      // If not recommended to branch, dismiss the alert to avoid showing it again
      if (!result.shouldBranch) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error("Error checking for drift:", error);
    } finally {
      setIsCheckingDrift(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isDismissed || !recommendation || !recommendation.shouldBranch) {
    return null;
  }

  return (
    <>
      <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="ml-3 flex-1">
            <AlertTitle className="text-amber-800 dark:text-amber-200 font-medium">
              Potential Scope Drift Detected
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300 mt-1 mb-3">
              {recommendation.reason}
            </AlertDescription>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                onClick={() => setIsDialogOpen(true)}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Create Branch Project
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                onClick={handleDismiss}
              >
                <X className="mr-1 h-4 w-4" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </Alert>

      <BranchRecommendationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        parentProjectId={projectId}
        branchRecommendation={recommendation}
      />
    </>
  );
}
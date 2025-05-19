import { Feature, Project } from "@shared/schema";
import { BranchProjectsSection } from "@/components/branch-projects-section";
import { DriftDetectionAlert } from "@/components/drift-detection-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, GitFork } from "lucide-react";

interface BranchesTabProps {
  project?: Project;
  features: Feature[];
  projectId: number;
  isLoading?: boolean;
}

export function BranchesTab({ 
  project, 
  features, 
  projectId,
  isLoading = false 
}: BranchesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <GitFork className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Project Branches</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="mr-2 h-4 w-4" />
            Branch Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DriftDetectionAlert projectId={projectId} features={features} />
        </CardContent>
      </Card>

      <BranchProjectsSection projectId={projectId} />
    </div>
  );
}
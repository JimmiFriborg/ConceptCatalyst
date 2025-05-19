import { Feature, Project } from "@shared/schema";
import { ProjectEvaluation } from "@/components/project-evaluation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, BarChart2 } from "lucide-react";
import { useState } from "react";
import { PriorityVisualization } from "@/components/priority-visualization";

interface EvaluationTabProps {
  project?: Project;
  features: Feature[];
  projectId: number;
  isLoading?: boolean;
}

export function EvaluationTab({ 
  project, 
  features, 
  projectId,
  isLoading = false 
}: EvaluationTabProps) {
  const [showVisualization, setShowVisualization] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart2 className="mr-2 h-5 w-5" />
          Project Evaluation
        </h2>
        <Button 
          variant="outline" 
          onClick={() => setShowVisualization(!showVisualization)}
        >
          {showVisualization ? "Hide Visualization" : "Show Visualization"}
        </Button>
      </div>

      {showVisualization && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityVisualization features={features} />
          </CardContent>
        </Card>
      )}

      <ProjectEvaluation 
        projectId={projectId} 
        project={project} 
        features={features} 
      />
    </div>
  );
}
import { Project, Feature } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Clock, GitBranch, CheckCircle, List } from "lucide-react";

interface OverviewTabProps {
  project?: Project;
  features: Feature[];
}

export function OverviewTab({ project, features }: OverviewTabProps) {
  if (!project) return <div>Project not found</div>;

  // Calculate some basic metrics
  const totalFeatures = features.length;
  const categorizedFeatures = features.filter(f => f.category !== "rejected").length;
  const mvpFeatures = features.filter(f => f.category === "mvp").length;
  const completionRate = totalFeatures > 0 ? (categorizedFeatures / totalFeatures) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {project.description || "No description provided"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
              </Badge>
              {project.parentId && (
                <Badge variant="outline">
                  <GitBranch className="mr-1 h-3 w-3" />
                  Branched
                </Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <List className="mr-2 h-5 w-5 text-blue-500" />
                  {totalFeatures}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  {completionRate.toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {project.mission && (
        <Card>
          <CardHeader>
            <CardTitle>Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.mission}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.goals && project.goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {(project.goals as string[]).map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {project.inScope && project.inScope.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>In Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {(project.inScope as string[]).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {project.outOfScope && project.outOfScope.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Out of Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {(project.outOfScope as string[]).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
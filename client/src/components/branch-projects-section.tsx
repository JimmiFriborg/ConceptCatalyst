import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Mock function to replace API dependency
const getChildProjects = async (projectId: number) => {
  console.log("Getting child projects for:", projectId);
  return [];
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranch, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BranchProjectsSectionProps {
  projectId: number;
}

export function BranchProjectsSection({ projectId }: BranchProjectsSectionProps) {
  const [_, navigate] = useLocation();
  
  const { data: branches, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/branches`],
    queryFn: () => getChildProjects(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Branch Projects
        </h3>
        <div className="mt-2">Loading branch projects...</div>
      </div>
    );
  }

  if (!branches || branches.length === 0) {
    return null; // Don't show anything if there are no branches
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Branch Projects
        </h3>
      </div>
      <Separator className="my-3" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {branches && branches.map((branch: any) => (
          <Card key={branch.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{branch.name}</CardTitle>
              <CardDescription className="text-xs truncate">
                {branch.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-1"
                onClick={() => navigate(`/projects/${branch.id}`)}
              >
                View Branch <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
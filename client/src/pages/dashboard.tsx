import { useLocation } from "wouter";
import { useProjects } from "@/context/project-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedCreateMenu } from "@/components/unified-create-menu";
import { FolderOpen, Folder, Clock, ArrowRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { deleteProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const { data: projects, isLoading, isError } = useProjects();
  const { toast } = useToast();
  
  // Determine if we're showing concepts or projects based on the URL
  const isConceptsView = location === "/concepts";
  const isProjectsView = location === "/projects";
  const viewType = isConceptsView ? "concept" : isProjectsView ? "project" : "all";
  
  // Filter projects based on the current view
  const filteredProjects = projects?.filter(project => {
    if (viewType === "all") return true;
    if (viewType === "concept") {
      // For concepts view, include projects with isConcept field set to truthy values
      if (project.isConcept === null) return false;
      if (typeof project.isConcept === 'number') return project.isConcept === 1;
      if (typeof project.isConcept === 'boolean') return project.isConcept === true;
      if (typeof project.isConcept === 'string') return project.isConcept === 'true';
      return false;
    } else {
      // For projects view, exclude those with isConcept field
      if (project.isConcept === null || project.isConcept === undefined) return true;
      if (typeof project.isConcept === 'number') return project.isConcept === 0;
      if (typeof project.isConcept === 'boolean') return project.isConcept === false;
      if (typeof project.isConcept === 'string') return project.isConcept === 'false';
      return true;
    }
  });

  const handleOpenProject = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProject(id);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Removed duplicate Add button */}

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Projects</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="p-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">
                Error loading projects. Please try again later.
              </p>
            </Card>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <CardDescription>
                      {project.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button 
                      onClick={() => handleOpenProject(project.id)}
                      size="sm"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Folder className="h-16 w-16 text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No projects yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Create your first project to start prioritizing features and planning your product roadmap.
                  </p>
                </div>
                <Button onClick={() => navigate("/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About FeaturePriority AI</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                FeaturePriority AI is an intelligent tool for product planning and feature prioritization.
                It helps product teams decide what to build next by categorizing features into development phases.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Create and manage multiple product projects</li>
                <li>Get AI-powered feature suggestions and enhancements</li>
                <li>Categorize features using a simple drag-and-drop interface</li>
                <li>Analyze features from different perspectives: Technical, Business, UI/UX, and Security</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Getting Started</h3>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-3">
                <li>
                  <span className="font-medium">Create a project</span> - Start by creating a new project for your product
                </li>
                <li>
                  <span className="font-medium">Add features</span> - Input features with descriptions or get AI suggestions
                </li>
                <li>
                  <span className="font-medium">Prioritize</span> - Drag and drop features into different development phases
                </li>
                <li>
                  <span className="font-medium">Analyze</span> - Get insights from different perspectives on your feature set
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}

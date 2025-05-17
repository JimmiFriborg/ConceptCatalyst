import { useState } from "react";
import { useLocation } from "wouter";
import { useProjects, useProject } from "@/context/project-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, PlusCircle, User } from "lucide-react";
import { AddProjectDialog } from "@/components/add-project-dialog";

export function ProjectSidebar() {
  const [location, setLocation] = useLocation();
  const { data: projects, isLoading } = useProjects();
  const { currentProjectId } = useProject();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const handleProjectClick = (id: number) => {
    setLocation(`/projects/${id}`);
  };

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          <span className="text-primary">Feature</span>Priority AI
        </h1>
      </div>
      
      {/* Projects Navigation */}
      <div className="flex-1 pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Your Projects
          </h2>
          <Button 
            variant="ghost" 
            className="mt-2 flex items-center text-sm text-primary dark:text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-700 w-full justify-start px-2"
            onClick={() => setIsAddProjectOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> 
            New Project
          </Button>
        </div>
        
        <nav className="px-2 space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </>
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <Button
                key={project.id}
                variant={project.id === currentProjectId ? "default" : "ghost"}
                className={`w-full justify-start ${
                  project.id === currentProjectId
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => handleProjectClick(project.id)}
              >
                <Folder className="mr-3 h-5 w-5" />
                <span className="flex-1 truncate">{project.name}</span>
                <Badge 
                  variant={project.id === currentProjectId ? "secondary" : "outline"}
                  className="ml-auto"
                >
                  0
                </Badge>
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              No projects found
            </div>
          )}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-1">
              <User className="h-7 w-7 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                Product Manager
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                Manage account
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddProjectDialog 
        open={isAddProjectOpen} 
        onOpenChange={setIsAddProjectOpen} 
      />
    </div>
  );
}

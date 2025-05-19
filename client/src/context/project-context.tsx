import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProjectContextProps {
  children: ReactNode;
}

interface ProjectContextType {
  data: any[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: ProjectContextProps) {
  const fetchProjects = async () => {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    return response.json();
  };

  const { 
    data = [], 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: fetchProjects,
  });

  return (
    <ProjectContext.Provider value={{ data, isLoading, isError, refetch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}

// Single project fetching hook
export function useProject(id: number) {
  const fetchProject = async () => {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["/api/projects", id],
    queryFn: fetchProject,
  });
}

// Project features fetching hook
export function useProjectFeatures(projectId: number) {
  const fetchFeatures = async () => {
    const response = await fetch(`/api/projects/${projectId}/features`);
    if (!response.ok) {
      throw new Error("Failed to fetch project features");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["/api/projects", projectId, "features"],
    queryFn: fetchFeatures,
    enabled: !!projectId,
  });
}

// AI suggestions fetching hook
export function useProjectSuggestions(projectId: number) {
  const fetchSuggestions = async () => {
    const response = await fetch(`/api/projects/${projectId}/ai/suggestions`);
    if (!response.ok) {
      throw new Error("Failed to fetch AI suggestions");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["/api/projects", projectId, "suggestions"],
    queryFn: fetchSuggestions,
    enabled: !!projectId,
  });
}
import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Feature, type AiSuggestion, type Project } from "@shared/schema";

interface ProjectContextType {
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;
  currentFeatureIndex: number;
  setCurrentFeatureIndex: (index: number) => void;
  features: Feature[];
  setFeatures: (features: Feature[]) => void;
  aiSuggestions: AiSuggestion[];
  setAiSuggestions: (suggestions: AiSuggestion[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState<number>(0);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);

  const value = {
    currentProjectId,
    setCurrentProjectId,
    currentFeatureIndex,
    setCurrentFeatureIndex,
    features,
    setFeatures,
    aiSuggestions,
    setAiSuggestions,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
}

export function useProjectDetails(projectId: number | null) {
  return useQuery<Project>({
    queryKey: projectId ? [`/api/projects/${projectId}`] : null,
    enabled: !!projectId,
  });
}

export function useProjectFeatures(projectId: number | null) {
  return useQuery<Feature[]>({
    queryKey: projectId ? [`/api/projects/${projectId}/features`] : null,
    enabled: !!projectId,
  });
}

export function useProjectSuggestions(projectId: number | null) {
  return useQuery<AiSuggestion[]>({
    queryKey: projectId ? [`/api/projects/${projectId}/ai/suggestions`] : null,
    enabled: !!projectId,
  });
}

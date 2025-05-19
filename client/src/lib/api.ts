import { queryClient } from "./queryClient";

// AI API functions
export async function enhanceFeatureDescription(data: { name: string; description: string }) {
  const response = await fetch("/api/ai/enhance-description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to enhance feature description");
  }

  return await response.json();
}

export async function generateTags(data: { featureName: string; featureDescription: string; projectContext: string }) {
  const response = await fetch("/api/ai/generate-tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to generate tags");
  }

  return await response.json();
}

export async function analyzeFeature(data: { name: string; description: string }) {
  const response = await fetch("/api/ai/analyze-feature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze feature");
  }

  return await response.json();
}

// Project API functions
export async function createProject(data: any) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  // Invalidate the projects query cache
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  
  return await response.json();
}

export async function createConcept(data: any) {
  // Add a custom header for concepts
  const conceptData = {
    ...data,
    isConcept: 1, // Use integer for concept flag
    projectCategory: data.projectCategory || "other",
  };
  
  return createProject(conceptData);
}

export async function deleteProject(id: number) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete project");
  }

  // Invalidate the projects query cache
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  
  return true;
}

// Feature API functions
export async function createFeature(projectId: number, data: any) {
  const response = await fetch(`/api/projects/${projectId}/features`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create feature");
  }

  // Invalidate the features query cache for this project
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/features`] });
  
  return await response.json();
}

export async function updateFeature(featureId: number, data: any) {
  const response = await fetch(`/api/features/${featureId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update feature");
  }

  return await response.json();
}

export async function deleteFeature(featureId: number) {
  const response = await fetch(`/api/features/${featureId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete feature");
  }

  return true;
}

export async function updateFeatureCategory(featureId: number, category: string) {
  const response = await fetch(`/api/features/${featureId}/category`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category }),
  });

  if (!response.ok) {
    throw new Error("Failed to update feature category");
  }

  return await response.json();
}

export async function analyzeBranching(projectId: number, newFeatureIds: number[]) {
  const response = await fetch(`/api/projects/${projectId}/ai/analyze-branching`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newFeatureIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze for branching");
  }

  return await response.json();
}

export async function generateProjectFeatureSuggestionsFromInfo(projectId: number, projectInfo: {
  mission?: string;
  goals?: string[];
  inScope?: string[];
  outOfScope?: string[];
}) {
  const response = await fetch(`/api/projects/${projectId}/ai/suggest-features-from-info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectInfo),
  });

  if (!response.ok) {
    throw new Error("Failed to generate feature suggestions from project info");
  }

  return await response.json();
}
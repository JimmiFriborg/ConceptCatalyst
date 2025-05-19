import { queryClient } from "./queryClient";

// Project API functions
export async function createProject(projectData: any) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  
  // Invalidate projects cache
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  
  return response.json();
}
export async function deleteProject(id: number) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
  
  // Invalidate projects cache
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  
  return response.json();
}

export async function updateProject(id: number, projectData: any) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  
  // Invalidate projects cache
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
  
  return response.json();
}

// Feature API functions
export async function createFeature(projectId: number, featureData: any) {
  const response = await fetch(`/api/projects/${projectId}/features`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(featureData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create feature");
  }
  
  // Invalidate features cache for this project
  queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "features"] });
  
  return response.json();
}

export async function deleteFeature(id: number) {
  const response = await fetch(`/api/features/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete feature");
  }
  
  // Since we don't know which project this feature belongs to,
  // we can't invalidate the specific project's features cache
  
  return response.json();
}

export async function updateFeature(id: number, featureData: any) {
  const response = await fetch(`/api/features/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(featureData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update feature");
  }
  
  // Since we don't know which project this feature belongs to,
  // we can't invalidate the specific project's features cache
  
  return response.json();
}

export async function updateFeatureCategory(id: number, category: string) {
  const response = await fetch(`/api/features/${id}/category`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update feature category");
  }
  
  // Since we don't know which project this feature belongs to,
  // we can't invalidate the specific project's features cache
  
  return response.json();
}

// AI API functions
export async function analyzeFeature(featureId: number, description: string) {
  const response = await fetch(`/api/ai/analyze-feature`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ featureId, description }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to analyze feature");
  }
  
  return response.json();
}

export async function enhanceFeatureDescription(featureId: number, description: string) {
  const response = await fetch(`/api/ai/enhance-description`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ featureId, description }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to enhance feature description");
  }
  
  return response.json();
}

export async function generateTags(text: string) {
  const response = await fetch(`/api/ai/generate-tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to generate tags");
  }
  
  return response.json();
}

export async function generateFeaturesFromProjectInfo(projectId: number, projectInfo: any) {
  const response = await fetch(`/api/projects/${projectId}/ai/suggest-features-from-info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectInfo),
  });
  
  if (!response.ok) {
    throw new Error("Failed to generate features from project info");
  }
  
  return response.json();
}

export async function generateFeatureSuggestions(projectId: number, perspective: string) {
  const response = await fetch(`/api/projects/${projectId}/ai/suggest-features`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ perspective }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to generate feature suggestions");
  }
  
  return response.json();
}

export async function acceptSuggestion(id: number) {
  const response = await fetch(`/api/ai/suggestions/${id}/accept`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Failed to accept suggestion");
  }
  
  return response.json();
}

export async function rejectSuggestion(id: number) {
  const response = await fetch(`/api/ai/suggestions/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to reject suggestion");
  }
  
  return response.json();
}

export async function analyzeBranching(projectId: number) {
  return analyzeBranchingPotential(projectId);
}

export async function analyzeBranchingPotential(projectId: number) {
  const response = await fetch(`/api/projects/${projectId}/ai/analyze-branching`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Failed to analyze branching potential");
  }
  
  return response.json();
}

export async function branchProject(parentId: number, projectData: any) {
  const response = await fetch(`/api/projects/${parentId}/branch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to branch project");
  }
  
  // Invalidate projects cache
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${parentId}/branches`] });
  
  return response.json();
}
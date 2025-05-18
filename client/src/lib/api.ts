import { apiRequest } from "./queryClient";
import { type Category, type Perspective } from "@shared/schema";

// Project API
export async function createProject(data: { 
  name: string, 
  description?: string,
  mission?: string,
  goals?: string[],
  inScope?: string[],
  outOfScope?: string[],
  constraints?: string[]
}) {
  const res = await apiRequest("POST", "/api/projects", data);
  return res.json();
}

export async function updateProject(id: number, data: { name?: string, description?: string }) {
  const res = await apiRequest("PUT", `/api/projects/${id}`, data);
  return res.json();
}

export async function deleteProject(id: number) {
  await apiRequest("DELETE", `/api/projects/${id}`);
}

// Feature API
export async function createFeature(projectId: number, data: {
  name: string;
  description: string;
  perspective: Perspective;
  category: Category;
  aiEnhanced?: any;
}) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/features`, data);
  return res.json();
}

export async function updateFeature(id: number, data: {
  name?: string;
  description?: string;
  perspective?: Perspective;
  category?: Category;
  aiEnhanced?: any;
  tags?: string[];
}) {
  const res = await apiRequest("PUT", `/api/features/${id}`, data);
  return res.json();
}

export async function updateFeatureCategory(id: number, category: Category) {
  const res = await apiRequest("PUT", `/api/features/${id}/category`, { category });
  return res.json();
}

export async function deleteFeature(id: number) {
  await apiRequest("DELETE", `/api/features/${id}`);
}

// AI API
export async function analyzeFeature(data: {
  name: string;
  description: string;
  projectContext?: string;
}) {
  const res = await apiRequest("POST", "/api/ai/analyze-feature", data);
  return res.json();
}

export async function enhanceFeatureDescription(data: {
  name: string;
  description: string;
}) {
  const res = await apiRequest("POST", "/api/ai/enhance-description", data);
  return res.json();
}

export async function generateTags(data: {
  featureName: string;
  featureDescription: string;
  projectContext?: string;
}) {
  const res = await apiRequest("POST", "/api/ai/generate-tags", data);
  return res.json();
}

export async function generateFeatureSuggestions(projectId: number, perspective: Perspective) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/ai/suggest-features`, { perspective });
  return res.json();
}

export async function generateFeaturesFromProjectInfo(
  projectId: number, 
  data: {
    mission?: string;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
  }
) {
  const res = await apiRequest(
    "POST", 
    `/api/projects/${projectId}/ai/suggest-features-from-info`, 
    data
  );
  return res.json();
}

export async function acceptSuggestion(id: number) {
  const res = await apiRequest("POST", `/api/ai/suggestions/${id}/accept`, {});
  return res.json();
}

export async function deleteSuggestion(id: number) {
  await apiRequest("DELETE", `/api/ai/suggestions/${id}`);
}

// Branching API
export async function analyzeBranching(projectId: number, newFeatureIds: number[]) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/ai/analyze-branching`, { newFeatureIds });
  return res.json();
}

export async function branchProject(parentId: number, data: { name: string, description?: string }) {
  const res = await apiRequest("POST", `/api/projects/${parentId}/branch`, data);
  return res.json();
}

export async function getChildProjects(parentId: number) {
  const res = await apiRequest("GET", `/api/projects/${parentId}/branches`);
  return res.json();
}

// API client functions
import { queryClient } from "./queryClient";
import { Feature, Project, Category, Perspective } from "@shared/schema";

// Shared fetch helper for API requests
export async function apiRequest<T>(
  url: string, 
  method: string = 'GET',
  body?: any
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  const options: RequestInit = {
    method,
    headers
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }
  
  return response.json();
}

// Project API endpoints
export async function getProjects(): Promise<Project[]> {
  return apiRequest<Project[]>('/api/projects');
}

export async function getProject(id: number): Promise<Project> {
  return apiRequest<Project>(`/api/projects/${id}`);
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const result = await apiRequest<Project>('/api/projects', 'POST', project);
  queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
  return result;
}

export async function updateProject(id: number, project: Partial<Project>): Promise<Project> {
  const result = await apiRequest<Project>(`/api/projects/${id}`, 'PUT', project);
  queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
  return result;
}

export async function deleteProject(id: number): Promise<void> {
  await apiRequest<void>(`/api/projects/${id}`, 'DELETE');
  queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
}

// Feature API endpoints
export async function getFeatures(projectId: number): Promise<Feature[]> {
  return apiRequest<Feature[]>(`/api/projects/${projectId}/features`);
}

export async function getFeature(id: number): Promise<Feature> {
  return apiRequest<Feature>(`/api/features/${id}`);
}

export async function createFeature(projectId: number, feature: Partial<Feature>): Promise<Feature> {
  const result = await apiRequest<Feature>(`/api/projects/${projectId}/features`, 'POST', feature);
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/features`] });
  return result;
}

export async function updateFeature(id: number, feature: Partial<Feature>): Promise<Feature> {
  const result = await apiRequest<Feature>(`/api/features/${id}`, 'PUT', feature);
  
  // Get the project ID from the feature
  const featureData = await getFeature(id);
  
  // Invalidate the features query for the project
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${featureData.projectId}/features`] });
  
  return result;
}

export async function updateFeatureCategory(id: number, category: Category): Promise<Feature> {
  const result = await apiRequest<Feature>(`/api/features/${id}/category`, 'PUT', { category });
  
  // Get the project ID from the feature
  const featureData = await getFeature(id);
  
  // Invalidate the features query for the project
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${featureData.projectId}/features`] });
  
  return result;
}

export async function deleteFeature(id: number): Promise<void> {
  const feature = await getFeature(id);
  await apiRequest<void>(`/api/features/${id}`, 'DELETE');
  queryClient.invalidateQueries({ queryKey: [`/api/projects/${feature.projectId}/features`] });
}

// AI Suggestion endpoints
export async function acceptSuggestion(id: number): Promise<void> {
  // Get the suggestion first to know which project to invalidate
  const result = await apiRequest<{projectId: number}>(`/api/ai/suggestions/${id}/accept`, 'POST');
  const projectId = result.projectId;
  
  // Invalidate both project features and suggestions
  queryClient.invalidateQueries({ 
    queryKey: [
      `/api/projects/${projectId}/features`,
      `/api/projects/${projectId}/ai/suggestions`
    ] 
  });
}

export async function deleteSuggestion(id: number): Promise<void> {
  await apiRequest<void>(`/api/ai/suggestions/${id}`, 'DELETE');
  queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
}

// AI Analysis endpoints
export async function analyzeFeature(data: { 
  name: string; 
  description: string;
}): Promise<{
  suggestedCategory: Category;
  rationale: string;
}> {
  return apiRequest<{ suggestedCategory: Category; rationale: string }>(
    '/api/ai/analyze-feature', 
    'POST', 
    data
  );
}

export async function enhanceFeatureDescription(data: { 
  name: string; 
  description: string;
}): Promise<{
  enhancedDescription: string;
}> {
  return apiRequest<{ enhancedDescription: string }>(
    '/api/ai/enhance-description', 
    'POST', 
    data
  );
}

export async function generateTags(data: { 
  featureName: string; 
  featureDescription: string;
  projectContext: string;
}): Promise<{
  tags: string[];
  rationale: string;
}> {
  return apiRequest<{ tags: string[]; rationale: string }>(
    '/api/ai/generate-tags', 
    'POST', 
    data
  );
}

export async function analyzeBranching(projectId: number, features: Feature[]): Promise<{
  shouldBranch: boolean;
  reason: string;
  suggestedName?: string;
}> {
  return apiRequest<{ shouldBranch: boolean; reason: string; suggestedName?: string }>(
    `/api/projects/${projectId}/ai/analyze-branching`, 
    'POST', 
    { features }
  );
}

export async function generateFeatureSuggestions(
  projectId: number, 
  perspective: Perspective
): Promise<{
  name: string;
  description: string;
  perspective: Perspective;
  suggestedCategory: Category;
}[]> {
  // Add error handling and detailed logging for troubleshooting
  try {
    console.log(`Generating feature suggestions for project ${projectId} with perspective ${perspective}`);
    
    const result = await apiRequest<{
      name: string;
      description: string;
      perspective: Perspective;
      suggestedCategory: Category;
    }[]>(
      `/api/projects/${projectId}/ai/suggest-features`, 
      'POST', 
      { perspective }
    );
    
    console.log(`Successfully generated ${result?.length || 0} suggestions`);
    return result;
  } catch (error) {
    console.error('Error generating feature suggestions:', error);
    throw error;
  }
}

export async function generateProjectFeatureSuggestions(
  projectId: number, 
  perspective: Perspective
): Promise<{
  name: string;
  description: string;
  perspective: Perspective;
  suggestedCategory: Category;
}[]> {
  return apiRequest<{
    name: string;
    description: string;
    perspective: Perspective;
    suggestedCategory: Category;
  }[]>(
    `/api/projects/${projectId}/ai/suggest-features`, 
    'POST', 
    { perspective }
  );
}

export async function generateProjectFeatureSuggestionsFromInfo(
  projectId: number, 
  projectInfo: {
    mission?: string;
    goals?: string[];
    inScope?: string[];
    outOfScope?: string[];
  }
): Promise<{
  suggestions: {
    name: string;
    description: string;
    perspective: Perspective;
    suggestedCategory: Category;
  }[];
}> {
  return apiRequest<{
    suggestions: {
      name: string;
      description: string;
      perspective: Perspective;
      suggestedCategory: Category;
    }[];
  }>(
    `/api/projects/${projectId}/ai/suggest-features-from-info`, 
    'POST', 
    projectInfo
  );
}
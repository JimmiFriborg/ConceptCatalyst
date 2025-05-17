import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  features, type Feature, type InsertFeature,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion,
  type Category
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Feature methods
  getFeatures(projectId: number): Promise<Feature[]>;
  getFeature(id: number): Promise<Feature | undefined>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  updateFeature(id: number, feature: Partial<InsertFeature>): Promise<Feature | undefined>;
  updateFeatureCategory(id: number, category: Category): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;
  
  // AI Suggestion methods
  getAiSuggestions(projectId: number): Promise<AiSuggestion[]>;
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  deleteAiSuggestion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private features: Map<number, Feature>;
  private aiSuggestions: Map<number, AiSuggestion>;
  private userCurrentId: number;
  private projectCurrentId: number;
  private featureCurrentId: number;
  private suggestionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.features = new Map();
    this.aiSuggestions = new Map();
    this.userCurrentId = 1;
    this.projectCurrentId = 1;
    this.featureCurrentId = 1;
    this.suggestionCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      description: insertProject.description || null,
      createdAt: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete associated features and suggestions first
    const features = await this.getFeatures(id);
    for (const feature of features) {
      await this.deleteFeature(feature.id);
    }
    
    const suggestions = await this.getAiSuggestions(id);
    for (const suggestion of suggestions) {
      await this.deleteAiSuggestion(suggestion.id);
    }
    
    return this.projects.delete(id);
  }

  // Feature methods
  async getFeatures(projectId: number): Promise<Feature[]> {
    return Array.from(this.features.values()).filter(
      (feature) => feature.projectId === projectId
    );
  }

  async getFeature(id: number): Promise<Feature | undefined> {
    return this.features.get(id);
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const id = this.featureCurrentId++;
    const feature: Feature = { 
      ...insertFeature, 
      id, 
      aiEnhanced: insertFeature.aiEnhanced || null,
      createdAt: new Date() 
    };
    this.features.set(id, feature);
    return feature;
  }

  async updateFeature(id: number, featureData: Partial<InsertFeature>): Promise<Feature | undefined> {
    const feature = this.features.get(id);
    if (!feature) return undefined;
    
    const updatedFeature = { ...feature, ...featureData };
    this.features.set(id, updatedFeature);
    return updatedFeature;
  }

  async updateFeatureCategory(id: number, category: Category): Promise<Feature | undefined> {
    const feature = this.features.get(id);
    if (!feature) return undefined;
    
    const updatedFeature = { ...feature, category };
    this.features.set(id, updatedFeature);
    return updatedFeature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    return this.features.delete(id);
  }

  // AI Suggestion methods
  async getAiSuggestions(projectId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(
      (suggestion) => suggestion.projectId === projectId
    );
  }

  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.suggestionCurrentId++;
    const suggestion: AiSuggestion = { 
      ...insertSuggestion, 
      id, 
      createdAt: new Date() 
    };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }

  async deleteAiSuggestion(id: number): Promise<boolean> {
    return this.aiSuggestions.delete(id);
  }
}

export const storage = new MemStorage();

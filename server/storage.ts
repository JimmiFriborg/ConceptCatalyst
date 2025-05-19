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
  getChildProjects(parentId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  branchProject(parentId: number, project: InsertProject): Promise<Project>;
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
    // Initialize with empty maps
    this.users = new Map();
    this.projects = new Map();
    this.features = new Map();
    this.aiSuggestions = new Map();
    this.userCurrentId = 1;
    this.projectCurrentId = 1;
    this.featureCurrentId = 1;
    this.suggestionCurrentId = 1;
    
    // Load any persisted data from global storage
    this.loadPersistedData();
    
    // Set up auto-save on a regular interval
    setInterval(() => this.persistData(), 2000); // Save more frequently (every 2 seconds)
    
    // Also ensure data is saved before shutdown
    process.on('beforeExit', () => {
      console.log('Server shutting down, persisting data...');
      this.persistData();
    });
  }
  
  // Persist data to localStorage
  private persistData(): void {
    try {
      const dataToSave = {
        users: Array.from(this.users.entries()),
        projects: Array.from(this.projects.entries()),
        features: Array.from(this.features.entries()),
        aiSuggestions: Array.from(this.aiSuggestions.entries()),
        userCurrentId: this.userCurrentId,
        projectCurrentId: this.projectCurrentId,
        featureCurrentId: this.featureCurrentId,
        suggestionCurrentId: this.suggestionCurrentId
      };
      
      // Save to global in-memory variable that persists between server restarts
      if (global.persistedAppData === undefined) {
        global.persistedAppData = {};
      }
      
      // Deep clone the data to ensure we don't have reference issues
      const clonedData = JSON.parse(JSON.stringify(dataToSave));
      global.persistedAppData.memStorage = clonedData;
      
      // We'll only use the in-memory global variable for persistence
      // File system persistence caused issues
      
      console.log(`Data persisted: ${this.projects.size} projects, ${this.features.size} features, ${this.aiSuggestions.size} suggestions`);
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }
  
  // Load data from persistence
  private loadPersistedData(): void {
    try {
      // Try to load from global memory
      if (global.persistedAppData && global.persistedAppData.memStorage) {
        const data = global.persistedAppData.memStorage;
        this.loadDataFromObject(data);
        console.log(`Data loaded: ${this.projects.size} projects, ${this.features.size} features, ${this.aiSuggestions.size} suggestions`);
        return;
      }
      
      console.log('No persisted data found, starting with empty storage');
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }
  
  // Helper method to populate data structures from loaded data
  private loadDataFromObject(data: any): void {
    // Restore maps
    this.users = new Map(data.users);
    this.projects = new Map(data.projects);
    this.features = new Map(data.features);
    this.aiSuggestions = new Map(data.aiSuggestions);
    
    // Restore IDs
    this.userCurrentId = data.userCurrentId;
    this.projectCurrentId = data.projectCurrentId;
    this.featureCurrentId = data.featureCurrentId;
    this.suggestionCurrentId = data.suggestionCurrentId;
  }
  
  async getChildProjects(parentId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.parentId === parentId);
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
  
  async branchProject(parentId: number, insertProject: InsertProject): Promise<Project> {
    const parent = await this.getProject(parentId);
    if (!parent) {
      throw new Error("Parent project not found");
    }
    
    const id = this.projectCurrentId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      parentId,
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

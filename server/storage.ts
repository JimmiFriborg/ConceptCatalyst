import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  features, type Feature, type InsertFeature,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion,
  concepts, type Concept, type InsertConcept,
  type Priority
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;
  
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
  updateFeaturePriority(id: number, priority: Priority): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;
  
  // Concept methods
  getConcepts(): Promise<Concept[]>;
  getConcept(id: number): Promise<Concept | undefined>;
  createConcept(concept: InsertConcept): Promise<Concept>;
  updateConcept(id: number, concept: Partial<InsertConcept>): Promise<Concept | undefined>;
  deleteConcept(id: number): Promise<boolean>;
  
  // AI Suggestion methods
  getAiSuggestions(projectId: number): Promise<AiSuggestion[]>;
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  deleteAiSuggestion(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getChildProjects(parentId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.parentId, parentId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }
  
  async branchProject(parentId: number, insertProject: InsertProject): Promise<Project> {
    const parent = await this.getProject(parentId);
    if (!parent) {
      throw new Error("Parent project not found");
    }
    
    const projectWithParent = {
      ...insertProject,
      parentId
    };
    
    const [project] = await db.insert(projects).values(projectWithParent).returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...projectData,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      // Delete associated features first
      await db.delete(features).where(eq(features.projectId, id));
      
      // Delete associated AI suggestions
      await db.delete(aiSuggestions).where(eq(aiSuggestions.projectId, id));
      
      // Delete the project
      await db.delete(projects).where(eq(projects.id, id));
      
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  // Feature methods
  async getFeatures(projectId: number): Promise<Feature[]> {
    return await db
      .select()
      .from(features)
      .where(eq(features.projectId, projectId));
  }

  async getFeature(id: number): Promise<Feature | undefined> {
    const [feature] = await db
      .select()
      .from(features)
      .where(eq(features.id, id));
    
    return feature;
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const [feature] = await db
      .insert(features)
      .values(insertFeature)
      .returning();
    
    return feature;
  }

  async updateFeature(id: number, featureData: Partial<InsertFeature>): Promise<Feature | undefined> {
    const [updatedFeature] = await db
      .update(features)
      .set({
        ...featureData,
        updatedAt: new Date()
      })
      .where(eq(features.id, id))
      .returning();
    
    return updatedFeature;
  }

  async updateFeaturePriority(id: number, priority: Priority): Promise<Feature | undefined> {
    const [updatedFeature] = await db
      .update(features)
      .set({
        priority,
        updatedAt: new Date()
      })
      .where(eq(features.id, id))
      .returning();
    
    return updatedFeature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    try {
      await db.delete(features).where(eq(features.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete feature:', error);
      return false;
    }
  }

  // Concept methods
  async getConcepts(): Promise<Concept[]> {
    return await db.select().from(concepts);
  }

  async getConcept(id: number): Promise<Concept | undefined> {
    const [concept] = await db
      .select()
      .from(concepts)
      .where(eq(concepts.id, id));
    
    return concept;
  }

  async createConcept(insertConcept: InsertConcept): Promise<Concept> {
    const [concept] = await db
      .insert(concepts)
      .values(insertConcept)
      .returning();
    
    return concept;
  }

  async updateConcept(id: number, conceptData: Partial<InsertConcept>): Promise<Concept | undefined> {
    const [updatedConcept] = await db
      .update(concepts)
      .set({
        ...conceptData,
        updatedAt: new Date()
      })
      .where(eq(concepts.id, id))
      .returning();
    
    return updatedConcept;
  }

  async deleteConcept(id: number): Promise<boolean> {
    try {
      await db.delete(concepts).where(eq(concepts.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete concept:', error);
      return false;
    }
  }

  // AI Suggestion methods
  async getAiSuggestions(projectId: number): Promise<AiSuggestion[]> {
    return await db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.projectId, projectId));
  }

  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    const [suggestion] = await db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.id, id));
    
    return suggestion;
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [suggestion] = await db
      .insert(aiSuggestions)
      .values(insertSuggestion)
      .returning();
    
    return suggestion;
  }

  async deleteAiSuggestion(id: number): Promise<boolean> {
    try {
      await db.delete(aiSuggestions).where(eq(aiSuggestions.id, id));
      return true;
    } catch (error) {
      console.error('Failed to delete AI suggestion:', error);
      return false;
    }
  }
}

// Import required Drizzle components and functions
import { db } from "./db";
import { eq } from "drizzle-orm";

export const storage = new DatabaseStorage();

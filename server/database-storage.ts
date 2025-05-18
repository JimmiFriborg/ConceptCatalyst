import { users, type User, type InsertUser, projects, type Project, type InsertProject, features, type Feature, type InsertFeature, aiSuggestions, type AiSuggestion, type InsertAiSuggestion, Category } from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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
    // Ensure parent exists
    const parent = await this.getProject(parentId);
    if (!parent) {
      throw new Error("Parent project not found");
    }
    
    // Create project with parent ID reference
    const values = { ...insertProject, parentId };
    const [project] = await db.insert(projects).values(values).returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete related features first
    await db.delete(features).where(eq(features.projectId, id));
    
    // Delete related AI suggestions
    await db.delete(aiSuggestions).where(eq(aiSuggestions.projectId, id));
    
    // Delete the project
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Feature methods
  async getFeatures(projectId: number): Promise<Feature[]> {
    return await db.select().from(features).where(eq(features.projectId, projectId));
  }

  async getFeature(id: number): Promise<Feature | undefined> {
    const [feature] = await db.select().from(features).where(eq(features.id, id));
    return feature;
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const [feature] = await db.insert(features).values(insertFeature).returning();
    return feature;
  }

  async updateFeature(id: number, featureData: Partial<InsertFeature>): Promise<Feature | undefined> {
    const [feature] = await db
      .update(features)
      .set(featureData)
      .where(eq(features.id, id))
      .returning();
    return feature;
  }

  async updateFeatureCategory(id: number, category: Category): Promise<Feature | undefined> {
    const [feature] = await db
      .update(features)
      .set({ category })
      .where(eq(features.id, id))
      .returning();
    return feature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    const result = await db.delete(features).where(eq(features.id, id)).returning();
    return result.length > 0;
  }

  // AI Suggestion methods
  async getAiSuggestions(projectId: number): Promise<AiSuggestion[]> {
    return await db.select().from(aiSuggestions).where(eq(aiSuggestions.projectId, projectId));
  }

  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    const [suggestion] = await db.select().from(aiSuggestions).where(eq(aiSuggestions.id, id));
    return suggestion;
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [suggestion] = await db.insert(aiSuggestions).values(insertSuggestion).returning();
    return suggestion;
  }

  async deleteAiSuggestion(id: number): Promise<boolean> {
    const result = await db.delete(aiSuggestions).where(eq(aiSuggestions.id, id)).returning();
    return result.length > 0;
  }
}
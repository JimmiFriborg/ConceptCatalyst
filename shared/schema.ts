import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Perspective enum for feature suggestions
export const perspectiveEnum = z.enum([
  "technical",
  "business",
  "ux",
  "security",
]);

export type Perspective = z.infer<typeof perspectiveEnum>;

// Category enum for feature categorization
export const categoryEnum = z.enum([
  "mvp",
  "launch",
  "v1.5",
  "v2.0",
  "rejected",
]);

export type Category = z.infer<typeof categoryEnum>;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  // Project Wizard Extensions
  mission: text("mission"),
  goals: jsonb("goals").default('[]'),
  inScope: jsonb("in_scope").default('[]'),
  outOfScope: jsonb("out_of_scope").default('[]'),
  constraints: jsonb("constraints").default('[]'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Branch tracking fields
  branchReason: text("branch_reason"), // Stores the AI's reasoning for why branching occurred 
  isAutoBranched: boolean("is_auto_branched").default(false), // Indicates if project was auto-branched by AI
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  parentId: true,
  mission: true,
  goals: true,
  inScope: true,
  outOfScope: true,
  constraints: true,
  branchReason: true,
  isAutoBranched: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Features table
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  perspective: text("perspective", { enum: ["technical", "business", "ux", "security"] }).notNull(),
  category: text("category", { enum: ["mvp", "launch", "v1.5", "v2.0", "rejected"] }).notNull(),
  aiEnhanced: jsonb("ai_enhanced"),
  tags: jsonb("tags").default('[]'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  similarityScore: integer("similarity_score"), // For branching detection: how similar to project scope
});

export const insertFeatureSchema = createInsertSchema(features).pick({
  projectId: true,
  name: true,
  description: true,
  perspective: true,
  category: true,
  aiEnhanced: true,
  tags: true,
  similarityScore: true,
});

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type Feature = typeof features.$inferSelect;

// AI Suggestions table
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  perspective: text("perspective", { enum: ["technical", "business", "ux", "security"] }).notNull(),
  suggestedCategory: text("suggested_category", { enum: ["mvp", "launch", "v1.5", "v2.0", "rejected"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  projectId: true,
  name: true,
  description: true,
  perspective: true,
  suggestedCategory: true,
});

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

// Frankenstein Feature Concept Ideas
export const conceptIdeas = pgTable("concept_ideas", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(), // Project where the concept was created
  title: text("title").notNull(),
  description: text("description").notNull(),
  sourcedFeatures: jsonb("sourced_features").default('[]'), // Array of feature IDs used in creation
  innovations: jsonb("innovations").default('[]'), // Array of innovation descriptions
  implementation: text("implementation"), // AI-generated implementation details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConceptIdeaSchema = createInsertSchema(conceptIdeas).pick({
  projectId: true,
  title: true,
  description: true,
  sourcedFeatures: true,
  innovations: true,
  implementation: true,
});

export type InsertConceptIdea = z.infer<typeof insertConceptIdeaSchema>;
export type ConceptIdea = typeof conceptIdeas.$inferSelect;

// Branch recommendations from AI
export const branchRecommendations = pgTable("branch_recommendations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(), // Project that triggered the recommendation
  featureId: integer("feature_id").notNull(), // Feature that triggered the recommendation
  shouldBranch: boolean("should_branch").notNull(),
  reason: text("reason").notNull(),
  suggestedName: text("suggested_name"),
  implemented: boolean("implemented").default(false), // Whether the recommendation was acted on
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBranchRecommendationSchema = createInsertSchema(branchRecommendations).pick({
  projectId: true,
  featureId: true,
  shouldBranch: true,
  reason: true,
  suggestedName: true,
  implemented: true,
});

export type InsertBranchRecommendation = z.infer<typeof insertBranchRecommendationSchema>;
export type BranchRecommendation = typeof branchRecommendations.$inferSelect;

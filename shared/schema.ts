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
  "gameplay",
  "gameDesign",
  "narrative",
  "monetization",
  "marketing"
]);

export type Perspective = z.infer<typeof perspectiveEnum>;

// Category enum for feature categorization (now used as priority)
export const categoryEnum = z.enum([
  "mvp",
  "launch",
  "v1.5",
  "v2.0",
  "rejected",
]);

export type Category = z.infer<typeof categoryEnum>;

// Project categories - high-level domains
export const projectCategoryEnum = z.enum([
  "game",
  "tool",
  "business",
  "social",
  "education",
  "entertainment",
  "productivity",
  "health",
  "finance",
  "other"
]);

export type ProjectCategory = z.infer<typeof projectCategoryEnum>;

// Base capabilities that can be selected during project/concept creation
export const baseCapabilityEnum = z.enum([
  "user_authentication",
  "payment_processing",
  "messaging",
  "file_storage",
  "ai_integration",
  "data_visualization",
  "social_sharing",
  "search_functionality",
  "notifications",
  "analytics"
]);

export type BaseCapability = z.infer<typeof baseCapabilityEnum>;

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
  // Concept-related fields
  isConcept: integer("is_concept").default(0),
  projectCategory: text("project_category").default("other"),
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
  isConcept: true,
  projectCategory: true,
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
});

export const insertFeatureSchema = createInsertSchema(features).pick({
  projectId: true,
  name: true,
  description: true,
  perspective: true,
  category: true,
  aiEnhanced: true,
  tags: true,
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

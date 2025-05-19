import { relations } from "drizzle-orm";
import { pgTable, text, serial, integer, jsonb, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users table with enhanced fields
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(), // user, admin
  preferences: jsonb("preferences"), // JSON of user preferences
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  preferences: true,
});

export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  features: many(features),
  concepts: many(concepts),
}));

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

// Priority enum (renamed from category)
export const priorityEnum = z.enum([
  "mvp",
  "launch",
  "v1.5",
  "v2.0",
  "future",
  "backlog",
  "rejected",
]);

export type Priority = z.infer<typeof priorityEnum>;

// Concept categories
export const conceptCategoryEnum = z.enum([
  "game",
  "tool",
  "service",
  "platform",
  "application",
  "hardware",
  "other"
]);

export type ConceptCategory = z.infer<typeof conceptCategoryEnum>;

// Projects table with enhanced fields
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  type: varchar("type").default("project"), // "project" or "concept"
  conceptCategory: varchar("concept_category"), // For concept types
  status: varchar("status").default("planning"), // planning, in-progress, on-hold, completed
  
  // AI optimizations
  aiOptimized: boolean("ai_optimized").default(false),
  aiModelRequirements: text("ai_model_requirements"),
  aiEthicalConsiderations: jsonb("ai_ethical_considerations").default('[]'),
  
  // Project metadata
  mission: text("mission"),
  goals: jsonb("goals").default('[]'),
  inScope: jsonb("in_scope").default('[]'),
  outOfScope: jsonb("out_of_scope").default('[]'),
  constraints: jsonb("constraints").default('[]'),
  technicalRequirements: text("technical_requirements"),
  deadline: varchar("deadline"),
  public: boolean("public").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  parent: one(projects, {
    fields: [projects.parentId],
    references: [projects.id],
  }),
  features: many(features),
  branches: many(projects, {
    relationName: "project_branches",
  }),
}));

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  name: true,
  description: true,
  parentId: true,
  type: true,
  conceptCategory: true,
  status: true,
  aiOptimized: true,
  aiModelRequirements: true,
  aiEthicalConsiderations: true,
  mission: true,
  goals: true,
  inScope: true,
  outOfScope: true,
  constraints: true,
  technicalRequirements: true,
  deadline: true,
  public: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Features table with enhanced fields and priority (renamed from category)
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  perspective: text("perspective", { enum: ["technical", "business", "ux", "security"] }).notNull(),
  priority: text("priority", { enum: ["mvp", "launch", "v1.5", "v2.0", "future", "backlog", "rejected"] }).notNull(),
  userBenefit: text("user_benefit"),
  implementationComplexity: varchar("implementation_complexity").default("medium"), // low, medium, high
  
  // AI features
  isAiFeature: boolean("is_ai_feature").default(false),
  aiCapabilities: jsonb("ai_capabilities").default('[]'),
  aiIntegrationPoints: text("ai_integration_points"),
  
  dependencies: jsonb("dependencies").default('[]'),
  tags: jsonb("tags").default('[]'),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const featureRelations = relations(features, ({ one }) => ({
  project: one(projects, {
    fields: [features.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [features.userId],
    references: [users.id],
  }),
}));

export const insertFeatureSchema = createInsertSchema(features).pick({
  projectId: true,
  userId: true,
  name: true,
  description: true,
  perspective: true,
  priority: true,
  userBenefit: true,
  implementationComplexity: true,
  isAiFeature: true,
  aiCapabilities: true,
  aiIntegrationPoints: true,
  dependencies: true,
  tags: true,
});

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type Feature = typeof features.$inferSelect;

// Dedicated concepts table
export const concepts = pgTable("concepts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  conceptCategory: varchar("concept_category").default("other"),
  
  // Quick concept fields
  targetAudience: text("target_audience"),
  inspirations: jsonb("inspirations").default('[]'),
  potentialFeatures: jsonb("potential_features").default('[]'),
  
  // AI concept fields
  isAiConcept: boolean("is_ai_concept").default(false),
  aiPotential: text("ai_potential"),
  
  tags: jsonb("tags").default('[]'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conceptRelations = relations(concepts, ({ one }) => ({
  user: one(users, {
    fields: [concepts.userId],
    references: [users.id],
  }),
}));

export const insertConceptSchema = createInsertSchema(concepts).pick({
  userId: true,
  name: true,
  description: true,
  conceptCategory: true,
  targetAudience: true,
  inspirations: true,
  potentialFeatures: true,
  isAiConcept: true,
  aiPotential: true,
  tags: true,
});

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof concepts.$inferSelect;

// AI Suggestions table with priority (renamed from suggestedCategory)
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  perspective: text("perspective", { enum: ["technical", "business", "ux", "security"] }).notNull(),
  suggestedPriority: text("suggested_priority", { enum: ["mvp", "launch", "v1.5", "v2.0", "future", "backlog", "rejected"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiSuggestionRelations = relations(aiSuggestions, ({ one }) => ({
  project: one(projects, {
    fields: [aiSuggestions.projectId],
    references: [projects.id],
  }),
}));

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  projectId: true,
  name: true,
  description: true,
  perspective: true,
  suggestedPriority: true,
});

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

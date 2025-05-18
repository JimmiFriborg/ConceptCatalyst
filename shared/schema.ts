import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
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
]);

export type Category = z.infer<typeof categoryEnum>;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  parentId: true,
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
  category: text("category", { enum: ["mvp", "launch", "v1.5", "v2.0"] }).notNull(),
  aiEnhanced: jsonb("ai_enhanced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeatureSchema = createInsertSchema(features).pick({
  projectId: true,
  name: true,
  description: true,
  perspective: true,
  category: true,
  aiEnhanced: true,
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
  suggestedCategory: text("suggested_category", { enum: ["mvp", "launch", "v1.5", "v2.0"] }).notNull(),
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

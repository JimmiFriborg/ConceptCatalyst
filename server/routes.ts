import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertFeatureSchema, 
  perspectiveEnum, 
  categoryEnum 
} from "@shared/schema";
import { 
  analyzeFeature, 
  enhanceFeatureDescription, 
  generateFeatureSuggestions 
} from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/projects", async (_req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const validateResult = insertProjectSchema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: validateResult.error.format() 
        });
      }
      
      const project = await storage.createProject(validateResult.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const validateResult = insertProjectSchema.partial().safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: validateResult.error.format() 
        });
      }
      
      const updatedProject = await storage.updateProject(projectId, validateResult.data);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const success = await storage.deleteProject(projectId);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Features endpoints
  app.get("/api/projects/:projectId/features", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const features = await storage.getFeatures(projectId);
      res.json(features);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch features" });
    }
  });

  app.get("/api/features/:id", async (req: Request, res: Response) => {
    try {
      const featureId = parseInt(req.params.id);
      const feature = await storage.getFeature(featureId);
      
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.json(feature);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feature" });
    }
  });

  app.post("/api/projects/:projectId/features", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const validateResult = insertFeatureSchema.safeParse({
        ...req.body,
        projectId
      });
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid feature data", 
          errors: validateResult.error.format() 
        });
      }
      
      const feature = await storage.createFeature(validateResult.data);
      res.status(201).json(feature);
    } catch (error) {
      res.status(500).json({ message: "Failed to create feature" });
    }
  });

  app.put("/api/features/:id/category", async (req: Request, res: Response) => {
    try {
      const featureId = parseInt(req.params.id);
      const categorySchema = z.object({
        category: categoryEnum
      });
      
      const validateResult = categorySchema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid category", 
          errors: validateResult.error.format() 
        });
      }
      
      const updatedFeature = await storage.updateFeatureCategory(
        featureId, 
        validateResult.data.category
      );
      
      if (!updatedFeature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.json(updatedFeature);
    } catch (error) {
      res.status(500).json({ message: "Failed to update feature category" });
    }
  });

  app.put("/api/features/:id", async (req: Request, res: Response) => {
    try {
      const featureId = parseInt(req.params.id);
      const validateResult = insertFeatureSchema.partial().safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid feature data", 
          errors: validateResult.error.format() 
        });
      }
      
      const updatedFeature = await storage.updateFeature(featureId, validateResult.data);
      
      if (!updatedFeature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.json(updatedFeature);
    } catch (error) {
      res.status(500).json({ message: "Failed to update feature" });
    }
  });

  app.delete("/api/features/:id", async (req: Request, res: Response) => {
    try {
      const featureId = parseInt(req.params.id);
      const success = await storage.deleteFeature(featureId);
      
      if (!success) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete feature" });
    }
  });

  // AI-related endpoints
  app.post("/api/ai/analyze-feature", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        projectContext: z.string().optional()
      });
      
      const validateResult = schema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validateResult.error.format() 
        });
      }
      
      const { name, description, projectContext } = validateResult.data;
      const analysis = await analyzeFeature(name, description, projectContext);
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze feature" });
    }
  });

  app.post("/api/ai/enhance-description", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        description: z.string().min(1)
      });
      
      const validateResult = schema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validateResult.error.format() 
        });
      }
      
      const { name, description } = validateResult.data;
      const enhancement = await enhanceFeatureDescription(name, description);
      
      res.json(enhancement);
    } catch (error) {
      res.status(500).json({ message: "Failed to enhance description" });
    }
  });

  app.post("/api/projects/:projectId/ai/suggest-features", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const schema = z.object({
        perspective: perspectiveEnum
      });
      
      const validateResult = schema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid perspective", 
          errors: validateResult.error.format() 
        });
      }
      
      const features = await storage.getFeatures(projectId);
      const featuresList = features.map(f => ({
        name: f.name,
        description: f.description
      }));
      
      const suggestions = await generateFeatureSuggestions(
        project.name,
        project.description || "",
        featuresList,
        validateResult.data.perspective
      );
      
      // Store the suggestions in the database
      const storedSuggestions = [];
      for (const suggestion of suggestions) {
        const stored = await storage.createAiSuggestion({
          projectId,
          name: suggestion.name,
          description: suggestion.description,
          perspective: suggestion.perspective,
          suggestedCategory: suggestion.suggestedCategory
        });
        storedSuggestions.push(stored);
      }
      
      res.json(storedSuggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  app.get("/api/projects/:projectId/ai/suggestions", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const suggestions = await storage.getAiSuggestions(projectId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/ai/suggestions/:id/accept", async (req: Request, res: Response) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const suggestion = await storage.getAiSuggestion(suggestionId);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      // Convert suggestion to a feature
      const feature = await storage.createFeature({
        projectId: suggestion.projectId,
        name: suggestion.name,
        description: suggestion.description,
        perspective: suggestion.perspective,
        category: suggestion.suggestedCategory,
        aiEnhanced: null
      });
      
      // Delete the suggestion since it's now a feature
      await storage.deleteAiSuggestion(suggestionId);
      
      res.status(201).json(feature);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept suggestion" });
    }
  });

  app.delete("/api/ai/suggestions/:id", async (req: Request, res: Response) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const success = await storage.deleteAiSuggestion(suggestionId);
      
      if (!success) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete suggestion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

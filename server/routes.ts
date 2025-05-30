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
  generateFeatureSuggestions,
  analyzeForBranching,
  generateTags,
  generateFeaturesFromProjectInfo
} from "./openai";

// Import the enhance description function separately
import { enhanceFeatureDescription } from "./openai";
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
  
  app.get("/api/projects/:parentId/branches", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      const parentProject = await storage.getProject(parentId);
      
      if (!parentProject) {
        return res.status(404).json({ message: "Parent project not found" });
      }
      
      const childProjects = await storage.getChildProjects(parentId);
      res.json(childProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch branch projects" });
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
  
  app.post("/api/projects/:parentId/branch", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      
      if (isNaN(parentId)) {
        return res.status(400).json({ message: "Invalid parent project ID" });
      }
      
      const validateResult = insertProjectSchema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: validateResult.error.format() 
        });
      }
      
      const project = await storage.branchProject(parentId, validateResult.data);
      res.status(201).json(project);
    } catch (error: any) {
      if (error?.message === "Parent project not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create branch project" });
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
      
      // Use the openai module directly to create enhanced description
      const prompt = `
        Enhance and expand the following feature description with more details, technical considerations, or implementation notes:
        
        Feature Name: ${name}
        Current Description: ${description}
        
        Provide the enhanced description in JSON format:
        {
          "enhancedDescription": "Your enhanced description..."
        }
      `;
      
      // Import OpenAI and create a client
      const OpenAI = await import('openai');
      const openai = new OpenAI.default({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      
      const content = response.choices[0].message.content;
      const result = JSON.parse(content || "{}");
      
      res.json({
        enhancedDescription: result.enhancedDescription || description
      });
    } catch (error) {
      console.error("Error in enhance-description:", error);
      res.status(500).json({ 
        message: "Failed to enhance description",
        enhancedDescription: req.body.description 
      });
    }
  });
  
  app.post("/api/ai/generate-tags", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        featureName: z.string().min(1),
        featureDescription: z.string().min(1),
        projectContext: z.string().optional()
      });
      
      const validateResult = schema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validateResult.error.format() 
        });
      }
      
      const { featureName, featureDescription, projectContext } = validateResult.data;
      const projectInfo = projectContext || "General software project";
      const tags = await generateTags(featureName, featureDescription, projectInfo);
      
      res.json({ tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate tags" });
    }
  });
  
  app.post("/api/projects/:projectId/ai/analyze-branching", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const schema = z.object({
        newFeatureIds: z.array(z.number()).min(1)
      });
      
      const validateResult = schema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validateResult.error.format() 
        });
      }
      
      // Get all features from the project
      const allFeatures = await storage.getFeatures(projectId);
      
      // Split features into new and existing based on the provided IDs
      const { newFeatureIds } = validateResult.data;
      const newFeatures = allFeatures.filter(f => newFeatureIds.includes(f.id));
      const existingFeatures = allFeatures.filter(f => !newFeatureIds.includes(f.id));
      
      // If no existing features to compare against, can't determine branching
      if (existingFeatures.length === 0) {
        return res.json({
          shouldBranch: false,
          reason: "Not enough existing features to analyze for branching"
        });
      }
      
      // Convert features to the format required by the AI function
      const newFeatureData = newFeatures.map(f => ({
        name: f.name,
        description: f.description || ""
      }));
      
      const existingFeatureData = existingFeatures.map(f => ({
        name: f.name,
        description: f.description || ""
      }));
      
      // Call the AI to analyze if branching is recommended
      const branchRecommendation = await analyzeForBranching(
        project.name,
        project.description || "",
        newFeatureData,
        existingFeatureData
      );
      
      res.json(branchRecommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze for branching" });
    }
  });

  app.post("/api/projects/:projectId/ai/suggest-features", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Log API request details for debugging
      console.log(`API request to generate features for project ${projectId}`, req.body);
      
      // Simplified validation for maximum stability
      const perspective = req.body.perspective;
      if (!perspective || !['technical', 'business', 'ux', 'security'].includes(perspective)) {
        return res.status(400).json({ 
          message: "Invalid perspective. Must be technical, business, ux, or security." 
        });
      }
      
      const features = await storage.getFeatures(projectId);
      const featuresList = features.map(f => ({
        name: f.name,
        description: f.description || ""
      }));
      
      // Provide detailed project name and description for better context
      const projectName = project.name || "Untitled Project";
      const projectDescription = project.description || "No description provided";
      
      console.log(`Calling OpenAI to generate suggestions for ${projectName} with ${perspective} perspective`);
      
      const suggestions = await generateFeatureSuggestions(
        projectName,
        projectDescription,
        featuresList,
        perspective
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
  
  // Generate feature suggestions based on project information from wizard
  app.post("/api/projects/:projectId/ai/suggest-features-from-info", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const schema = z.object({
        mission: z.string().optional(),
        goals: z.array(z.string()).optional(),
        inScope: z.array(z.string()).optional(),
        outOfScope: z.array(z.string()).optional()
      });
      
      const validateResult = schema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: validateResult.error.format() 
        });
      }
      
      const { mission, goals, inScope, outOfScope } = validateResult.data;
      
      // Generate feature suggestions based on project information
      const suggestions = await generateFeaturesFromProjectInfo(
        project.name,
        mission || project.mission || undefined,
        goals || [],
        inScope || [],
        outOfScope || []
      );
      
      // Store suggestions in the database and format the response in the expected format
      const storedSuggestions = await Promise.all(
        suggestions.map(async suggestion => 
          storage.createAiSuggestion({
            projectId,
            name: suggestion.name,
            description: suggestion.description,
            perspective: suggestion.perspective,
            suggestedCategory: suggestion.suggestedCategory
          })
        )
      );
      
      // Format response to match what the client is expecting
      res.json({
        suggestions: storedSuggestions.map(s => ({
          name: s.name,
          description: s.description,
          perspective: s.perspective,
          suggestedCategory: s.suggestedCategory
        }))
      });
    } catch (error: any) {
      console.error("Error generating feature suggestions:", error);
      res.status(500).json({ 
        message: "Failed to generate feature suggestions from project info",
        details: error?.message || "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import OpenAI from "openai";
import { type Perspective, type Category } from "@shared/schema";

// Interface for the branch recommendation response
interface BranchRecommendationResponse {
  shouldBranch: boolean;
  reason: string;
  suggestedName?: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-dev" 
});

// Define types for AI responses
interface FeatureAnalysisResponse {
  suggestedCategory: Category;
  rationale: string;
}

interface FeatureEnhancementResponse {
  enhancedDescription: string;
}

interface FeatureSuggestionResponse {
  name: string;
  description: string;
  perspective: Perspective;
  suggestedCategory: Category;
}

// Analyze a feature to recommend a category and provide rationale
export async function analyzeFeature(
  name: string, 
  description: string, 
  projectContext?: string
): Promise<FeatureAnalysisResponse> {
  try {
    const prompt = `
      As a product development expert, analyze the following feature request for categorization:
      
      Feature Name: ${name}
      Feature Description: ${description}
      ${projectContext ? `Project Context: ${projectContext}` : ''}
      
      Please assign this feature to one of these categories:
      - MVP (Must Have): Core features required for initial launch
      - Launch: Important features for initial public release
      - Version 1.5: Enhancement features for mid-term update
      - Version 2.0: Future features for major update
      
      Provide your categorization and rationale in JSON format:
      {
        "suggestedCategory": "mvp"|"launch"|"v1.5"|"v2.0",
        "rationale": "Your justification for this categorization..."
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content || "{}") as FeatureAnalysisResponse;
    
    return {
      suggestedCategory: result.suggestedCategory as Category, 
      rationale: result.rationale
    };
  } catch (error) {
    console.error("Error analyzing feature:", error);
    // Default fallback
    return {
      suggestedCategory: "mvp",
      rationale: "Unable to analyze feature with AI. Default recommendation to MVP for manual review."
    };
  }
}

// Enhance a feature description with AI
export async function enhanceFeatureDescription(
  name: string, 
  description: string
): Promise<FeatureEnhancementResponse> {
  try {
    const prompt = `
      Enhance and expand the following feature description with more details, technical considerations, or implementation notes:
      
      Feature Name: ${name}
      Current Description: ${description}
      
      Provide the enhanced description in JSON format:
      {
        "enhancedDescription": "Your enhanced description..."
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content || "{}") as FeatureEnhancementResponse;
    
    return {
      enhancedDescription: result.enhancedDescription
    };
  } catch (error) {
    console.error("Error enhancing feature description:", error);
    return {
      enhancedDescription: description
    };
  }
}

// Generate feature suggestions based on project context
// Analyze a set of features to detect if they're drifting from project scope and recommend branching
export async function analyzeForBranching(
  projectName: string,
  projectDescription: string,
  newFeatures: { name: string; description: string }[],
  existingFeatures: { name: string; description: string }[]
): Promise<BranchRecommendationResponse> {
  try {
    const newFeaturesText = newFeatures
      .map(f => `- ${f.name}: ${f.description}`)
      .join("\n");
    
    const existingFeaturesText = existingFeatures
      .map(f => `- ${f.name}: ${f.description}`)
      .join("\n");
    
    const prompt = `
      As a product management expert, analyze whether the following new features are drifting from the original project scope:
      
      Project Name: ${projectName}
      Project Description: ${projectDescription}
      
      Existing Features:
      ${existingFeaturesText}
      
      New Features:
      ${newFeaturesText}
      
      Analyze if these new features represent a significant direction change or scope change that would warrant creating a new project branch.
      
      Return your analysis in JSON format:
      {
        "shouldBranch": true/false,
        "reason": "Your explanation of why these features should or should not be branched",
        "suggestedName": "Suggested name for new branch project (if branching is recommended)"
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content || "{}") as BranchRecommendationResponse;
    
    return {
      shouldBranch: result.shouldBranch,
      reason: result.reason,
      suggestedName: result.suggestedName
    };
  } catch (error) {
    console.error("Error analyzing for branching:", error);
    return {
      shouldBranch: false,
      reason: "Unable to analyze features with AI. Please review manually."
    };
  }
}

export async function generateFeatureSuggestions(
  projectName: string,
  projectDescription: string,
  existingFeatures: { name: string; description: string }[],
  perspective: Perspective
): Promise<FeatureSuggestionResponse[]> {
  try {
    const existingFeaturesText = existingFeatures
      .map(f => `- ${f.name}: ${f.description}`)
      .join("\n");
    
    const prompt = `
      As a product development expert with a focus on ${perspective} perspective, suggest new features for the following project:
      
      Project Name: ${projectName}
      Project Description: ${projectDescription}
      
      Existing Features:
      ${existingFeaturesText}
      
      Generate 3 feature suggestions focused on the ${perspective} perspective.
      
      Return your suggestions in JSON format with an array of features:
      [
        {
          "name": "Feature name",
          "description": "Detailed description",
          "perspective": "${perspective}",
          "suggestedCategory": "mvp"|"launch"|"v1.5"|"v2.0"
        }
      ]
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const results = JSON.parse(content || "[]");
    
    // Ensure the results have the correct format
    if (Array.isArray(results)) {
      return results.map(result => ({
        name: result.name,
        description: result.description,
        perspective: result.perspective as Perspective,
        suggestedCategory: result.suggestedCategory as Category
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error generating feature suggestions:", error);
    return [];
  }
}

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

// Create OpenAI client with proper API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Validate API key
console.log(`OpenAI API Key available: ${!!process.env.OPENAI_API_KEY}`);
console.log(`Using OpenAI model: ${OPENAI_MODEL}`);

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

interface ProjectInfoFeatureSuggestionResponse {
  suggestions: FeatureSuggestionResponse[];
}

interface TagGenerationResponse {
  tags: string[];
  rationale: string;
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

// Generate tags for a feature based on its name and description
export async function generateTags(
  featureName: string,
  featureDescription: string, 
  projectContext: string
): Promise<string[]> {
  try {
    const prompt = `
      You are an expert product tagger helping to categorize features for a software project.
      Given the information about a feature, generate 3-7 relevant tags.
      
      Project Context: ${projectContext}
      
      Feature Name: ${featureName}
      Feature Description: ${featureDescription}
      
      Generate 3-7 relevant tags for this feature. Tags should be single words or short phrases (1-3 words) 
      that capture key concepts, technologies, domains, or user needs.
      
      Format your response as a JSON object with this exact structure:
      {
        "tags": ["tag1", "tag2", "tag3"],
        "rationale": "Brief explanation of why these tags were chosen"
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(content || "{}") as TagGenerationResponse;
    
    return result.tags || [];
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}

export async function generateFeaturesFromProjectInfo(
  projectName: string,
  projectMission?: string | null,
  goals?: string[],
  inScope?: string[],
  outOfScope?: string[]
): Promise<FeatureSuggestionResponse[]> {
  try {
    const prompt = `
      As an expert product manager, generate 5-8 feature suggestions for a software project based on the following information:
      
      Project Name: ${projectName}
      ${projectMission ? `Project Mission: ${projectMission}` : ''}
      ${goals && goals.length > 0 ? `Goals: ${goals.join(', ')}` : ''}
      ${inScope && inScope.length > 0 ? `In Scope: ${inScope.join(', ')}` : ''}
      ${outOfScope && outOfScope.length > 0 ? `Out of Scope: ${outOfScope.join(', ')}` : ''}
      
      For each feature, provide:
      1. A clear and concise name
      2. A detailed description explaining its purpose and value
      3. A technical perspective (technical, business, ux, or security)
      4. A suggested category (mvp, launch, v1.5, v2.0)
      
      Generate a diverse set of features that cover different aspects of the project.
      Include both essential features and innovative ideas.
      
      Respond with a JSON object with this structure:
      {
        "suggestions": [
          {
            "name": "Feature Name",
            "description": "Detailed description",
            "perspective": "technical|business|ux|security",
            "suggestedCategory": "mvp|launch|v1.5|v2.0"
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating features from project info:", error);
    return [];
  }
}

export async function generateFeatureSuggestions(
  projectName: string,
  projectDescription: string,
  existingFeatures: { name: string; description: string }[],
  perspective: Perspective
): Promise<FeatureSuggestionResponse[]> {
  console.log(`GenerateFeatureSuggestions called for project: ${projectName}, perspective: ${perspective}`);
  
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("ERROR: OPENAI_API_KEY not available!");
      throw new Error("API key not available");
    }
    
    // Log API key availability (not the actual key)
    console.log(`OPENAI_API_KEY status: ${process.env.OPENAI_API_KEY ? "Available" : "Missing"}`);
    console.log(`Using model: ${OPENAI_MODEL}`);
    
    const existingFeaturesText = existingFeatures && existingFeatures.length > 0
      ? existingFeatures.map(f => `- ${f.name}: ${f.description}`).join("\n")
      : "No existing features yet.";
    
    // Create a prompt that explicitly requests a specific JSON format
    const prompt = `
As a product development expert focusing on the ${perspective} perspective, please suggest 3 innovative features for this project:

PROJECT DETAILS:
Project Name: ${projectName}
Project Description: ${projectDescription}

${existingFeatures.length > 0 ? `EXISTING FEATURES:\n${existingFeaturesText}` : "No existing features yet."}

INSTRUCTIONS:
1. Suggest exactly 3 new features from the ${perspective} perspective
2. Each feature should be realistic and implementable
3. Ensure features don't duplicate existing ones
4. Features should focus on ${perspective} aspects

REQUIRED FORMAT:
Return your response as a JSON array of objects with the exact structure shown below:
[
  {
    "name": "Feature Name Here",
    "description": "Detailed description of the feature (2-3 sentences)",
    "perspective": "${perspective}",
    "suggestedCategory": "mvp"
  },
  {
    "name": "Second Feature",
    "description": "Description of second feature",
    "perspective": "${perspective}",
    "suggestedCategory": "launch"
  },
  {
    "name": "Third Feature",
    "description": "Description of third feature",
    "perspective": "${perspective}",
    "suggestedCategory": "v1.5"
  }
]

The suggestedCategory must be one of: "mvp", "launch", "v1.5", or "v2.0"
Do not include any explanations or text outside of the JSON array.
`.trim();

    console.log("Sending request to OpenAI...");
    
    // Make API call with explicit JSON response format
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are a product feature generator that ONLY outputs valid JSON arrays with feature suggestions."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log("Received response from OpenAI");
    
    // Get response content
    const content = response.choices[0].message.content;
    if (!content) {
      console.error("Empty content in OpenAI response");
      throw new Error("Empty response from API");
    }
    
    try {
      console.log("Parsing response content");
      const parsedContent = JSON.parse(content);
      
      // Check if we got an array of features directly
      if (Array.isArray(parsedContent)) {
        console.log(`Successfully parsed ${parsedContent.length} feature suggestions`);
        return parsedContent.map((item: any) => ({
          name: item.name || "Unnamed Feature",
          description: item.description || "No description provided",
          perspective: perspective,
          suggestedCategory: item.suggestedCategory as Category || "mvp"
        }));
      } 
      // Check if features are in a suggestions property
      else if (parsedContent.suggestions && Array.isArray(parsedContent.suggestions)) {
        console.log(`Successfully parsed ${parsedContent.suggestions.length} feature suggestions from 'suggestions' property`);
        return parsedContent.suggestions.map((item: any) => ({
          name: item.name || "Unnamed Feature",
          description: item.description || "No description provided",
          perspective: perspective,
          suggestedCategory: item.suggestedCategory as Category || "mvp"
        }));
      } 
      // If we got some other JSON format
      else {
        console.error("Unexpected response format:", JSON.stringify(parsedContent).substring(0, 200));
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Response content:", content.substring(0, 200));
      throw new Error("Failed to parse response");
    }
  } catch (error) {
    console.error("Error generating feature suggestions:", error);
    
    // Return pre-defined high-quality feature suggestions by perspective
    const suggestions: FeatureSuggestionResponse[] = [];
    
    if (perspective === "technical") {
      suggestions.push(
        {
          name: "Automated Testing Framework",
          description: "Implement comprehensive test suite with unit, integration, and E2E tests. Includes CI integration and detailed reporting.",
          perspective: perspective,
          suggestedCategory: "mvp"
        },
        {
          name: "API Rate Limiting",
          description: "Add request throttling to prevent abuse. Includes configurable limits per endpoint and proper 429 responses.",
          perspective: perspective,
          suggestedCategory: "launch"
        },
        {
          name: "Performance Monitoring",
          description: "Implement detailed metrics tracking for application performance. Includes dashboards and automated alerts for anomalies.",
          perspective: perspective,
          suggestedCategory: "v1.5"
        }
      );
    } else if (perspective === "business") {
      suggestions.push(
        {
          name: "Customer Analytics Dashboard",
          description: "Create a comprehensive view of user metrics and ROI calculations. Helps track business value and conversion rates.",
          perspective: perspective,
          suggestedCategory: "mvp"
        },
        {
          name: "Subscription Management",
          description: "Implement tiered pricing model with automated billing. Includes upgrade paths and usage analytics.",
          perspective: perspective,
          suggestedCategory: "launch"
        },
        {
          name: "Partner Integration API",
          description: "Develop secure API for third-party integrations. Expands ecosystem and creates new revenue opportunities.",
          perspective: perspective,
          suggestedCategory: "v2.0"
        }
      );
    } else if (perspective === "ux") {
      suggestions.push(
        {
          name: "Personalized Onboarding Flow",
          description: "Create adaptive first-time user experience based on user role. Ensures feature discovery and reduces learning curve.",
          perspective: perspective,
          suggestedCategory: "mvp"
        },
        {
          name: "Customizable Dashboard",
          description: "Allow users to arrange and select widgets for their main view. Settings sync across devices for consistent experience.",
          perspective: perspective,
          suggestedCategory: "v1.5"
        },
        {
          name: "Accessibility Enhancements",
          description: "Implement WCAG compliance features including keyboard navigation and screen reader support. Makes product usable for all users.",
          perspective: perspective,
          suggestedCategory: "launch"
        }
      );
    } else if (perspective === "security") {
      suggestions.push(
        {
          name: "Two-Factor Authentication",
          description: "Add extra security layer with app and SMS verification options. Includes recovery mechanisms and session management.",
          perspective: perspective,
          suggestedCategory: "mvp"
        },
        {
          name: "Data Encryption",
          description: "Implement end-to-end encryption for sensitive information. Uses industry standard algorithms with regular key rotation.",
          perspective: perspective,
          suggestedCategory: "launch"
        },
        {
          name: "Security Audit Logging",
          description: "Create detailed logs of security-relevant events with tamper-proof storage. Includes suspicious activity detection and alerts.",
          perspective: perspective,
          suggestedCategory: "v1.5"
        }
      );
    }
    
    return suggestions;
  }
}

// Add global types for Node.js
declare namespace NodeJS {
  interface Global {
    persistedAppData: {
      memStorage?: {
        users: [number, any][];
        projects: [number, any][];
        features: [number, any][];
        aiSuggestions: [number, any][];
        userCurrentId: number;
        projectCurrentId: number;
        featureCurrentId: number;
        suggestionCurrentId: number;
      };
    };
  }
}

// Make sure the global variable is available
declare const global: NodeJS.Global;
// src/lib/ai-router.ts
import axios from 'axios';
import { AIRouterConfig } from '../types/index';

interface AIModel {
  name: string;
  endpoint: string;
  apiKey: string;
}

class AIRouter {
  private models: AIModel[];
  private fallbackModel: AIModel;
  private config: AIRouterConfig;

  constructor(config: AIRouterConfig) {
    this.config = config;
    this.models = [
      {
        name: 'Groq',
        endpoint: 'https://api.groq.com/v1/',
        apiKey: config.groqApiKey,
      },
      {
        name: 'Gemini',
        endpoint: 'https://api.gemini.ai/v1/',
        apiKey: config.geminiApiKey,
      },
      {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/',
        apiKey: config.openaiApiKey,
      },
    ];
    this.fallbackModel = this.models[0];
  }

  async routeQuery(query: string): Promise<any> {
    for (const model of this.models) {
      try {
        const response = await axios.post(`${model.endpoint}query`, {
          query,
        }, {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        console.error(`Error routing query to ${model.name}: ${error.message}`);
        continue;
      }
    }
    // If all models fail, use the fallback model
    try {
      const response = await axios.post(`${this.fallbackModel.endpoint}query`, {
        query,
      }, {
        headers: {
          'Authorization': `Bearer ${this.fallbackModel.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error routing query to fallback model ${this.fallbackModel.name}: ${error.message}`);
      throw error;
    }
  }
}

export default AIRouter;

// src/types/index.ts
interface AIRouterConfig {
  groqApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
}

export { AIRouterConfig };

// Example usage:
import AIRouter from './ai-router';
import { AIRouterConfig } from '../types/index';

const config: AIRouterConfig = {
  groqApiKey: 'YOUR_GROQ_API_KEY',
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
  openaiApiKey: 'YOUR_OPENAI_API_KEY',
};

const aiRouter = new AIRouter(config);

aiRouter.routeQuery('Your query here')
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
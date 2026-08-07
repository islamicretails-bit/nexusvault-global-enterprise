// src/lib/ai-router.ts
import axios from 'axios';
import { AIRouterConfig } from '../types/index';

interface AIModel {
  name: string;
  endpoint: string;
  apiKey: string;
}

interface AIResponse {
  status: number;
  data: any;
}

class AIRouter {
  private models: AIModel[];
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
  }

  async routeQuery(query: string): Promise<AIResponse> {
    const modelIndex = 0; // Start with the first model
    let response: AIResponse | null = null;

    for (let i = modelIndex; i < this.models.length; i++) {
      const model = this.models[i];
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
        };
        const params = {
          prompt: query,
          max_tokens: 2048,
          temperature: 0.7,
        };
        const res = await axios.post(`${model.endpoint}completions`, params, { headers });
        response = {
          status: res.status,
          data: res.data,
        };
        break;
      } catch (error) {
        console.error(`Error routing query to ${model.name}: ${error.message}`);
        continue;
      }
    }

    if (!response) {
      throw new Error('Failed to route query to any AI model');
    }

    return response;
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

// Example usage in src/app/api/ai/generate-product/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import AIRouter from '../../lib/ai-router';
import { AIRouterConfig } from '../../types/index';

const aiRouterConfig: AIRouterConfig = {
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
};

const aiRouter = new AIRouter(aiRouterConfig);

const generateProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.body.query;
  try {
    const response = await aiRouter.routeQuery(query);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate product' });
  }
};

export default generateProduct;
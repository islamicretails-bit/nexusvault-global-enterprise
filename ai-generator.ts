// src/lib/ai-generator.ts

import { PrismaClient } from '@prisma/client';
import { AIRouterConfig } from '../types/index';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas, loadImage } from 'canvas';
import * as sharp from 'sharp';

const prisma = new PrismaClient();

interface AIAsset {
  id: string;
  type: string;
  prompt: string;
  response: string;
  metadata: any;
}

interface AIAssetGenerationOptions {
  type: string;
  prompt: string;
  config: AIRouterConfig;
}

class AIGenerator {
  async generateAsset(options: AIAssetGenerationOptions): Promise<AIAsset> {
    const { type, prompt, config } = options;
    const aiRouterConfig = config[type];

    if (!aiRouterConfig) {
      throw new Error(`AI router config not found for type ${type}`);
    }

    const response = await axios.post(aiRouterConfig.url, {
      prompt,
      max_tokens: aiRouterConfig.maxTokens,
      temperature: aiRouterConfig.temperature,
    }, {
      headers: {
        'Authorization': `Bearer ${aiRouterConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const asset: AIAsset = {
      id: uuidv4(),
      type,
      prompt,
      response: response.data.choices[0].text,
      metadata: response.data.metadata,
    };

    await prisma.aiAsset.create({
      data: asset,
    });

    return asset;
  }

  async generateEbook(prompt: string, config: AIRouterConfig): Promise<AIAsset> {
    const asset = await this.generateAsset({
      type: 'ebook',
      prompt,
      config,
    });

    const ebookContent = asset.response;
    const ebookBuffer = Buffer.from(ebookContent, 'utf-8');
    const ebookPath = path.join(__dirname, `../public/ebooks/${asset.id}.pdf`);

    fs.writeFileSync(ebookPath, ebookBuffer);

    return asset;
  }

  async generateGraphic(prompt: string, config: AIRouterConfig): Promise<AIAsset> {
    const asset = await this.generateAsset({
      type: 'graphic',
      prompt,
      config,
    });

    const graphicContent = asset.response;
    const graphicBuffer = Buffer.from(graphicContent, 'utf-8');
    const graphicPath = path.join(__dirname, `../public/graphics/${asset.id}.png`);

    const image = await loadImage(graphicBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const pngStream = canvas.createPNGStream();
    const out = fs.createWriteStream(graphicPath);
    pngStream.pipe(out);

    return asset;
  }

  async generateCode(prompt: string, config: AIRouterConfig): Promise<AIAsset> {
    const asset = await this.generateAsset({
      type: 'code',
      prompt,
      config,
    });

    const codeContent = asset.response;
    const codeBuffer = Buffer.from(codeContent, 'utf-8');
    const codePath = path.join(__dirname, `../public/code/${asset.id}.js`);

    fs.writeFileSync(codePath, codeBuffer);

    return asset;
  }

  async generateImage(prompt: string, config: AIRouterConfig): Promise<AIAsset> {
    const asset = await this.generateAsset({
      type: 'image',
      prompt,
      config,
    });

    const imageContent = asset.response;
    const imageBuffer = Buffer.from(imageContent, 'utf-8');
    const imagePath = path.join(__dirname, `../public/images/${asset.id}.png`);

    const imageSharp = await sharp(imageBuffer);
    await imageSharp.toFormat('png').toFile(imagePath);

    return asset;
  }
}

export default AIGenerator;
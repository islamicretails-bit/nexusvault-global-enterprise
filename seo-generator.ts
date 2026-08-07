// src/lib/seo-generator.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { OpenGraphMetadata, SchemaOrgMetadata } from '../types/index';

const prisma = new PrismaClient();

interface SeoGeneratorOptions {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image: string;
  type: 'article' | 'website' | 'product';
}

class SeoGenerator {
  private options: SeoGeneratorOptions;

  constructor(options: SeoGeneratorOptions) {
    this.options = options;
  }

  async generateOpenGraphMetadata(): Promise<OpenGraphMetadata> {
    const metadata: OpenGraphMetadata = {
      title: this.options.title,
      description: this.options.description,
      url: this.options.url,
      image: this.options.image,
      type: this.options.type,
    };

    return metadata;
  }

  async generateSchemaOrgMetadata(): Promise<SchemaOrgMetadata> {
    const metadata: SchemaOrgMetadata = {
      '@context': 'https://schema.org',
      '@type': this.options.type,
      name: this.options.title,
      description: this.options.description,
      url: this.options.url,
      image: this.options.image,
    };

    return metadata;
  }

  async generateSeoMetadata(): Promise<{ openGraph: OpenGraphMetadata; schemaOrg: SchemaOrgMetadata }> {
    const openGraphMetadata = await this.generateOpenGraphMetadata();
    const schemaOrgMetadata = await this.generateSchemaOrgMetadata();

    return { openGraph: openGraphMetadata, schemaOrg: schemaOrgMetadata };
  }
}

export const getSeoMetadata = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, description, keywords, url, image, type } = req.query;

  if (!title || !description || !keywords || !url || !image || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const seoGenerator = new SeoGenerator({
    title: title as string,
    description: description as string,
    keywords: keywords as string[],
    url: url as string,
    image: image as string,
    type: type as 'article' | 'website' | 'product',
  });

  const metadata = await seoGenerator.generateSeoMetadata();

  return res.json(metadata);
};

export default SeoGenerator;
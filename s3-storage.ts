// src/lib/s3-storage.ts
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CloudflareR2 } from '@cloudflare/r2';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the S3Storage interface
interface S3Storage {
  uploadFile(file: any, fileName: string): Promise<string>;
  getSignedUrl(fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}

// Define the S3Storage class
class S3StorageImpl implements S3Storage {
  private s3: AWS.S3;
  private r2: CloudflareR2;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.r2 = new CloudflareR2({
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      r2Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      accessKey: process.env.CLOUDFLARE_ACCESS_KEY,
    });
  }

  async uploadFile(file: any, fileName: string): Promise<string> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file,
    };

    const data = await this.s3.upload(params).promise();
    return data.Location;
  }

  async getSignedUrl(fileName: string): Promise<string> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Expires: 60, // 1 minute
    };

    const signedUrl = this.s3.getSignedUrl('getObject', params);
    return signedUrl;
  }

  async deleteFile(fileName: string): Promise<void> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
    };

    await this.s3.deleteObject(params).promise();
  }

  async uploadFileToR2(file: any, fileName: string): Promise<string> {
    const id = uuidv4();
    const result = await this.r2.put(id, file);
    return result.url;
  }

  async getSignedUrlFromR2(fileName: string): Promise<string> {
    const id = uuidv4();
    const result = await this.r2.get(id);
    return result.url;
  }

  async deleteFileFromR2(fileName: string): Promise<void> {
    const id = uuidv4();
    await this.r2.delete(id);
  }
}

// Export the S3Storage class
export const s3Storage = new S3StorageImpl();

// Example usage
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const file = req.body.file;
    const fileName = req.body.fileName;

    try {
      const uploadedFileUrl = await s3Storage.uploadFile(file, fileName);
      res.status(201).json({ url: uploadedFileUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error uploading file' });
    }
  } else if (req.method === 'GET') {
    const fileName = req.query.fileName;

    try {
      const signedUrl = await s3Storage.getSignedUrl(fileName as string);
      res.status(200).json({ url: signedUrl });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: 'File not found' });
    }
  } else if (req.method === 'DELETE') {
    const fileName = req.query.fileName;

    try {
      await s3Storage.deleteFile(fileName as string);
      res.status(204).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: 'File not found' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
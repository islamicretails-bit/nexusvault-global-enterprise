// src/lib/s3-storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { CloudflareR2 } from '@cloudflare/r2';
import { env } from '../env';

interface S3StorageConfig {
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface S3StorageOptions {
  expires: number;
  contentType: string;
}

class S3Storage {
  private s3Client: S3Client;
  private r2Client: CloudflareR2;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.r2Client = new CloudflareR2({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      namespace: env.CLOUDFLARE_NAMESPACE,
      accessKey: env.CLOUDFLARE_ACCESS_KEY,
    });
  }

  async uploadFile(file: Buffer, options: S3StorageOptions): Promise<string> {
    const params = {
      Bucket: this.config.bucketName,
      Key: uuidv4(),
      Body: file,
      ContentType: options.contentType,
    };

    const command = new PutObjectCommand(params);
    const response = await this.s3Client.send(command);

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('Failed to upload file');
    }

    const signedUrl = await this.getSignedUrl(params.Key, options.expires);
    return signedUrl;
  }

  async getFile(key: string): Promise<Buffer> {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const response = await this.s3Client.send(command);

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('Failed to get file');
    }

    return response.Body as Buffer;
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    const response = await this.s3Client.send(command);

    if (response.$metadata.httpStatusCode !== 204) {
      throw new Error('Failed to delete file');
    }
  }

  async getSignedUrl(key: string, expires: number): Promise<string> {
    const params = {
      Bucket: this.config.bucketName,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: expires,
    });

    return signedUrl;
  }

  async uploadFileToR2(file: Buffer, options: S3StorageOptions): Promise<string> {
    const params = {
      bucket: this.config.bucketName,
      key: uuidv4(),
      body: file,
      contentType: options.contentType,
    };

    const response = await this.r2Client.put(params);
    if (response.status !== 200) {
      throw new Error('Failed to upload file to R2');
    }

    const signedUrl = await this.getSignedUrlForR2(params.key, options.expires);
    return signedUrl;
  }

  async getSignedUrlForR2(key: string, expires: number): Promise<string> {
    const params = {
      bucket: this.config.bucketName,
      key: key,
    };

    const signedUrl = await this.r2Client.getSignedUrl(params, {
      expiresIn: expires,
    });

    return signedUrl;
  }
}

export { S3Storage, S3StorageConfig, S3StorageOptions };
// src/lib/s3-storage.ts
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { CloudflareR2 } from '@cloudflare/r2';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface S3StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  cloudflareAccountId: string;
  cloudflareApiKey: string;
}

interface S3File {
  key: string;
  bucket: string;
  expires: number;
}

class S3Storage {
  private s3Client: S3Client;
  private cloudflareR2: CloudflareR2;
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
    this.cloudflareR2 = new CloudflareR2({
      accountId: config.cloudflareAccountId,
      apiKey: config.cloudflareApiKey,
    });
  }

  async uploadFile(file: Buffer, fileName: string): Promise<S3File> {
    const params = {
      Bucket: this.config.bucketName,
      Key: fileName,
      Body: file,
    };

    const data = await this.s3Client.putObject(params);
    return {
      key: fileName,
      bucket: this.config.bucketName,
      expires: 3600, // 1 hour
    };
  }

  async getSignedUrl(file: S3File): Promise<string> {
    const params = {
      Bucket: file.bucket,
      Key: file.key,
      Expires: file.expires,
    };

    const command = new AWS.S3.GetObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3Client, command);
    return signedUrl;
  }

  async uploadFileToCloudflareR2(file: Buffer, fileName: string): Promise<S3File> {
    const params = {
      bucket: this.config.bucketName,
      key: fileName,
      body: file,
    };

    const data = await this.cloudflareR2.put(params);
    return {
      key: fileName,
      bucket: this.config.bucketName,
      expires: 3600, // 1 hour
    };
  }

  async getSignedUrlFromCloudflareR2(file: S3File): Promise<string> {
    const params = {
      bucket: file.bucket,
      key: file.key,
      expires: file.expires,
    };

    const signedUrl = await this.cloudflareR2.getSignedUrl(params);
    return signedUrl;
  }
}

export { S3Storage, S3StorageConfig, S3File };
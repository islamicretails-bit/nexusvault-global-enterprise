// src/lib/s3-storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

interface S3StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

interface S3StorageOptions {
  expires: number;
  contentType: string;
}

class S3Storage {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(config: S3StorageConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
  }

  async createBucket(): Promise<void> {
    try {
      const command = new CreateBucketCommand({
        Bucket: this.bucketName,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(error);
    }
  }

  async uploadFile(file: Buffer, options: S3StorageOptions): Promise<string> {
    try {
      const fileName = `${uuidv4()}.${options.contentType.split('/')[1]}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file,
        ContentType: options.contentType,
      });
      await this.s3Client.send(command);
      return fileName;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSignedUrl(fileName: string, options: S3StorageOptions): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: options.expires,
      });
      return signedUrl;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(error);
    }
  }
}

export default S3Storage;
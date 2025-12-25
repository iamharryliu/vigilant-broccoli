import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import {
  IBucketProvider,
  CloudflareBucketConfig,
  BucketFile,
} from '../bucket.models';
import { getEnvironmentVariable } from '../../utils';
import { promises as fs } from 'fs';
import { Readable } from 'stream';

export class CloudflareBucketProvider implements IBucketProvider {
  private client: S3Client;
  private bucketName: string;
  private bucketInitialized = false;

  constructor(config?: CloudflareBucketConfig) {
    const accountId =
      config?.accountId || getEnvironmentVariable('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId =
      config?.accessKeyId || getEnvironmentVariable('CLOUDFLARE_ACCESS_KEY_ID');
    const secretAccessKey =
      config?.secretAccessKey ||
      getEnvironmentVariable('CLOUDFLARE_SECRET_ACCESS_KEY');
    this.bucketName =
      config?.bucketName || getEnvironmentVariable('CLOUDFLARE_BUCKET_NAME');
    if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
      console.error('CloudflareBucketProvider is not configured properly.');
      throw new Error('Missing Cloudflare R2 configuration');
    }

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // Ensure bucket exists, create if it doesn't
  private async ensureBucketExists(): Promise<void> {
    if (this.bucketInitialized) {
      return;
    }

    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: this.bucketName,
        }),
      );
      this.bucketInitialized = true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.Code === 'NoSuchBucket') {
        // Bucket doesn't exist, create it
        await this.client.send(
          new CreateBucketCommand({
            Bucket: this.bucketName,
          }),
        );
        this.bucketInitialized = true;
      } else {
        throw error;
      }
    }
  }

  async upload(destinationName: string, buffer: Buffer): Promise<void> {
    await this.ensureBucketExists();
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: destinationName,
        Body: buffer,
      }),
    );
  }

  async download(fileName: string, destinationPath: string): Promise<void> {
    await this.ensureBucketExists();
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      }),
    );

    if (!response.Body) {
      throw new Error(`File ${fileName} not found`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile(destinationPath, buffer);
  }

  async delete(fileName: string): Promise<void> {
    await this.ensureBucketExists();
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      }),
    );
  }

  async list(): Promise<BucketFile[]> {
    await this.ensureBucketExists();
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
      }),
    );

    return (
      response.Contents?.map(item => ({
        name: item.Key || '',
        size: item.Size,
        updatedAt: item.LastModified,
      })) || []
    );
  }

  async exists(fileName: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async read(fileName: string): Promise<Buffer> {
    await this.ensureBucketExists();
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      }),
    );

    if (!response.Body) {
      throw new Error(`File ${fileName} not found`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}

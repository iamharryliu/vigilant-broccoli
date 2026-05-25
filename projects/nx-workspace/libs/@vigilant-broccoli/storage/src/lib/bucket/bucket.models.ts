export enum BucketProvider {
  LOCAL = 'local',
  CLOUDFLARE_R2 = 'cloudflare-r2',
  AWS_S3 = 'aws-s3',
  GOOGLE_CLOUD_STORAGE = 'gcs',
}

export interface LocalBucketConfig {
  bucketName?: string;
}

export interface CloudflareBucketConfig {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
}

export interface AwsBucketConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
}

export interface GcsBucketConfig {
  projectId?: string;
  bucketName?: string;
  keyFilePath?: string;
}

export type BucketConfig =
  | LocalBucketConfig
  | CloudflareBucketConfig
  | AwsBucketConfig
  | GcsBucketConfig;

export interface BucketFile {
  name: string;
  size?: number;
  updatedAt?: Date;
}

export interface IBucketProvider {
  upload(destinationName: string, buffer: Buffer): Promise<void>;
  download(fileName: string, destinationPath: string): Promise<void>;
  delete(fileName: string): Promise<void>;
  list(): Promise<BucketFile[]>;
  exists(fileName: string): Promise<boolean>;
  read(fileName: string): Promise<Buffer>;
}

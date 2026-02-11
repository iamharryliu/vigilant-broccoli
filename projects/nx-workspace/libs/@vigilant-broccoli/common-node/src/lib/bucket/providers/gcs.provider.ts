import { Storage, Bucket } from '@google-cloud/storage';
import { IBucketProvider, GcsBucketConfig, BucketFile } from '../bucket.models';
import { getEnvironmentVariable } from '../../utils';

export class GcsBucketProvider implements IBucketProvider {
  private storage: Storage;
  private bucket: Bucket;
  private bucketName: string;

  constructor(config?: GcsBucketConfig) {
    const projectId =
      config?.projectId || getEnvironmentVariable('GCS_PROJECT_ID');
    this.bucketName =
      config?.bucketName || getEnvironmentVariable('GCS_BUCKET_NAME');
    const keyFilePath =
      config?.keyFilePath ||
      getEnvironmentVariable('GCS_KEY_FILE_PATH') ||
      getEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS');

    if (!projectId || !this.bucketName) {
      console.error('GcsBucketProvider is not configured properly.');
      throw new Error('Missing Google Cloud Storage configuration');
    }

    const storageOptions: { projectId: string; keyFilename?: string } = {
      projectId,
    };
    if (keyFilePath) {
      storageOptions.keyFilename = keyFilePath;
    }

    this.storage = new Storage(storageOptions);
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async upload(destinationName: string, buffer: Buffer): Promise<void> {
    const file = this.bucket.file(destinationName);
    await file.save(buffer);
  }

  async download(fileName: string, destinationPath: string): Promise<void> {
    const file = this.bucket.file(fileName);
    await file.download({ destination: destinationPath });
  }

  async delete(fileName: string): Promise<void> {
    const file = this.bucket.file(fileName);
    await file.delete();
  }

  async list(): Promise<BucketFile[]> {
    const [files] = await this.bucket.getFiles();
    return files.map(file => ({
      name: file.name,
      size: file.metadata.size
        ? parseInt(file.metadata.size as string, 10)
        : undefined,
      updatedAt: file.metadata.updated
        ? new Date(file.metadata.updated)
        : undefined,
    }));
  }

  async exists(fileName: string): Promise<boolean> {
    const file = this.bucket.file(fileName);
    const [exists] = await file.exists();
    return exists;
  }

  async read(fileName: string): Promise<Buffer> {
    const file = this.bucket.file(fileName);
    const [buffer] = await file.download();
    return buffer;
  }
}

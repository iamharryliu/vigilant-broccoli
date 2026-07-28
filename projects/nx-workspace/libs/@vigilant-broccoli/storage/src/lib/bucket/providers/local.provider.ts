import { promises as fs } from 'fs';
import * as path from 'path';
import {
  IBucketProvider,
  LocalBucketConfig,
  BucketFile,
} from '../bucket.models';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const DEFAULT_BUCKET_PATH = 'storage-buckets';

export class LocalBucketProvider implements IBucketProvider {
  private bucketPath: string;

  constructor(config?: LocalBucketConfig) {
    this.bucketPath =
      config?.bucketName ||
      getEnvironmentVariable('BUCKET_PATH') ||
      path.join(process.cwd(), DEFAULT_BUCKET_PATH);

    if (!this.bucketPath) {
      console.error('LocalBucketProvider: No bucket path configured.');
    }
  }

  async upload(destinationName: string, buffer: Buffer): Promise<void> {
    const destinationPath = this.resolveContainedPath(destinationName);
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.writeFile(destinationPath, buffer);
  }

  async download(fileName: string, destinationPath: string): Promise<void> {
    const sourcePath = this.resolveContainedPath(fileName);
    await fs.copyFile(sourcePath, destinationPath);
  }

  async delete(fileName: string): Promise<void> {
    const filePath = this.resolveContainedPath(fileName);
    await fs.unlink(filePath);
  }

  async list(): Promise<BucketFile[]> {
    try {
      const filePaths = await this.readDirRecursive(this.bucketPath);
      const filesWithStats = await Promise.all(
        filePaths.map(async filePath => {
          const stats = await fs.stat(filePath);
          return {
            name: path.relative(this.bucketPath, filePath),
            size: stats.size,
            updatedAt: stats.mtime,
          };
        }),
      );
      return filesWithStats;
    } catch (_error) {
      return [];
    }
  }

  async exists(fileName: string): Promise<boolean> {
    try {
      await fs.access(this.resolveContainedPath(fileName));
      return true;
    } catch {
      return false;
    }
  }

  async read(fileName: string): Promise<Buffer> {
    const filePath = this.resolveContainedPath(fileName);
    return await fs.readFile(filePath);
  }

  private resolveContainedPath(fileName: string): string {
    const bucketRoot = path.resolve(this.bucketPath);
    const resolved = path.resolve(bucketRoot, fileName);
    if (
      resolved !== bucketRoot &&
      !resolved.startsWith(bucketRoot + path.sep)
    ) {
      throw new Error(`Invalid file path: ${fileName}`);
    }
    return resolved;
  }

  private async readDirRecursive(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(entry => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory()
          ? this.readDirRecursive(fullPath)
          : [fullPath];
      }),
    );
    return files.flat();
  }
}

import {
  IBucketProvider,
  BucketProvider,
  BucketConfig,
  LocalBucketConfig,
  CloudflareBucketConfig,
  AwsBucketConfig,
  GcsBucketConfig,
} from './bucket.models';
import { LocalBucketProvider } from './providers/local.provider';
import { CloudflareBucketProvider } from './providers/cloudflare.provider';
import { AwsBucketProvider } from './providers/aws.provider';
import { GcsBucketProvider } from './providers/gcs.provider';

export const DEFAULT_BUCKET_PATH = 'storage-buckets';

export function createBucketService(
  provider: BucketProvider,
  config?: BucketConfig,
): IBucketProvider {
  const configWithDefaults = {
    ...config,
    bucketName: config?.bucketName ?? DEFAULT_BUCKET_PATH,
  };

  switch (provider) {
    case BucketProvider.LOCAL:
      return new LocalBucketProvider(configWithDefaults as LocalBucketConfig);

    case BucketProvider.CLOUDFLARE_R2:
      return new CloudflareBucketProvider(
        configWithDefaults as CloudflareBucketConfig,
      );

    case BucketProvider.AWS_S3:
      return new AwsBucketProvider(configWithDefaults as AwsBucketConfig);

    case BucketProvider.GOOGLE_CLOUD_STORAGE:
      return new GcsBucketProvider(configWithDefaults as GcsBucketConfig);

    default:
      throw new Error(`Unknown bucket provider: ${provider}`);
  }
}

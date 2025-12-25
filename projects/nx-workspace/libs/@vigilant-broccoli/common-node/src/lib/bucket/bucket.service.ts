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

export function createBucketService(
  provider: BucketProvider,
  config?: BucketConfig
): IBucketProvider {
  switch (provider) {
    case BucketProvider.LOCAL:
      return new LocalBucketProvider(config as LocalBucketConfig);

    case BucketProvider.CLOUDFLARE_R2:
      return new CloudflareBucketProvider(config as CloudflareBucketConfig);

    case BucketProvider.AWS_S3:
      return new AwsBucketProvider(config as AwsBucketConfig);

    case BucketProvider.GOOGLE_CLOUD_STORAGE:
      return new GcsBucketProvider(config as GcsBucketConfig);

    default:
      throw new Error(`Unknown bucket provider: ${provider}`);
  }
}

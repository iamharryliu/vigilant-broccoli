import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { swaggerSpec as bucketServiceSpec } from '../apps/api/bucket-service/src/libs/swagger';
import { swaggerSpec as emailServiceSpec } from '../apps/api/email-service/src/swagger';
import { swaggerSpec as emailSubscriptionServiceSpec } from '../apps/api/email-subscription-service/src/swagger';
import { swaggerSpec as llmServiceSpec } from '../apps/api/llm-service/src/libs/swagger';

const OUTPUT_DIR = 'apps/ui/pages-index/public/openapi';

const PRIVATE_SERVER_DESCRIPTION =
  'Private-only (Fly 6PN). Not reachable from a browser — tunnel with `flyctl proxy 3000:80 <app>.flycast -a <app>`.';

interface SpecEntry {
  slug: string;
  spec: Record<string, unknown>;
  publicUrl?: string;
}

const SPECS: SpecEntry[] = [
  { slug: 'email-service', spec: emailServiceSpec },
  { slug: 'email-subscription-service', spec: emailSubscriptionServiceSpec },
  { slug: 'llm-service', spec: llmServiceSpec },
  { slug: 'bucket-service', spec: bucketServiceSpec },
];

const withServers = ({ spec, publicUrl }: SpecEntry) => ({
  ...spec,
  servers: publicUrl
    ? [{ url: publicUrl }]
    : [
        {
          url: 'http://127.0.0.1:3000',
          description: PRIVATE_SERVER_DESCRIPTION,
        },
      ],
});

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const entry of SPECS) {
  const outputPath = join(OUTPUT_DIR, `${entry.slug}.json`);
  writeFileSync(outputPath, `${JSON.stringify(withServers(entry), null, 2)}\n`);
  console.log(`Wrote ${outputPath}`);
}

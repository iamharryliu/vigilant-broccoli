import { API_SERVICES_ROUTE } from './routes';

export interface ApiServiceInfo {
  slug: string;
  private: boolean;
}

export const API_SERVICES: ApiServiceInfo[] = [
  { slug: 'email-service', private: true },
  { slug: 'email-subscription-service', private: true },
  { slug: 'llm-service', private: true },
  { slug: 'bucket-service', private: true },
  { slug: 'media-service', private: false },
  { slug: 'employee-handler', private: true },
];

export const toApiServiceDocsHref = (slug: string) =>
  `${API_SERVICES_ROUTE}/${slug}`;

export const toSpecUrl = (slug: string) =>
  `${import.meta.env.BASE_URL}openapi/${slug}.json`;

export const findApiService = (slug?: string) =>
  API_SERVICES.find(service => service.slug === slug);

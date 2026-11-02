export interface RenderService {
  id: string;
  name: string;
  type: string;
  suspended: string;
  dashboardUrl: string;
  url: string | null;
}

export interface RenderServicesResponse {
  success: boolean;
  services?: RenderService[];
  authRequired?: boolean;
}

export const RENDER_SUSPENDED = 'suspended';
export const RENDER_DASHBOARD_URL = 'https://dashboard.render.com';

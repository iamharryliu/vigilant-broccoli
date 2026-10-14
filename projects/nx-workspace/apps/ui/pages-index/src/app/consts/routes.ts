export const STATUS_ROUTE = '/status';
export const CAREER_EXPERIENCE_ROUTE = '/personal-software-career-experience';
export const WEB_APPLICATIONS_ROUTE = '/web-applications';
export const toWebApplicationRoute = (id: string) =>
  `${WEB_APPLICATIONS_ROUTE}/${id}`;

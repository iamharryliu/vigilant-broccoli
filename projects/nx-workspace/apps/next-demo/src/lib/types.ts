export type Home = {
  id: number;
  name: string;
  description: string;
};

export const HOME_ROLE = {
  OWNER: 'HOME_OWNER',
  MEMBER: 'HOME_MEMBER',
  ADMIN: 'HOME_ADMIN',
} as const;

export type HomeRole = (typeof HOME_ROLE)[keyof typeof HOME_ROLE];

export type HomeMember = {
  id: string;
  email: string;
  status: 'pending' | 'accepted';
  role: HomeRole;
  createdAt: string;
};

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  allDay: boolean;
  color: string | null;
  googleEventId: string | null;
  leisureActivityId: string | null;
  projectId?: string | null;
  mealId?: string | null;
  homeId: number;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const LEISURE_CATEGORIES = [
  'Movies',
  'Shows',
  'Crafts',
  'Games',
  'Outdoors',
  'Music',
  'Books',
  'Other',
] as const;

export type LeisureCategory = (typeof LEISURE_CATEGORIES)[number];

export interface LeisureActivity {
  id: string;
  title: string;
  description: string | null;
  category: LeisureCategory;
  homeId: number;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const RESOURCE_CATEGORIES = [
  'Vehicle',
  'Room',
  'Equipment',
  'Electronics',
  'Furniture',
  'Tool',
  'Other',
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  category: ResourceCategory;
  quantity: number;
  homeId: number;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  homeId: number;
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdRule {
  id: string;
  name: string;
  description: string | null;
  position: number;
  homeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhereIsItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
}

export const DOC_CATEGORIES = [
  'Insurance',
  'Warranty',
  'Manual',
  'Contract',
  'Receipt',
  'Permit',
  'Photo',
  'Other',
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number];

export interface HomeDocFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

export interface HomeDoc {
  id: string;
  name: string;
  description: string | null;
  category: DocCategory;
  homeId: number;
  files: HomeDocFile[];
  createdAt: string;
  updatedAt: string;
}

export const MEAL_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Other',
] as const;

export type MealCategory = (typeof MEAL_CATEGORIES)[number];

export interface Meal {
  id: string;
  title: string;
  description: string | null;
  category: MealCategory;
  servings: number | null;
  homeId: number;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_CATEGORIES = [
  'Renovation',
  'Painting',
  'Furniture',
  'Plumbing',
  'Electrical',
  'Garden',
  'Cleaning',
  'Other',
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_STATUSES = ['Todo', 'In Progress', 'Done'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface HomeProject {
  id: string;
  title: string;
  description: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  homeId: number;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PriceEntry {
  id: string;
  price: number;
  store: string | null;
  purchasedAt: string;
  createdAt: string;
}

export interface PriceItem {
  id: string;
  name: string;
  category: string | null;
  unit: string | null;
  homeId: number;
  entries: PriceEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Whiteboard {
  content: string;
  homeId: number;
  updatedAt: string;
}

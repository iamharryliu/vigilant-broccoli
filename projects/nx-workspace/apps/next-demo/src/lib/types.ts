export type Home = {
  id: number;
  name: string;
  description: string;
};

export interface WhereIsItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
}

export type Service = {
  id: string;
  name: string;
};

export type Subscription = {
  id: string;
  serviceId: string;
  email: string;
};

export const ROUTES = {
  home: "/",
  create: "/create",
  history: "/history",
  account: "/account",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

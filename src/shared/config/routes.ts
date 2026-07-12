export const ROUTES = {
  home: "/",
  create: "/create",
  history: "/history",
  account: "/account",
  auth: "/auth",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

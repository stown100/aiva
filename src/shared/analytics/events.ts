export type AnalyticsEvent =
  | { name: "page_view"; props: { page: string } }
  | { name: "upload_started"; props?: never }
  | { name: "upload_completed"; props: { format: string; sizeBytes: number } }
  | { name: "style_selected"; props: { styleId: string } }
  | { name: "generation_started"; props: { styleId: string } }
  | { name: "generation_completed"; props: { styleId: string; versionNumber: number } }
  | { name: "generation_failed"; props: { styleId: string; errorCode: string } }
  | { name: "download_clicked"; props: { styleId: string } }
  | { name: "share_clicked"; props: { styleId: string } }
  | { name: "credit_exhausted"; props?: never }
  | { name: "subscription_clicked"; props?: never };

export type AnalyticsEventName = AnalyticsEvent["name"];

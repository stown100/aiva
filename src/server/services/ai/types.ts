import "server-only";

export type ImageTargetSize = "1024x1024" | "1536x1024" | "1024x1536";

export interface ImageTransformInput {
  image: Buffer;
  mimeType: string;
  prompt: string;
  targetSize: ImageTargetSize;
}

/**
 * Abstraction over the image AI vendor so the generation service never
 * depends on OpenAI directly (swap/AB-test providers without touching it).
 */
export interface ImageAiProvider {
  transform(input: ImageTransformInput): Promise<Buffer>;
}

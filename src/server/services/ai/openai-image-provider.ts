import "server-only";

import OpenAI, { toFile } from "openai";

import { getServerEnv } from "../../lib/env";
import type { ImageAiProvider, ImageTransformInput } from "./types";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  client ??= new OpenAI({ apiKey: getServerEnv().OPENAI_API_KEY });
  return client;
}

export const openAiImageProvider: ImageAiProvider = {
  async transform({ image, mimeType, prompt, targetSize }: ImageTransformInput): Promise<Buffer> {
    const { OPENAI_IMAGE_MODEL, OPENAI_IMAGE_QUALITY } = getServerEnv();
    const file = await toFile(image, "photo.jpg", { type: mimeType });

    const response = await getClient().images.edit({
      model: OPENAI_IMAGE_MODEL,
      image: file,
      prompt,
      size: targetSize,
      quality: OPENAI_IMAGE_QUALITY,
      n: 1,
    });

    const base64 = response.data?.[0]?.b64_json;
    if (!base64) {
      throw new Error("image edit returned no data");
    }
    return Buffer.from(base64, "base64");
  },
};

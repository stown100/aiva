export type { GenerationDetail, GenerationStatus, GenerationVariant, HistoryItem } from "./types";
export {
  fetchGeneration,
  fetchHistory,
  requestNewVariant,
  startGeneration,
} from "./api/generation-api";

type MessageTree = { [key: string]: string | MessageTree };

/**
 * Non-default locales are merged over the English dictionary, so a partially
 * translated locale gracefully falls back to English per key instead of
 * crashing on a missing message.
 */
export function mergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = result[key];
    if (typeof value === "object" && typeof baseValue === "object") {
      result[key] = mergeMessages(baseValue, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

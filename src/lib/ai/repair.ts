import "server-only";

export async function withOneRepairAttempt<T>(options: {
  generate: (repair: boolean, failure: unknown) => Promise<T>;
  isRepairable: (error: unknown) => boolean;
}): Promise<T> {
  try {
    return await options.generate(false, null);
  } catch (error) {
    if (!options.isRepairable(error)) {
      throw error;
    }

    return options.generate(true, error);
  }
}

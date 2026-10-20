interface Identifiable {
  id: string;
}

export const createFinder =
  <T extends Identifiable>(collection: readonly T[]) =>
  (id: string): T | undefined =>
    collection.find((item) => item.id === id);

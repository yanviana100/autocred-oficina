/**
 * Camada de persistência via localStorage.
 * Interface idêntica ao que será substituído por Supabase no futuro.
 */

function getCollection<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function saveCollection<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Generic CRUD ─────────────────────────────────────────────────────────────

export interface StoreCollection<T extends { id: string }> {
  list(): T[];
  get(id: string): T | undefined;
  create(data: Record<string, unknown>): T;
  update(id: string, data: Partial<T>): T | null;
  remove(id: string): boolean;
  seed(items: T[]): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStore<T extends { id: string; createdAt?: string }>(
  key: string,
  prefix: string,
  seedData?: T[]
): StoreCollection<T> {
  // Seed once if collection is empty
  if (typeof window !== "undefined" && seedData) {
    const existing = getCollection<T>(key);
    if (existing.length === 0) {
      saveCollection(key, seedData);
    }
  }

  return {
    list() {
      return getCollection<T>(key);
    },
    get(id: string) {
      return getCollection<T>(key).find((item) => item.id === id);
    },
    create(data) {
      const items = getCollection<T>(key);
      const newItem = {
        ...data,
        id: generateId(prefix),
        createdAt: (data as { createdAt?: string }).createdAt ?? nowISO(),
      } as unknown as T;
      saveCollection(key, [...items, newItem]);
      return newItem;
    },
    update(id, data) {
      const items = getCollection<T>(key);
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      const updated = { ...items[idx], ...data } as T;
      items[idx] = updated;
      saveCollection(key, items);
      return updated;
    },
    remove(id) {
      const items = getCollection<T>(key);
      const filtered = items.filter((i) => i.id !== id);
      if (filtered.length === items.length) return false;
      saveCollection(key, filtered);
      return true;
    },
    seed(items: T[]) {
      saveCollection(key, items);
    },
  };
}

// ─── OS number generator ───────────────────────────────────────────────────────

export function nextOsNumber(): string {
  if (typeof window === "undefined") return "OS-0001";
  const current = Number(localStorage.getItem("os_counter") ?? "0") + 1;
  localStorage.setItem("os_counter", String(current));
  return `OS-${String(current).padStart(4, "0")}`;
}

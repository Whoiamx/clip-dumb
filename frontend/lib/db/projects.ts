import { openDB, type IDBPDatabase } from "idb";
import type { Project } from "@/lib/types/project";

const DB_NAME = "clipdub";
const DB_VERSION = 1;
const STORE_NAME = "projects";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, project);
}

function migrateProject(p: Project): Project {
  return {
    ...p,
    type: p.type ?? "tutorial",
    chapters: p.chapters ?? [],
    subtitles: (p.subtitles ?? []).map((s) => ({
      ...s,
      style: {
        ...s.style,
        textAlign: s.style.textAlign ?? "center",
        outlineColor: s.style.outlineColor ?? "#000000",
        outlineWidth: s.style.outlineWidth ?? 0,
      },
    })),
  };
}

export async function loadProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  const p = await db.get(STORE_NAME, id);
  return p ? migrateProject(p) : undefined;
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAll(STORE_NAME);
  return projects.map(migrateProject);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

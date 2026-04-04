import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

const WHERE_IS_DIR = resolve(homedir(), 'Desktop/where-is');
const DB_PATH = resolve(WHERE_IS_DIR, 'where-is.db');
const IMAGES_DIR = resolve(WHERE_IS_DIR, 'images');

export const getImagesDir = () => IMAGES_DIR;

let _db: Database.Database | null = null;

const getDb = (): Database.Database => {
  if (_db) return _db;

  if (!existsSync(WHERE_IS_DIR)) mkdirSync(WHERE_IS_DIR, { recursive: true });
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma('foreign_keys = ON');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS item_images (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  return _db;
};

export interface DbItem {
  id: string;
  title: string;
  description: string;
  tags: string;
  created_at: string;
}

export interface DbImage {
  id: string;
  item_id: string;
  filename: string;
  mime_type: string;
  sort_order: number;
}

export const db = {
  getAll: (): DbItem[] =>
    getDb()
      .prepare('SELECT * FROM items ORDER BY created_at DESC')
      .all() as DbItem[],

  insert: (item: DbItem): void => {
    getDb()
      .prepare(
        'INSERT INTO items (id, title, description, tags, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(item.id, item.title, item.description, item.tags, item.created_at);
  },

  delete: (id: string): void => {
    getDb().prepare('DELETE FROM items WHERE id = ?').run(id);
  },

  getById: (id: string): DbItem | undefined =>
    getDb().prepare('SELECT * FROM items WHERE id = ?').get(id) as
      | DbItem
      | undefined,

  insertImage: (image: DbImage): void => {
    getDb()
      .prepare(
        'INSERT INTO item_images (id, item_id, filename, mime_type, sort_order) VALUES (?, ?, ?, ?, ?)',
      )
      .run(
        image.id,
        image.item_id,
        image.filename,
        image.mime_type,
        image.sort_order,
      );
  },

  getImages: (itemId: string): DbImage[] =>
    getDb()
      .prepare(
        'SELECT * FROM item_images WHERE item_id = ? ORDER BY sort_order ASC',
      )
      .all(itemId) as DbImage[],

  getImageById: (imageId: string): DbImage | undefined =>
    getDb().prepare('SELECT * FROM item_images WHERE id = ?').get(imageId) as
      | DbImage
      | undefined,

  deleteImages: (itemId: string): DbImage[] => {
    const images = getDb()
      .prepare('SELECT * FROM item_images WHERE item_id = ?')
      .all(itemId) as DbImage[];
    getDb().prepare('DELETE FROM item_images WHERE item_id = ?').run(itemId);
    return images;
  },
};

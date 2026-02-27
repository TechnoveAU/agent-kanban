import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), '.db');
const DB_PATH = path.join(DB_DIR, 'kanban.db');

// Ensure the .db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initSchema(_db);
  seedIfEmpty(_db);

  return _db;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id            TEXT    PRIMARY KEY,
      title         TEXT    NOT NULL,
      description   TEXT    NOT NULL,
      status        TEXT    NOT NULL CHECK(status IN ('backlog','todo','in_progress','pending','done')),
      priority      TEXT    NOT NULL CHECK(priority IN ('low','medium','high')),
      tags          TEXT    NOT NULL DEFAULT '[]',
      comment_count INTEGER NOT NULL DEFAULT 0,
      time_estimate TEXT    NOT NULL DEFAULT '',
      assignee_name   TEXT,
      assignee_avatar TEXT,
      agent_id        TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration: add agent_id if the table already existed without it
  const cols = db.prepare('PRAGMA table_info(tasks)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'agent_id')) {
    db.exec('ALTER TABLE tasks ADD COLUMN agent_id TEXT');
  }
}

// ---------------------------------------------------------------------------
// Seed data (only runs when the table is empty)
// ---------------------------------------------------------------------------
const SEED_TASKS = [
  {
    id: '1',
    title: 'LLM Fine-tuning',
    description: 'Optimize the core reasoning engine for better performance',
    status: 'backlog',
    priority: 'high',
    tags: JSON.stringify(['AI', 'ML']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'John Doe',
    assignee_avatar: 'https://i.pravatar.cc/24?img=1',
  },
  {
    id: '2',
    title: 'Edge Case Mapping',
    description: 'Identify scenarios where standard heuristics fail in edge cases',
    status: 'backlog',
    priority: 'medium',
    tags: JSON.stringify(['Research']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Jane Smith',
    assignee_avatar: 'https://i.pravatar.cc/24?img=2',
  },
  {
    id: '3',
    title: 'API Authentication',
    description: 'Implement OAuth2 flow for third-party integration',
    status: 'todo',
    priority: 'high',
    tags: JSON.stringify(['Security', 'Infra']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Mike Johnson',
    assignee_avatar: 'https://i.pravatar.cc/24?img=3',
  },
  {
    id: '4',
    title: 'UI Components',
    description: 'Build responsive chart widgets for the main dashboard',
    status: 'todo',
    priority: 'low',
    tags: JSON.stringify(['Frontend']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Emily White',
    assignee_avatar: 'https://i.pravatar.cc/24?img=4',
  },
  {
    id: '5',
    title: 'Database Schema',
    description: 'Refactor migration scripts for the new agent history tracking',
    status: 'todo',
    priority: 'medium',
    tags: JSON.stringify(['DB']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'David Lee',
    assignee_avatar: 'https://i.pravatar.cc/24?img=5',
  },
  {
    id: '6',
    title: 'Workflow Engine',
    description: 'Debugging the agentic step-function execution system',
    status: 'in_progress',
    priority: 'high',
    tags: JSON.stringify(['Backend']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Sarah Blue',
    assignee_avatar: 'https://i.pravatar.cc/24?img=6',
  },
  {
    id: '7',
    title: 'Agent Personality',
    description: 'Adjusting the prompt temperature and voice for different agents',
    status: 'in_progress',
    priority: 'medium',
    tags: JSON.stringify(['Design', 'AI']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Alex Chen',
    assignee_avatar: 'https://i.pravatar.cc/24?img=7',
  },
  {
    id: '8',
    title: 'Data Export',
    description: 'Finalizing the CSV/JSON export functionality for reports',
    status: 'pending',
    priority: 'low',
    tags: JSON.stringify(['Backend']),
    comment_count: 2,
    time_estimate: '2d',
    assignee_name: 'Tom Wilson',
    assignee_avatar: 'https://i.pravatar.cc/24?img=8',
  },
  {
    id: '9',
    title: 'Slack Integration',
    description: 'Initial webhook setup for critical health alerts from agents',
    status: 'done',
    priority: 'high',
    tags: JSON.stringify(['Integrations']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Lisa Anderson',
    assignee_avatar: 'https://i.pravatar.cc/24?img=9',
  },
  {
    id: '10',
    title: 'Onboarding Flow',
    description: 'Interactive tutorial for first-time workspace setup',
    status: 'done',
    priority: 'medium',
    tags: JSON.stringify(['UX']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Chris Martin',
    assignee_avatar: 'https://i.pravatar.cc/24?img=10',
  },
  {
    id: '11',
    title: 'Vector DB',
    description: 'Migration to Pinecone for faster embedding retrieval',
    status: 'done',
    priority: 'high',
    tags: JSON.stringify(['AI', 'Infra']),
    comment_count: 3,
    time_estimate: '2d',
    assignee_name: 'Rachel Green',
    assignee_avatar: 'https://i.pravatar.cc/24?img=11',
  },
];

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as n FROM tasks').get() as { n: number }).n;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO tasks
      (id, title, description, status, priority, tags, comment_count, time_estimate, assignee_name, assignee_avatar)
    VALUES
      (@id, @title, @description, @status, @priority, @tags, @comment_count, @time_estimate, @assignee_name, @assignee_avatar)
  `);

  const insertMany = db.transaction((tasks: typeof SEED_TASKS) => {
    for (const task of tasks) insert.run(task);
  });

  insertMany(SEED_TASKS);
}

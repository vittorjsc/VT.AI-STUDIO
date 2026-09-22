-- VT.AI Local Knowledge Base / esquema de referência 0.2.0
-- SQLite. Use migrations versionadas; não execute este arquivo sobre uma base existente sem backup.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  niche TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  profile_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS client_preferences (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK(scope IN ('brand','campaign','piece')),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  piece_id TEXT REFERENCES pieces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  approved INTEGER NOT NULL DEFAULT 0 CHECK(approved IN (0,1)),
  source_piece_id TEXT REFERENCES pieces(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (scope='brand' AND project_id IS NULL AND piece_id IS NULL) OR
    (scope='campaign' AND project_id IS NOT NULL AND piece_id IS NULL) OR
    (scope='piece' AND project_id IS NOT NULL AND piece_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS pref_brand_key ON client_preferences(client_id,key) WHERE scope='brand';
CREATE UNIQUE INDEX IF NOT EXISTS pref_campaign_key ON client_preferences(client_id,project_id,key) WHERE scope='campaign';
CREATE UNIQUE INDEX IF NOT EXISTS pref_piece_key ON client_preferences(client_id,project_id,piece_id,key) WHERE scope='piece';

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'campaign',
  status TEXT NOT NULL DEFAULT 'idea',
  objective TEXT,
  briefing_json TEXT NOT NULL DEFAULT '{}',
  direction_json TEXT NOT NULL DEFAULT '{}',
  due_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  summary TEXT NOT NULL DEFAULT '',
  last_action TEXT,
  next_action TEXT,
  state_json TEXT NOT NULL DEFAULT '{}',
  opened_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  path TEXT NOT NULL,
  sha256 TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  license_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','assistant','note')),
  body TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  scene_json TEXT NOT NULL,
  fields_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pieces (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  format TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  variables_json TEXT NOT NULL DEFAULT '{}',
  template_id TEXT REFERENCES templates(id) ON DELETE RESTRICT,
  current_revision_id TEXT REFERENCES revisions(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS revisions (
  id TEXT PRIMARY KEY,
  piece_id TEXT NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  source_path TEXT,
  preview_path TEXT,
  output_path TEXT,
  change_summary TEXT,
  qa_json TEXT NOT NULL DEFAULT '{}',
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(piece_id, version)
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  piece_id TEXT REFERENCES pieces(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  input_json TEXT NOT NULL DEFAULT '{}',
  output_json TEXT NOT NULL DEFAULT '{}',
  error_text TEXT,
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT,
  source_type TEXT NOT NULL,
  confidence TEXT NOT NULL,
  version TEXT,
  sha256 TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  imported_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  heading TEXT,
  body TEXT NOT NULL,
  ordinal INTEGER NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  source_locator TEXT,
  created_at TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  heading,
  body,
  tags,
  content='chunks',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
  INSERT INTO chunks_fts(rowid, heading, body, tags)
  VALUES (new.rowid, new.heading, new.body, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, heading, body, tags)
  VALUES ('delete', old.rowid, old.heading, old.body, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS chunks_au AFTER UPDATE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, heading, body, tags)
  VALUES ('delete', old.rowid, old.heading, old.body, old.tags);
  INSERT INTO chunks_fts(rowid, heading, body, tags)
  VALUES (new.rowid, new.heading, new.body, new.tags);
END;

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  piece_id TEXT REFERENCES pieces(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  decision TEXT NOT NULL,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  locator TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_pieces_project ON pieces(project_id);
CREATE INDEX IF NOT EXISTS idx_revisions_piece ON revisions(piece_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_messages_session ON session_messages(session_id);

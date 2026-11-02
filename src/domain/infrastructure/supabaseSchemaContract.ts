/**
 * EDITORYNIQ™ SUPABASE INFRASTRUCTURE SCHEMA CONTRACT
 * Production-grade idempotent PostgreSQL schema migration with strict Row-Level Security (RLS).
 * Enforces zero anonymous multi-user writes, author ownership isolation, and immutable audit trails.
 */

export const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- EDITORYNIQ™ ENTERPRISE DATABASE SCHEMA CONTRACT
-- Target Engine: Supabase / PostgreSQL 15+
-- Specification: ADN V100 · PROM 8 Infrastructure Authority
-- Security Model: Strict Row-Level Security (RLS) · Zero Anonymous Writes
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE book_language AS ENUM ('en', 'es');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE edition_type AS ENUM (
    'FIRST_EDITION', 'REVISED_EDITION', 'SPECIAL_EDITION',
    'TRANSLATION_EDITION', 'PAPERBACK_STANDARD', 'HARDCOVER_COLLECTOR', 'DIGITAL_EBOOK'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rights_status AS ENUM (
    'ALL_OWNED', 'LICENSED_CREATIVE_COMMONS', 'PUBLIC_DOMAIN', 'REQUIRES_PERMIT', 'UNVERIFIED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SUSPENDED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROJECTS (E1 Intake & Master Records)
CREATE TABLE IF NOT EXISTS public.book_projects (
  id VARCHAR(64) PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author_notes TEXT,
  description TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  target_audience VARCHAR(64) NOT NULL,
  production_language book_language NOT NULL DEFAULT 'en',
  target_page_count INTEGER NOT NULL DEFAULT 250,
  estimated_words INTEGER NOT NULL DEFAULT 62500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BLUEPRINT SNAPSHOTS (E1 Book Intelligence Authority)
CREATE TABLE IF NOT EXISTS public.blueprint_snapshots (
  snapshot_id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  chapters_payload JSONB NOT NULL,
  total_chapters INTEGER NOT NULL,
  total_budget_pages INTEGER NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MANUSCRIPT VERSIONS & CHUNKS (E2 Manuscript Factory)
CREATE TABLE IF NOT EXISTS public.manuscript_versions (
  version_id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  chapter_id VARCHAR(64) NOT NULL,
  version_number INTEGER NOT NULL,
  content_markdown TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VISUAL ASSETS (E3 Visual Production)
CREATE TABLE IF NOT EXISTS public.visual_assets (
  asset_id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  chapter_id VARCHAR(64),
  asset_type VARCHAR(32) NOT NULL,
  title TEXT NOT NULL,
  mime_type VARCHAR(64) NOT NULL,
  svg_content TEXT,
  storage_path TEXT,
  sha256_hash VARCHAR(64) NOT NULL,
  rights_status rights_status NOT NULL DEFAULT 'ALL_OWNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EDITORIAL EDITIONS & PASSPORTS (E4 Editorial & Quality)
CREATE TABLE IF NOT EXISTS public.editorial_editions (
  edition_id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  edition_name TEXT NOT NULL,
  pdf_actual_pages INTEGER NOT NULL,
  epub_valid BOOLEAN NOT NULL DEFAULT FALSE,
  is_press_ready BOOLEAN NOT NULL DEFAULT FALSE,
  quality_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  passport_sha256 VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PUBLISHING EDITIONS & METADATA (E5 Publishing & Distribution)
CREATE TABLE IF NOT EXISTS public.publishing_editions (
  id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  edition_name TEXT NOT NULL,
  edition_type edition_type NOT NULL DEFAULT 'FIRST_EDITION',
  version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
  production_language book_language NOT NULL DEFAULT 'en',
  author_name TEXT NOT NULL,
  publisher_imprint TEXT NOT NULL,
  isbn13 VARCHAR(17),
  rights_status rights_status NOT NULL DEFAULT 'ALL_OWNED',
  rights_evidence TEXT,
  territory_scope VARCHAR(32) NOT NULL DEFAULT 'WORLDWIDE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.publication_packages (
  package_id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  edition_id VARCHAR(64) NOT NULL REFERENCES public.publishing_editions(id) ON DELETE CASCADE,
  target_channel VARCHAR(32) NOT NULL,
  manifest_sha256 VARCHAR(64) NOT NULL,
  zip_sha256 VARCHAR(64),
  zip_size_bytes BIGINT,
  storage_url TEXT,
  readiness_status VARCHAR(32) NOT NULL DEFAULT 'READY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LOCAL INTEGRITY LEDGER (E5 Traceability)
CREATE TABLE IF NOT EXISTS public.submission_ledger (
  event_id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  edition_id VARCHAR(64) NOT NULL,
  channel_id VARCHAR(32) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  actor VARCHAR(32) NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sha256_evidence VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. MARKETPLACE LISTINGS & COMMERCE (E6 Marketplace & Commerce)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id VARCHAR(64) PRIMARY KEY,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  edition_id VARCHAR(64) NOT NULL REFERENCES public.publishing_editions(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  language book_language NOT NULL DEFAULT 'en',
  category VARCHAR(64) NOT NULL,
  formats TEXT[] NOT NULL DEFAULT ARRAY['PDF'],
  listing_status listing_status NOT NULL DEFAULT 'DRAFT',
  price_cents INTEGER NOT NULL DEFAULT 999,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  scope VARCHAR(32) NOT NULL DEFAULT 'LOCAL_WORKSPACE_CATALOG',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.buyer_entitlements (
  id VARCHAR(64) PRIMARY KEY,
  listing_id VARCHAR(64) NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  edition_id VARCHAR(64) NOT NULL REFERENCES public.publishing_editions(id) ON DELETE CASCADE,
  book_id VARCHAR(64) NOT NULL REFERENCES public.book_projects(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  format_granted VARCHAR(16) NOT NULL,
  version_granted VARCHAR(32) NOT NULL,
  evidence_sha256 VARCHAR(64) NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.book_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscript_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_entitlements ENABLE ROW LEVEL SECURITY;

-- 1. Authors have full control over their own book projects
CREATE POLICY "Authors can view own projects"
  ON public.book_projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Authors can insert own projects"
  ON public.book_projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Authors can update own projects"
  ON public.book_projects FOR UPDATE
  USING (auth.uid() = owner_id);

-- 2. Editorial sub-artifacts bound to book project owner
CREATE POLICY "Authors access own blueprint snapshots"
  ON public.blueprint_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

CREATE POLICY "Authors access own manuscript versions"
  ON public.manuscript_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

CREATE POLICY "Authors access own visual assets"
  ON public.visual_assets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

CREATE POLICY "Authors access own editorial editions"
  ON public.editorial_editions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

CREATE POLICY "Authors access own publishing editions"
  ON public.publishing_editions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

CREATE POLICY "Authors access own packages"
  ON public.publication_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

CREATE POLICY "Authors access own ledger"
  ON public.submission_ledger FOR ALL
  USING (EXISTS (SELECT 1 FROM public.book_projects p WHERE p.id = book_id AND p.owner_id = auth.uid()));

-- 3. Marketplace listings: Public can read APPROVED, Sellers manage own
CREATE POLICY "Public can view approved listings"
  ON public.marketplace_listings FOR SELECT
  USING (listing_status = 'APPROVED');

CREATE POLICY "Sellers can manage own listings"
  ON public.marketplace_listings FOR ALL
  USING (auth.uid() = seller_id);

-- 4. Buyer Entitlements: Buyers can only access their verified entitlements
CREATE POLICY "Buyers view own verified entitlements"
  ON public.buyer_entitlements FOR SELECT
  USING (auth.uid() = buyer_id);

-- Zero anonymous multi-user write permissions across all tables.

-- ====================================================================
-- PRIVATE STORAGE BUCKETS & STRICT OWNERSHIP STORAGE RLS POLICIES
-- ====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('manuscripts', 'manuscripts', false, 52428800, ARRAY['text/markdown', 'text/plain', 'application/json']),
  ('visual-assets', 'visual-assets', false, 104857600, ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']),
  ('editorial-packages', 'editorial-packages', false, 209715200, ARRAY['application/pdf', 'application/epub+zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('publishing-deliverables', 'publishing-deliverables', false, 209715200, ARRAY['application/zip', 'application/pdf', 'application/epub+zip', 'text/xml', 'application/json'])
ON CONFLICT (id) DO NOTHING;

-- Drop legacy/overly-permissive storage policies if present
DROP POLICY IF EXISTS "Authenticated users manage own manuscript files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users manage own visual asset files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users manage own editorial package files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users manage own publishing deliverable files" ON storage.objects;
DROP POLICY IF EXISTS "Owner select storage files" ON storage.objects;
DROP POLICY IF EXISTS "Owner insert storage files" ON storage.objects;
DROP POLICY IF EXISTS "Owner update storage files" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete storage files" ON storage.objects;

-- 1. SELECT: Authenticated non-anonymous owners can read files in their folder path (USER_ID/BOOK_ID/FILE)
CREATE POLICY "Owner select storage files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('manuscripts', 'visual-assets', 'editorial-packages', 'publishing-deliverables')
    AND auth.uid() IS NOT NULL
    AND (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. INSERT: Authenticated non-anonymous owners can upload files into their folder path
CREATE POLICY "Owner insert storage files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('manuscripts', 'visual-assets', 'editorial-packages', 'publishing-deliverables')
    AND auth.uid() IS NOT NULL
    AND (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. UPDATE: Authenticated non-anonymous owners can update files in their folder path
CREATE POLICY "Owner update storage files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('manuscripts', 'visual-assets', 'editorial-packages', 'publishing-deliverables')
    AND auth.uid() IS NOT NULL
    AND (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN ('manuscripts', 'visual-assets', 'editorial-packages', 'publishing-deliverables')
    AND auth.uid() IS NOT NULL
    AND (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. DELETE: Authenticated non-anonymous owners can delete files in their folder path
CREATE POLICY "Owner delete storage files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('manuscripts', 'visual-assets', 'editorial-packages', 'publishing-deliverables')
    AND auth.uid() IS NOT NULL
    AND (auth.jwt()->>'is_anonymous') IS DISTINCT FROM 'true'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
`;

/**
 * Downloads the idempotent SQL schema contract for deployment to Supabase SQL Editor.
 */
export function downloadSupabaseSchemaContract(): void {
  const blob = new Blob([SUPABASE_SCHEMA_SQL], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'editoryniq_supabase_schema_contract.sql';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

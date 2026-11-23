/**
 * Journal publishing store.
 *
 * The eight original dispatches are written in `journal.js` and ship with the
 * site. Everything the studio publishes from the admin is stored here, on top
 * of them, so the stock issue can never be damaged by an edit and a freshly
 * cloned copy of the site always has a journal in it.
 *
 * Storage shape (inside the reserved `journalPosts` key):
 *
 *   { drafts: Draft[], published: Draft[] }
 *
 * A draft is a complete post that is not on the site yet. A published post is
 * identical, plus a `slug` and `publishedAt`. Publishing moves a record from
 * one list to the other; unpublishing moves it back. That is why an editor can
 * take a piece down without losing a word of it.
 *
 * A post record mirrors the static article shape in `journal.js` closely
 * enough that one renderer handles both:
 *
 *   id, slug, title, eyebrow, subtitle, dek, author, role, date,
 *   image, caption, pullQuote, paragraphs[], sections[{heading, paragraphs[]}],
 *   sidebar{title, items[[term, value]]}, closeNote, status, updatedAt
 *
 * Images are data URLs produced by the studio's file picker, so a published
 * post is entirely self-contained and survives a page reload without a server.
 */

import {
  STORAGE_NAMESPACE,
  createId,
  emitChange,
  readJSON,
  safeMultiline,
  safeText,
  subscribe,
  writeJSON,
} from './storage.js'

// Fully namespaced, like every other key in `storage.js` — `readJSON` does not
// prefix for you, and a bare key silently reads nothing.
const KEY = `${STORAGE_NAMESPACE}journalPosts`
const MAX_IMAGE_CHARS = 3_400_000 // ~2.5 MB of base64 after the data-URL prefix
const MAX_BODY_CHARS = 60_000

export const JOURNAL_STRANDS = [
  { key: 'hearth', label: 'Hearth & Technique', raw: 'HEARTH & TECHNIQUE' },
  { key: 'hospitality', label: 'Hospitality & Rituals', raw: 'HOSPITALITY & RITUALS' },
  { key: 'terroir', label: 'Terroir & Producers', raw: 'TERROIR & PRODUCERS' },
  { key: 'living', label: 'Living Cellar', raw: 'LIVING CELLAR' },
]

const EMPTY = { drafts: [], published: [] }

/* ------------------------------------------------------------------ read */

function read() {
  const value = readJSON(KEY, null)
  if (!value || typeof value !== 'object') return { ...EMPTY }
  return {
    drafts: Array.isArray(value.drafts) ? value.drafts : [],
    published: Array.isArray(value.published) ? value.published : [],
  }
}

function write(next) {
  const written = writeJSON(KEY, next)
  if (written) emitChange('journalPosts', { value: next })
  return written
}

export function subscribeToJournalPosts(handler) {
  return subscribe((detail) => {
    if (detail.collection === 'journalPosts') handler(read())
  })
}

/** Every published post, newest first — this is what the public site renders. */
export function getPublishedPosts() {
  return read().published.filter((post) => post && post.slug).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
}

/** Every draft, most recently touched first — this is the studio workbench. */
export function getDraftPosts() {
  return read().drafts.filter(Boolean).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

export function getPostById(id) {
  const all = read()
  return [...all.drafts, ...all.published].find((post) => post && post.id === id) || null
}

export function findPublishedBySlug(slug) {
  return read().published.find((post) => post && post.slug === slug) || null
}

/* ----------------------------------------------------------------- write */

export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

/** Makes a slug unique against both published posts and every static dispatch. */
export function uniqueSlug(title, takenSlugs = [], currentId = null) {
  const base = slugify(title) || 'dispatch'
  const taken = new Set(
    [...read().published, ...read().drafts]
      .filter((post) => post && post.id !== currentId)
      .map((post) => post.slug)
      .filter(Boolean)
      .concat(takenSlugs),
  )
  if (!taken.has(base)) return base
  for (let n = 2; n < 200; n += 1) {
    const candidate = `${base}-${n}`
    if (!taken.has(candidate)) return candidate
  }
  return `${base}-${Date.now().toString(36)}`
}

const text = (value, max = 240) => safeText(value, max)
const body = (value) => safeMultiline(value, MAX_BODY_CHARS)

function normaliseChapter(chapter, index) {
  const paragraphs = (Array.isArray(chapter?.paragraphs) ? chapter.paragraphs : [])
    .map((paragraph) => body(paragraph))
    .filter(Boolean)
  return {
    heading: text(chapter?.heading, 120) || `Chapter ${index + 1}`,
    paragraphs,
  }
}

/**
 * Validates and normalises a studio submission. Returns
 * `{ post, errors[] }`; `post` is only usable when `errors` is empty.
 */
export function buildPost(input = {}) {
  const errors = []
  const title = text(input.title, 110)
  const paragraphs = (Array.isArray(input.paragraphs) ? input.paragraphs : [])
    .map((paragraph) => body(paragraph))
    .filter(Boolean)
  const sections = (Array.isArray(input.sections) ? input.sections : [])
    .map(normaliseChapter)
    .filter((chapter) => chapter.paragraphs.length > 0)
  const sidebarItems = (Array.isArray(input.sidebarItems) ? input.sidebarItems : [])
    .map((pair) => [text(pair?.[0], 40), text(pair?.[1], 120)])
    .filter(([term, value]) => term && value)

  if (!title) errors.push('A title is required.')
  if (paragraphs.length < 1) errors.push('The opening needs at least one paragraph.')
  if (!input.image) errors.push('A lead photograph is required.')
  if (!text(input.author, 60)) errors.push('An author is required.')
  if (input.image && String(input.image).length > MAX_IMAGE_CHARS) {
    errors.push('That photograph is too large. Use one under about 2.5 MB.')
  }

  const strandKey = JOURNAL_STRANDS.some((strand) => strand.key === input.strand) ? input.strand : JOURNAL_STRANDS[0].key
  const strand = JOURNAL_STRANDS.find((entry) => entry.key === strandKey)

  const post = {
    id: input.id || createId('post'),
    slug: input.slug || '',
    title,
    // `eyebrow` is the single string the article renderer parses for its
    // category and volume, so it is derived here rather than typed twice.
    eyebrow: `${strand.raw}${input.volume ? ` · ${text(input.volume, 24)}` : ''}`,
    strand: strand.key,
    volume: text(input.volume, 24),
    subtitle: text(input.subtitle, 320),
    dek: text(input.dek, 400),
    author: text(input.author, 60),
    role: text(input.role, 80),
    date: text(input.date, 40),
    image: String(input.image || ''),
    caption: text(input.caption, 220),
    pullQuote: text(input.pullQuote, 300),
    paragraphs,
    sections,
    sidebar: { title: text(input.sidebarTitle, 80), items: sidebarItems },
    closeNote: text(input.closeNote, 400),
    status: input.status === 'published' ? 'published' : 'draft',
    updatedAt: new Date().toISOString(),
  }

  return { post, errors }
}

/** Saves a post as a draft, replacing any draft with the same id. */
export function saveDraft(input) {
  const { post, errors } = buildPost({ ...input, status: 'draft' })
  if (errors.length) return { ok: false, errors }

  const all = read()
  const index = all.drafts.findIndex((draft) => draft && draft.id === post.id)
  const previous = index >= 0 ? all.drafts[index] : null
  all.drafts = index >= 0
    ? all.drafts.map((draft, i) => (i === index ? { ...previous, ...post } : draft))
    : [{ ...post, createdAt: post.updatedAt }, ...all.drafts]
  if (!write(all)) return { ok: false, errors: ['The browser refused to store the draft. It may be full.'] }
  return { ok: true, post }
}

/**
 * Publishes a post. It keeps its id, gains a unique slug, and moves out of the
 * draft list — so the public site and the workbench never show the same piece
 * twice.
 */
export function publishPost(input, takenSlugs = []) {
  const { post, errors } = buildPost({ ...input, status: 'published' })
  if (errors.length) return { ok: false, errors }

  const all = read()
  const id = post.id
  const previous = all.drafts.find((draft) => draft && draft.id === id) || all.published.find((entry) => entry && entry.id === id) || null
  const slug = uniqueSlug(post.title, takenSlugs, id)

  const published = {
    ...(previous || {}),
    ...post,
    slug,
    publishedAt: previous?.publishedAt || new Date().toISOString(),
  }

  all.drafts = all.drafts.filter((draft) => draft && draft.id !== id)
  all.published = [published, ...all.published.filter((entry) => entry && entry.id !== id)]
  if (!write(all)) return { ok: false, errors: ['The browser refused to store the post. It may be full.'] }
  return { ok: true, post: published }
}

/** Takes a published post off the site, keeping every word as a draft. */
export function unpublishPost(id) {
  const all = read()
  const post = all.published.find((entry) => entry && entry.id === id)
  if (!post) return { ok: false, errors: ['That post is not published.'] }
  all.published = all.published.filter((entry) => entry && entry.id !== id)
  all.drafts = [{ ...post, status: 'draft', updatedAt: new Date().toISOString() }, ...all.drafts]
  write(all)
  return { ok: true }
}

export function deletePost(id) {
  const all = read()
  all.drafts = all.drafts.filter((draft) => draft && draft.id !== id)
  all.published = all.published.filter((entry) => entry && entry.id !== id)
  write(all)
  return { ok: true }
}

/** Deep copy for the "duplicate" action in the workbench. */
export function duplicatePost(id) {
  const source = getPostById(id)
  if (!source) return { ok: false, errors: ['That post no longer exists.'] }
  const all = read()
  const copy = {
    ...structuredClone(source),
    id: createId('post'),
    slug: '',
    title: `${source.title} (copy)`,
    status: 'draft',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  // The original stays exactly where it was. (This line used to delete it,
  // which made "Duplicate" quietly unpublish the piece you had just copied.)
  all.drafts = [copy, ...all.drafts]
  write(all)
  return { ok: true, post: copy }
}

/** Rough word count, used for the same reading-time maths as the static issue. */
export function countWords(post) {
  if (!post) return 0
  return [
    ...(post.paragraphs || []),
    ...(post.sections || []).flatMap((section) => section.paragraphs || []),
  ]
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .split(/\s+/)
    .filter(Boolean).length
}

export function readingMinutes(post) {
  return Math.max(1, Math.round(countWords(post) / 200))
}

export const JOURNAL_IMAGE_LIMIT = MAX_IMAGE_CHARS

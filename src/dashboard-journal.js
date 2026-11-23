/* ===========================================================================
   Journal Studio — the admin side of the blog.
   ---------------------------------------------------------------------------
   Rendered into the dashboard shell by `dashboard.js`, which supplies the
   shared helpers (`escape`, `toast`, `show`). Everything that touches storage
   goes through `data/journal-store.js`, so the public journal and the studio
   read the same source of truth.

   Layout is a two-step flow rather than one giant form: a list of everything
   written so far, then a single editor for the piece being worked on. Photos
   are read locally with FileReader and stored inline as data URLs, which is
   what makes "upload a blog post" possible on a static site with no server.
   ========================================================================== */

import {
  JOURNAL_IMAGE_LIMIT,
  JOURNAL_STRANDS,
  countWords,
  deletePost,
  duplicatePost,
  getDraftPosts,
  getPublishedPosts,
  publishPost,
  readingMinutes,
  saveDraft,
  slugify,
  unpublishPost,
} from './data/journal-store.js'

/* One editor instance at a time; the dashboard rebuilds the panel on every
   `show()`, so the working draft is held here rather than in the DOM. */
let editing = null
let dirty = false

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function today() {
  const now = new Date()
  return `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
}

/** Every slug the shipped issue already occupies, so a studio post can never
 *  overwrite `journal-embers` or any other file that exists on disk. */
function reservedSlugs(ctx) {
  return Array.isArray(ctx.publishedSlugs) ? ctx.publishedSlugs : []
}

function blankPost() {
  return {
    id: '',
    title: '',
    strand: JOURNAL_STRANDS[0].key,
    volume: 'VOL. IX',
    subtitle: '',
    author: 'Elena Rostova',
    role: 'Director of Hospitality',
    date: today(),
    image: '',
    caption: '',
    pullQuote: '',
    paragraphs: [''],
    sections: [{ heading: '', paragraphs: [''] }],
    sidebarTitle: 'By the numbers',
    sidebarItems: [['', '']],
    closeNote: '',
    status: 'draft',
  }
}

function linesToParagraphs(value) {
  return String(value || '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function paragraphsToLines(list) {
  return (Array.isArray(list) ? list : []).join('\n\n')
}

/* --------------------------------------------------------------- rendering */

export function journalStudioPanel(ctx = {}) {
  if (editing) return editorView(ctx)

  const published = getPublishedPosts()
  const drafts = getDraftPosts()
  const words = published.reduce((sum, post) => sum + countWords(post), 0)

  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="book-open"></i> JOURNAL STUDIO</div>
      <h1>Write the <em>Journal.</em></h1>
      <p>Compose a dispatch, attach a photograph, and publish it straight to the blog — no deploy, no developer.</p>
    </div>
    <div class="view-header-actions">
      <button type="button" class="ios-action-btn primary" id="jrn-new"><i data-lucide="plus"></i> <span>New Dispatch</span></button>
    </div>
  </div>

  <div class="jrn-studio-stats ios-spring-enter">
    <div class="jrn-stat"><span>${String(published.length).padStart(2, '0')}</span><b>Live on the blog</b></div>
    <div class="jrn-stat"><span>${String(drafts.length).padStart(2, '0')}</span><b>In the drawer</b></div>
    <div class="jrn-stat"><span>${(words / 1000).toFixed(1)}k</span><b>Words written</b></div>
    <div class="jrn-stat"><span>${published.length ? readingMinutes(published[0]) : 0}</span><b>Min · newest read</b></div>
  </div>

  <section class="jrn-studio-block ios-spring-enter" aria-labelledby="jrn-live-title">
    <div class="jrn-studio-block-head">
      <h2 id="jrn-live-title">Published</h2>
      <a class="jrn-studio-link" href="/pages/blog.html" target="_blank" rel="noopener">View the journal <i data-lucide="arrow-up-right"></i></a>
    </div>
    ${
      published.length
        ? `<div class="jrn-studio-list">${published.map((post) => postRow(post, ctx, true)).join('')}</div>`
        : `<p class="jrn-studio-empty">Nothing published from the studio yet. The eight shipped pieces are still on the blog; anything you publish appears beside them, newest first.</p>`
    }
  </section>

  <section class="jrn-studio-block ios-spring-enter" aria-labelledby="jrn-draft-title">
    <div class="jrn-studio-block-head">
      <h2 id="jrn-draft-title">Drafts</h2>
      <span class="jrn-studio-hint">Saved in this browser · publish when ready</span>
    </div>
    ${
      drafts.length
        ? `<div class="jrn-studio-list">${drafts.map((post) => postRow(post, ctx, false)).join('')}</div>`
        : `<p class="jrn-studio-empty">No drafts. Start a dispatch and it will wait here until you are ready.</p>`
    }
  </section>
  `
}

function postRow(post, ctx, isPublished) {
  const when = post.status === 'published' ? post.publishedAt : post.updatedAt
  const stamp = when ? new Date(when) : null
  const dateLabel = stamp && !Number.isNaN(stamp.getTime())
    ? stamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : post.date || '—'

  return `
  <article class="jrn-studio-row" data-post="${ctx.escape(post.id)}">
    <span class="jrn-studio-thumb">${
      post.image ? `<img src="${ctx.escape(post.image)}" alt="" loading="lazy" decoding="async">` : '<i data-lucide="image"></i>'
    }</span>
    <span class="jrn-studio-body">
      <span class="jrn-studio-strand">${ctx.escape(post.eyebrow || post.strand || '')}</span>
      <strong class="jrn-studio-title">${ctx.escape(post.title)}</strong>
      <span class="jrn-studio-meta">${ctx.escape(post.author || 'Unattributed')} · ${ctx.escape(dateLabel)} · ${countWords(post)} words · ${readingMinutes(post)} min</span>
    </span>
    <span class="jrn-studio-actions">
      <button type="button" class="ios-chip-btn" data-jrn-action="edit" data-id="${ctx.escape(post.id)}"><i data-lucide="pencil"></i> Edit</button>
      ${
        isPublished
          ? `<button type="button" class="ios-chip-btn" data-jrn-action="unpublish" data-id="${ctx.escape(post.id)}"><i data-lucide="ban"></i> Unpublish</button>
             <a class="ios-chip-btn" href="/pages/dispatch.html?slug=${encodeURIComponent(post.slug || '')}" target="_blank" rel="noopener"><i data-lucide="eye"></i> Read</a>`
          : `<button type="button" class="ios-chip-btn accent" data-jrn-action="publish" data-id="${ctx.escape(post.id)}"><i data-lucide="check"></i> Publish</button>`
      }
      <button type="button" class="ios-chip-btn" data-jrn-action="duplicate" data-id="${ctx.escape(post.id)}"><i data-lucide="copy"></i> Duplicate</button>
      <button type="button" class="ios-chip-btn danger" data-jrn-action="delete" data-id="${ctx.escape(post.id)}"><i data-lucide="trash-2"></i> Delete</button>
    </span>
  </article>`
}

function editorView(ctx) {
  const p = editing
  const wordCount = countWords(p)

  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="pencil"></i> ${p.id ? 'EDITING DISPATCH' : 'NEW DISPATCH'}</div>
      <h1>${p.title ? ctx.escape(p.title) : 'Untitled <em>dispatch.</em>'}</h1>
      <p>${wordCount} word${wordCount === 1 ? '' : 's'} · about ${readingMinutes(p)} minute${readingMinutes(p) === 1 ? '' : 's'} to read · ${p.status === 'published' ? 'currently live' : 'held as a draft'}</p>
    </div>
    <div class="view-header-actions">
      <button type="button" class="ios-action-btn ghost" id="jrn-back"><i data-lucide="chevron-right"></i> <span>Back to the drawer</span></button>
    </div>
  </div>

  <form class="jrn-editor ios-spring-enter" id="jrn-form" novalidate>
    <div class="jrn-editor-main">
      <div class="ios-card jrn-editor-card">
        <div class="card-title-row">
          <span class="card-kicker">THE PIECE</span>
          <h3>Headline &amp; standfirst</h3>
        </div>

        <label class="ios-label">
          Title
          <input name="title" maxlength="110" required placeholder="The Quiet Hour" value="${ctx.escape(p.title)}">
        </label>

        <div class="jrn-field-pair">
          <label class="ios-label">
            Strand
            <select name="strand">
              ${JOURNAL_STRANDS.map(
                (strand) => `<option value="${strand.key}"${strand.key === p.strand ? ' selected' : ''}>${strand.label}</option>`,
              ).join('')}
            </select>
          </label>
          <label class="ios-label">
            Volume
            <input name="volume" maxlength="24" placeholder="VOL. IX" value="${ctx.escape(p.volume || '')}">
          </label>
        </div>

        <label class="ios-label">
          Standfirst
          <textarea name="subtitle" rows="2" maxlength="320" placeholder="One sentence that earns the click.">${ctx.escape(p.subtitle)}</textarea>
        </label>

        <label class="ios-label">
          Byline
          <input name="author" maxlength="60" required value="${ctx.escape(p.author)}">
        </label>

        <div class="jrn-field-pair">
          <label class="ios-label">
            Role
            <input name="role" maxlength="80" value="${ctx.escape(p.role || '')}">
          </label>
          <label class="ios-label">
            Filed
            <input name="date" maxlength="40" value="${ctx.escape(p.date || '')}">
          </label>
        </div>
      </div>

      <div class="ios-card jrn-editor-card">
        <div class="card-title-row">
          <span class="card-kicker">THE OPENING</span>
          <h3>Before the first chapter</h3>
        </div>
        <label class="ios-label">
          Paragraphs <span class="jrn-hint">blank line between each</span>
          <textarea name="paragraphs" rows="8" placeholder="The room at 10:40 PM, after the last plate…">${ctx.escape(paragraphsToLines(p.paragraphs))}</textarea>
        </label>
      </div>

      <div class="ios-card jrn-editor-card">
        <div class="card-title-row">
          <span class="card-kicker">CHAPTERS</span>
          <h3>The body of the piece</h3>
        </div>
        <p class="jrn-hint jrn-hint--block">Each chapter becomes a heading with an anchor in the article's contents list.</p>
        <div id="jrn-chapters">
          ${(p.sections || []).map((chapter, i) => chapterField(ctx, chapter, i)).join('')}
        </div>
        <button type="button" class="ios-action-btn ghost" id="jrn-add-chapter"><i data-lucide="plus"></i> <span>Add a chapter</span></button>
      </div>

      <div class="ios-card jrn-editor-card">
        <div class="card-title-row">
          <span class="card-kicker">THE CLOSE</span>
          <h3>Pull quote &amp; sign-off</h3>
        </div>
        <label class="ios-label">
          Pull quote <span class="jrn-hint">optional</span>
          <textarea name="pullQuote" rows="2" maxlength="300" placeholder="The best service is the part you cannot see.">${ctx.escape(p.pullQuote || '')}</textarea>
        </label>
        <label class="ios-label">
          Closing note
          <textarea name="closeNote" rows="3" maxlength="400" placeholder="Ask for the corner table.">${ctx.escape(p.closeNote || '')}</textarea>
        </label>
      </div>
    </div>

    <aside class="jrn-editor-side">
      <div class="ios-card jrn-editor-card">
        <div class="card-title-row">
          <span class="card-kicker">LEAD PHOTOGRAPH</span>
          <h3>The first thing seen</h3>
        </div>
        <div class="jrn-drop" id="jrn-drop" data-empty="${p.image ? 'false' : 'true'}">
          ${
            p.image
              ? `<img id="jrn-preview" src="${ctx.escape(p.image)}" alt="Lead photograph preview">`
              : `<span class="jrn-drop-empty"><i data-lucide="image"></i><b>Drop a photograph</b><span>or choose a file · JPG, PNG, WebP</span></span>`
          }
        </div>
        <input type="file" id="jrn-file" accept="image/*" hidden>
        <div class="jrn-field-pair">
          <button type="button" class="ios-chip-btn" id="jrn-pick"><i data-lucide="image"></i> Choose photo</button>
          ${p.image ? '<button type="button" class="ios-chip-btn danger" id="jrn-clear-image"><i data-lucide="x"></i> Remove</button>' : ''}
        </div>
        <p class="jrn-hint">Under ${(JOURNAL_IMAGE_LIMIT / 1_000_000).toFixed(1)} MB. Photographs are stored with the post in this browser, so keep them web-sized.</p>
        <label class="ios-label">
          Caption
          <input name="caption" maxlength="220" placeholder="The room at 10:40 PM, after the last plate." value="${ctx.escape(p.caption || '')}">
        </label>
      </div>

      <div class="ios-card jrn-editor-card">
        <div class="card-title-row">
          <span class="card-kicker">SIDEBAR</span>
          <h3>A small table of facts</h3>
        </div>
        <label class="ios-label">
          Heading
          <input name="sidebarTitle" maxlength="80" value="${ctx.escape(p.sidebarTitle || '')}">
        </label>
        <div id="jrn-sidebar-items">
          ${(p.sidebarItems || []).map((pair, i) => sidebarField(ctx, pair, i)).join('')}
        </div>
        <button type="button" class="ios-action-btn ghost" id="jrn-add-fact"><i data-lucide="plus"></i> <span>Add a fact</span></button>
      </div>

      <div class="ios-card jrn-editor-card jrn-publish-card">
        <div class="jrn-publish-state ${p.status === 'published' ? 'is-live' : ''}">
          <i data-lucide="${p.status === 'published' ? 'check-circle-2' : 'clock'}"></i>
          <span>${p.status === 'published' ? 'Live on the blog' : 'Draft — nobody can see this yet'}</span>
        </div>
        <button type="submit" class="ios-action-btn primary" id="jrn-save"><i data-lucide="check"></i> <span>Save draft</span></button>
        <button type="button" class="ios-action-btn" id="jrn-publish"><i data-lucide="flame"></i> <span>Publish now</span></button>
        <p class="jrn-hint">Publishing files the piece under the Journal, newest first, with its own URL and reading time.</p>
      </div>
    </aside>
  </form>
  <div class="jrn-editor-status" id="jrn-status" role="status" aria-live="polite"></div>
  `
}

function chapterField(ctx, chapter, i) {
  return `
  <fieldset class="jrn-chapter" data-chapter="${i}">
    <legend>Chapter ${String(i + 1).padStart(2, '0')}</legend>
    <input name="chapterHeading" maxlength="90" placeholder="Eleven minutes" value="${ctx.escape(chapter?.heading || '')}" aria-label="Chapter ${i + 1} heading">
    <textarea name="chapterBody" rows="4" placeholder="Body copy…" aria-label="Chapter ${i + 1} body">${ctx.escape(paragraphsToLines(chapter?.paragraphs))}</textarea>
    <button type="button" class="ios-chip-btn danger jrn-remove-chapter" data-remove-chapter="${i}"><i data-lucide="trash-2"></i> Remove</button>
  </fieldset>`
}

function sidebarField(ctx, pair, i) {
  return `
  <div class="jrn-fact" data-fact="${i}">
    <input name="factTerm" maxlength="40" placeholder="11 min" value="${ctx.escape(pair?.[0] || '')}" aria-label="Fact ${i + 1} label">
    <input name="factValue" maxlength="120" placeholder="Average quiet hour" value="${ctx.escape(pair?.[1] || '')}" aria-label="Fact ${i + 1} value">
    <button type="button" class="ios-chip-btn danger jrn-remove-fact" data-remove-fact="${i}" aria-label="Remove fact ${i + 1}"><i data-lucide="x"></i></button>
  </div>`
}

/* ------------------------------------------------------------- form ↔ model */

/** Reads the live form back into a plain post object. */
function readForm(form) {
  const data = new FormData(form)
  const sections = [...form.querySelectorAll('[data-chapter]')].map((fieldset) => ({
    heading: fieldset.querySelector('[name="chapterHeading"]')?.value || '',
    paragraphs: linesToParagraphs(fieldset.querySelector('[name="chapterBody"]')?.value),
  }))
  const sidebarItems = [...form.querySelectorAll('[data-fact]')].map((row) => [
    row.querySelector('[name="factTerm"]')?.value || '',
    row.querySelector('[name="factValue"]')?.value || '',
  ])

  return {
    ...editing,
    title: data.get('title') || '',
    strand: data.get('strand') || JOURNAL_STRANDS[0].key,
    volume: data.get('volume') || '',
    subtitle: data.get('subtitle') || '',
    author: data.get('author') || '',
    role: data.get('role') || '',
    date: data.get('date') || '',
    caption: data.get('caption') || '',
    pullQuote: data.get('pullQuote') || '',
    closeNote: data.get('closeNote') || '',
    paragraphs: linesToParagraphs(data.get('paragraphs')),
    sections,
    sidebarTitle: data.get('sidebarTitle') || '',
    sidebarItems,
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('That file could not be read.'))
    reader.readAsDataURL(file)
  })
}

/** Shrinks a large photograph before it is stored, so the browser quota is
 *  never the reason a post cannot be saved. */
async function prepareImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.')
  const raw = await readFileAsDataUrl(file)
  if (raw.length <= JOURNAL_IMAGE_LIMIT * 0.55) return raw

  const bitmap = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('That image could not be decoded.'))
    img.src = raw
  })
  const maxEdge = 1600
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.86)
}

/* -------------------------------------------------------------------- events */

/**
 * Wires the studio. Called from `bind()` after the panel is inserted.
 * `ctx` carries { escape, toast, show }.
 */
export function bindJournalStudio(root, ctx) {
  root.querySelector('#jrn-new')?.addEventListener('click', () => {
    editing = blankPost()
    dirty = false
    ctx.show('journal')
  })

  root.querySelector('#jrn-back')?.addEventListener('click', () => {
    if (dirty && !confirm('Leave the editor? Unsaved changes will be lost.')) return
    editing = null
    dirty = false
    ctx.show('journal')
  })

  root.querySelectorAll('[data-jrn-action]').forEach((button) => {
    button.addEventListener('click', () => handleRowAction(button, ctx))
  })

  root.querySelector('#jrn-add-chapter')?.addEventListener('click', () => {
    const form = root.querySelector('#jrn-form')
    if (!form) return
    editing = readForm(form)
    editing.sections = [...(editing.sections || []), { heading: '', paragraphs: [] }]
    ctx.show('journal')
  })

  root.querySelector('#jrn-add-fact')?.addEventListener('click', () => {
    const form = root.querySelector('#jrn-form')
    if (!form) return
    editing = readForm(form)
    editing.sidebarItems = [...(editing.sidebarItems || []), ['', '']]
    ctx.show('journal')
  })

  root.querySelectorAll('[data-remove-chapter]').forEach((button) => {
    button.addEventListener('click', () => {
      const form = root.querySelector('#jrn-form')
      if (!form) return
      const index = Number(button.dataset.removeChapter)
      editing = readForm(form)
      editing.sections = (editing.sections || []).filter((_, i) => i !== index)
      ctx.show('journal')
    })
  })

  root.querySelectorAll('[data-remove-fact]').forEach((button) => {
    button.addEventListener('click', () => {
      const form = root.querySelector('#jrn-form')
      if (!form) return
      const index = Number(button.dataset.removeFact)
      editing = readForm(form)
      editing.sidebarItems = (editing.sidebarItems || []).filter((_, i) => i !== index)
      ctx.show('journal')
    })
  })

  const form = root.querySelector('#jrn-form')
  if (!form) return

  form.addEventListener('input', () => {
    dirty = true
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const post = readForm(form)
    const result = saveDraft(post)
    if (!result.ok) return reportErrors(result.errors, root, ctx)
    editing = { ...result.post, status: result.post.status || 'draft' }
    dirty = false
    ctx.toast('Draft saved.', 'success')
    ctx.show('journal')
  })

  root.querySelector('#jrn-publish')?.addEventListener('click', () => {
    if (!form.reportValidity()) return
    const post = readForm(form)
    const result = publishPost(post, reservedSlugs(ctx))
    if (!result.ok) return reportErrors(result.errors, root, ctx)
    editing = null
    dirty = false
    ctx.toast(`Published — “${result.post.title}” is live on the journal.`, 'success')
    ctx.show('journal')
  })

  /* ---- lead photograph ---- */
  const drop = root.querySelector('#jrn-drop')
  const fileInput = root.querySelector('#jrn-file')

  const applyImage = async (file) => {
    try {
      const dataUrl = await prepareImage(file)
      editing = readForm(form)
      editing.image = dataUrl
      dirty = true
      ctx.show('journal')
      ctx.toast('Photograph attached.', 'success')
    } catch (error) {
      ctx.toast(error.message || 'That photograph could not be attached.', 'info')
    }
  }

  root.querySelector('#jrn-pick')?.addEventListener('click', () => fileInput?.click())
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (file) applyImage(file)
  })

  root.querySelector('#jrn-clear-image')?.addEventListener('click', () => {
    editing = readForm(form)
    editing.image = ''
    dirty = true
    ctx.show('journal')
  })

  if (drop) {
    drop.addEventListener('click', () => fileInput?.click())
    drop.addEventListener('dragover', (event) => {
      event.preventDefault()
      drop.classList.add('is-over')
    })
    drop.addEventListener('dragleave', () => drop.classList.remove('is-over'))
    drop.addEventListener('drop', (event) => {
      event.preventDefault()
      drop.classList.remove('is-over')
      const file = event.dataTransfer?.files?.[0]
      if (file) applyImage(file)
    })
  }
}

function reportErrors(errors, root, ctx) {
  const status = root.querySelector('#jrn-status')
  const list = Array.isArray(errors) ? errors : ['That could not be saved.']
  if (status) status.innerHTML = `<ul>${list.map((message) => `<li>${ctx.escape(message)}</li>`).join('')}</ul>`
  ctx.toast(list[0] || 'That could not be saved.', 'info')
}

function handleRowAction(button, ctx) {
  const id = button.dataset.id
  const action = button.dataset.jrnAction

  if (action === 'edit') {
    const post = getDraftPosts().find((entry) => entry.id === id) || getPublishedPosts().find((entry) => entry.id === id)
    if (!post) return
    editing = {
      ...post,
      paragraphs: post.paragraphs?.length ? post.paragraphs : [''],
      sections: post.sections?.length ? post.sections : [{ heading: '', paragraphs: [] }],
      sidebarItems: post.sidebar?.items?.length ? post.sidebar.items : [['', '']],
      sidebarTitle: post.sidebar?.title || 'By the numbers',
    }
    dirty = false
    ctx.show('journal')
    return
  }

  if (action === 'publish') {
    const post = getDraftPosts().find((entry) => entry.id === id)
    if (!post) return
    const result = publishPost(post, reservedSlugs(ctx))
    if (!result.ok) {
      ctx.toast(result.errors[0] || 'That could not be published.', 'info')
      return
    }
    ctx.toast(`Published — “${result.post.title}” is live.`, 'success')
    ctx.show('journal')
    return
  }

  if (action === 'unpublish') {
    if (!confirm('Take this piece off the blog? Every word stays in the drafts drawer.')) return
    unpublishPost(id)
    ctx.toast('Unpublished — the piece is waiting in drafts.', 'success')
    ctx.show('journal')
    return
  }

  if (action === 'duplicate') {
    const result = duplicatePost(id)
    if (!result.ok) return ctx.toast(result.errors[0] || 'That could not be duplicated.', 'info')
    ctx.toast('Duplicated into drafts.', 'success')
    ctx.show('journal')
    return
  }

  if (action === 'delete') {
    const post = getDraftPosts().find((entry) => entry.id === id) || getPublishedPosts().find((entry) => entry.id === id)
    if (!confirm(`Delete “${post?.title || 'this dispatch'}”? This cannot be undone.`)) return
    deletePost(id)
    ctx.toast('Deleted.', 'success')
    ctx.show('journal')
  }
}

/** Slugs the editor should show in its status line. Kept exported so the
 *  dashboard can price a title without duplicating the rule. */
export function previewSlug(title) {
  return slugify(title)
}

export function resetJournalStudio() {
  editing = null
  dirty = false
}

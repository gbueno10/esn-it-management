/**
 * ESN Porto Events Scraper
 *
 * Scrapes all events from esnporto.org, extracts Eventupp event IDs
 * from iframes, and stores the mapping in Supabase.
 *
 * Usage: npx tsx scripts/scrape-events.ts
 */

// Load .env manually since tsx doesn't load dotenv
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.+)$/)
  if (match) envVars[match[1]] = match[2].trim()
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env')
}
const BASE_URL = 'https://esnporto.org'
const EVENTS_URL = `${BASE_URL}/?q=events&field_date_value=All`
const CONCURRENCY = 3
const DELAY_MS = 300
const MAX_PAGES = Infinity // Set to a number to limit pages

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchHTML(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// ── Parse listing page for event slugs ───────────────────────────────────────

function parseSlugs(html: string): string[] {
  const slugs: string[] = []
  const regex = /href="\/?(?:\?q=)?events\/([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1]
    if (!slugs.includes(slug)) slugs.push(slug)
  }
  return slugs
}

function getLastPage(html: string): number {
  const match = html.match(/pager-last[^>]*><a[^>]*page=(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// ── Parse event detail ───────────────────────────────────────────────────────

function parseEventDetail(html: string): { eventuppEventId: string | null; title: string | null } {
  const iframeMatch = html.match(
    /src="https:\/\/eventupp\.eu\/iframes\/event-details\/[^/"]+\/([^"]+)"/
  )
  const titleMatch = html.match(/<h1[^>]*class="title"[^>]*>\s*([^<]+?)\s*<\/h1>/)
  return {
    eventuppEventId: iframeMatch ? iframeMatch[1] : null,
    title: titleMatch ? titleMatch[1].trim() : null,
  }
}

// ── Batch processing ─────────────────────────────────────────────────────────

async function processInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
    if (i + concurrency < items.length) await sleep(DELAY_MS)
  }
  return results
}

// ── Supabase upsert ──────────────────────────────────────────────────────────

interface EventRow {
  slug: string
  title: string | null
  websiteUrl: string
  eventuppEventId: string | null
}

async function upsertEvents(events: EventRow[]) {
  const esc = (s: string | null) =>
    s === null ? 'NULL' : `'${s.replace(/'/g, "''")}'`

  const values = events
    .map((e) => `(${esc(e.slug)}, ${esc(e.title)}, ${esc(e.websiteUrl)}, ${esc(e.eventuppEventId)})`)
    .join(',\n')

  const query = `
    INSERT INTO it_manager.esn_events (slug, title, website_url, eventupp_event_id)
    VALUES ${values}
    ON CONFLICT (slug) DO UPDATE SET
      title = COALESCE(EXCLUDED.title, it_manager.esn_events.title),
      eventupp_event_id = COALESCE(EXCLUDED.eventupp_event_id, it_manager.esn_events.eventupp_event_id)
  `

  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`)
  const data = await res.json()
  if (data?.error) throw new Error(`SQL error: ${data.error}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching events listing page 0...')
  const firstPage = await fetchHTML(EVENTS_URL)
  const lastPage = getLastPage(firstPage)
  console.log(`Found ${lastPage + 1} pages (scraping first ${Math.min(lastPage + 1, MAX_PAGES)})`)

  // Step 1: Collect all slugs
  let allSlugs: string[] = parseSlugs(firstPage)
  console.log(`  Page 0: ${allSlugs.length} events`)

  const pagesToScrape = Math.min(lastPage, MAX_PAGES - 1) // page 0 already fetched
  for (let page = 1; page <= pagesToScrape; page++) {
    await sleep(DELAY_MS)
    try {
      const html = await fetchHTML(`${EVENTS_URL}&page=${page}`)
      const slugs = parseSlugs(html)
      allSlugs.push(...slugs.filter((s) => !allSlugs.includes(s)))
      if (page % 10 === 0 || page === lastPage) {
        console.log(`  Page ${page}/${lastPage}: ${allSlugs.length} total`)
      }
    } catch (err) {
      console.error(`  Page ${page} failed:`, err)
    }
  }

  console.log(`\nTotal unique events: ${allSlugs.length}`)

  // Step 2: Fetch each event page for eventupp ID
  console.log('\nFetching event details...')
  let processed = 0
  let withEventupp = 0

  const events = await processInBatches(
    allSlugs,
    CONCURRENCY,
    async (slug): Promise<EventRow> => {
      const url = `${BASE_URL}/?q=events/${slug}`
      try {
        const html = await fetchHTML(url)
        const { eventuppEventId, title } = parseEventDetail(html)
        processed++
        if (eventuppEventId) withEventupp++
        if (processed % 50 === 0) {
          console.log(`  ${processed}/${allSlugs.length} (${withEventupp} with Eventupp)`)
        }
        return { slug, title, websiteUrl: url, eventuppEventId }
      } catch (err) {
        processed++
        console.error(`  ${slug} failed:`, err)
        return { slug, title: null, websiteUrl: url, eventuppEventId: null }
      }
    }
  )

  console.log(`\n${processed} processed, ${withEventupp} have Eventupp IDs`)

  // Step 3: Save to Supabase
  console.log('\nSaving to Supabase...')
  const BATCH_SIZE = 50
  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE)
    try {
      await upsertEvents(batch)
      console.log(`  Saved ${Math.min(i + BATCH_SIZE, events.length)}/${events.length}`)
    } catch (err) {
      console.error(`  Batch ${i} failed:`, err)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)

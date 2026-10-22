import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getYouTubeDescription } from './youtube.js'
import { getYouTubeVideoIds, parseYouTubeVideoPage } from './youtube-source.js'

function response(videoId, description = 'Une description\n\nAvec ses détails.') {
  return new Response(JSON.stringify({ videoId, description }))
}

test('discovers video IDs without including the commented example or duplicates', () => {
  const source = `
    // Vidéo : { youtubeId: 'IDENTIFIANT' }
    { youtubeId: '_Zywu5EYRPg' },
    { youtubeId: 'sUi2SdhL95M' },
    { youtubeId: '_Zywu5EYRPg' },
  `
  assert.deepEqual(getYouTubeVideoIds(source), ['_Zywu5EYRPg', 'sUi2SdhL95M'])
})

test('extracts the complete description with quotes, braces and line breaks', () => {
  const description = 'Texte "avec {des accolades}" et un antislash \\.\n\nhttps://example.com/détails'
  const metadata = {
    videoDetails: { videoId: '_Zywu5EYRPg', title: 'La vidéo', shortDescription: description },
  }
  const html = `<script>var ytInitialPlayerResponse = ${JSON.stringify(metadata)}; window.other = {};</script>`
  assert.deepEqual(parseYouTubeVideoPage(html, '_Zywu5EYRPg'), {
    videoId: '_Zywu5EYRPg', title: 'La vidéo', description,
  })
})

test('rejects unavailable, incomplete or unrelated YouTube metadata', () => {
  for (const html of [
    '<html>Veuillez vous connecter</html>',
    'var ytInitialPlayerResponse = {',
    'var ytInitialPlayerResponse = {"videoDetails":{}};',
    'var ytInitialPlayerResponse = {"videoDetails":{"videoId":"other000001","title":"Autre","shortDescription":"Texte"}};',
  ]) {
    assert.throws(() => parseYouTubeVideoPage(html, '_Zywu5EYRPg'))
  }
  assert.equal(parseYouTubeVideoPage(
    'var ytInitialPlayerResponse = {"videoDetails":{"videoId":"_Zywu5EYRPg","title":"Vidéo","shortDescription":""}};',
    '_Zywu5EYRPg',
  ).description, '')
})

test('loads from the site on demand and shares pending and successful requests', async (t) => {
  let finish
  const fetch = t.mock.method(globalThis, 'fetch', (url, options) => {
    assert.equal(url, '/portfolio/youtube/shared00001.json')
    assert.equal(options.credentials, 'omit')
    assert.equal(options.cache, 'no-cache')
    return new Promise((resolve) => { finish = resolve })
  })
  const first = getYouTubeDescription('shared00001', '/portfolio/')
  const second = getYouTubeDescription('shared00001', '/portfolio/')
  assert.equal(first, second)
  finish(response('shared00001'))
  assert.equal(await first, 'Une description\n\nAvec ses détails.')
  assert.equal(await getYouTubeDescription('shared00001', '/portfolio/'), await first)
  assert.equal(fetch.mock.callCount(), 1)
})

test('failed requests can be retried when the description is reopened', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }))
  await assert.rejects(getYouTubeDescription('retry000001'))
  fetch.mock.mockImplementation(async () => response('retry000001', 'Disponible'))
  assert.equal(await getYouTubeDescription('retry000001'), 'Disponible')
  assert.equal(fetch.mock.callCount(), 2)
})

test('rejects invalid metadata and handles an intentionally empty description', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('{'))
  await assert.rejects(getYouTubeDescription('invalid0001'))
  fetch.mock.mockImplementation(async () => response('wrong000001'))
  await assert.rejects(getYouTubeDescription('invalid0001'))
  fetch.mock.mockImplementation(async () => new Response(JSON.stringify({ videoId: 'invalid0001', description: null })))
  await assert.rejects(getYouTubeDescription('invalid0001'))
  fetch.mock.mockImplementation(async () => response('invalid0001', ''))
  assert.equal(await getYouTubeDescription('invalid0001'), '')
})

test('does not send requests for invalid video IDs', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => response(''))
  for (const id of ['../private', '', 'https://youtu.be/_Zywu5EYRPg']) {
    await assert.rejects(getYouTubeDescription(id))
  }
  assert.equal(fetch.mock.callCount(), 0)
})

test('aborts a stalled request instead of leaving the description loading', async (t) => {
  const schedule = setTimeout
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    assert.equal(delay, 6000)
    return schedule(callback, 0)
  })
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true })
  }))
  await assert.rejects(getYouTubeDescription('timeout0001'))
})

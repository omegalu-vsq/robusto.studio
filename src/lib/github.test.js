import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkRepositoryAccess, getGitHubRepository } from './github.js'

function response(data, status = 200) {
  return new Response(JSON.stringify(data), { status })
}

function storageForTest(t, storage) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: storage,
  })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous)
    else delete globalThis.sessionStorage
  })
}

test('identifies GitHub repositories and rejects unrelated or malformed URLs', () => {
  assert.equal(
    getGitHubRepository('https://github.com/Owner/Repo.git/'),
    'owner/repo',
  )
  assert.equal(
    getGitHubRepository('https://www.github.com/Owner/Repo/tree/main'),
    'owner/repo',
  )
  for (const url of [
    'https://github.com/owner',
    'https://gitlab.com/owner/repo',
    'https://github.com.example.com/owner/repo',
    'https://github.com/owner/%2Frepo',
    'invalid',
  ]) {
    assert.equal(getGitHubRepository(url), null)
  }
})

test('checks public access without sending credentials', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.github.com/repos/tests/public')
    assert.equal(options.credentials, 'omit')
    assert.equal(options.headers.Accept, 'application/vnd.github+json')
    assert.equal(options.headers.Authorization, undefined)
    return response({ private: false, disabled: false })
  })
  assert.equal(
    await checkRepositoryAccess('https://github.com/tests/public'),
    'public',
  )
  assert.equal(fetch.mock.callCount(), 1)
})

for (const [name, status, body, expected] of [
  ['missing', 404, {}, 'unavailable'],
  ['gone', 410, {}, 'unavailable'],
  ['private', 200, { private: true }, 'unavailable'],
  ['disabled', 200, { private: false, disabled: true }, 'unavailable'],
  ['rate-limited', 403, {}, 'unknown'],
  ['throttled', 429, {}, 'unknown'],
  ['server-error', 500, {}, 'unknown'],
  ['incomplete-data', 200, {}, 'unknown'],
]) {
  test(`handles ${name} without claiming a repository is private`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () => response(body, status))
    assert.equal(
      await checkRepositoryAccess(`https://github.com/tests/${name}`),
      expected,
    )
  })
}

test('handles network errors and malformed JSON as unverified access', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('offline')
  })
  assert.equal(
    await checkRepositoryAccess('https://github.com/tests/offline'),
    'unknown',
  )
  t.mock.method(globalThis, 'fetch', async () => new Response('{'))
  assert.equal(
    await checkRepositoryAccess('https://github.com/tests/bad-json'),
    'unknown',
  )
})

test('aborts a stalled request and leaves its access unverified', async (t) => {
  const schedule = setTimeout
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    assert.equal(delay, 6000)
    return schedule(callback, 0)
  })
  t.mock.method(
    globalThis,
    'fetch',
    async (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('timeout')), {
          once: true,
        })
      }),
  )
  assert.equal(
    await checkRepositoryAccess('https://github.com/tests/timeout'),
    'unknown',
  )
})

test('shares in-flight checks and reuses their result across remounts', async (t) => {
  let resolve
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    () => new Promise((finish) => (resolve = finish)),
  )
  const first = checkRepositoryAccess('https://github.com/tests/shared')
  const second = checkRepositoryAccess('https://github.com/Tests/Shared')
  assert.equal(first, second)
  resolve(response({ private: false }))
  assert.equal(await first, 'public')
  assert.equal(
    await checkRepositoryAccess('https://github.com/tests/shared'),
    'public',
  )
  assert.equal(fetch.mock.callCount(), 1)
})

test('expires cached checks after fifteen minutes', async (t) => {
  let now = Date.now()
  t.mock.method(Date, 'now', () => now)
  const fetch = t.mock.method(globalThis, 'fetch', async () =>
    response({ private: false }),
  )
  const url = 'https://github.com/tests/expired'
  await checkRepositoryAccess(url)
  now += 15 * 60 * 1000 + 1
  await checkRepositoryAccess(url)
  assert.equal(fetch.mock.callCount(), 2)
})

test('reuses stored status and allows a manual refresh', async (t) => {
  const key = 'portfolio:github-access:tests/stored'
  const saved = new Map([
    [key, JSON.stringify({ status: 'public', expiresAt: Date.now() + 900000 })],
  ])
  storageForTest(t, {
    getItem: (name) => saved.get(name) || null,
    setItem: (name, value) => saved.set(name, value),
    removeItem: (name) => saved.delete(name),
  })
  const fetch = t.mock.method(globalThis, 'fetch', async () => response({}, 404))
  const url = 'https://github.com/tests/stored'
  assert.equal(await checkRepositoryAccess(url), 'public')
  assert.equal(fetch.mock.callCount(), 0)
  assert.equal(await checkRepositoryAccess(url, { refresh: true }), 'unavailable')
  assert.equal(JSON.parse(saved.get(key)).status, 'unavailable')
})

test('does not keep an old public status after a failed refresh', async (t) => {
  const saved = new Map()
  storageForTest(t, {
    getItem: (key) => saved.get(key) || null,
    setItem: (key, value) => saved.set(key, value),
    removeItem: (key) => saved.delete(key),
  })
  let online = true
  t.mock.method(globalThis, 'fetch', async () =>
    online ? response({ private: false }) : response({}, 429),
  )
  const url = 'https://github.com/tests/refresh-error'
  assert.equal(await checkRepositoryAccess(url), 'public')
  online = false
  assert.equal(await checkRepositoryAccess(url, { refresh: true }), 'unknown')
  assert.equal(saved.has('portfolio:github-access:tests/refresh-error'), false)
})

test('still checks repositories when session storage is blocked', async (t) => {
  storageForTest(t, {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  })
  t.mock.method(globalThis, 'fetch', async () => response({ private: false }))
  assert.equal(
    await checkRepositoryAccess('https://github.com/tests/no-storage'),
    'public',
  )
})

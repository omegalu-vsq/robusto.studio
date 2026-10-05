const CACHE_DURATION = 15 * 60 * 1000
const ERROR_CACHE_DURATION = 60 * 1000
const STORAGE_PREFIX = 'portfolio:github-access:'
const requests = new Map()

export function getGitHubRepository(href) {
  try {
    const url = new URL(href)
    if (
      url.protocol !== 'https:' ||
      !['github.com', 'www.github.com'].includes(url.hostname)
    ) {
      return null
    }
    const [owner, rawName] = url.pathname.split('/').filter(Boolean)
    const name = rawName?.replace(/\.git$/i, '')
    if (!owner || !name || !/^[\w.-]+$/.test(owner + name)) return null
    return `${owner}/${name}`.toLowerCase()
  } catch {
    return null
  }
}

function readStoredStatus(repository) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_PREFIX + repository))
    if (
      saved?.expiresAt > Date.now() &&
      ['public', 'unavailable'].includes(saved.status)
    ) {
      return saved.status
    }
  } catch {
    // The check still works when browser storage is unavailable.
  }
  return null
}

async function fetchStatus(repository) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}`, {
      credentials: 'omit',
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
    if (response.status === 404 || response.status === 410) return 'unavailable'
    if (!response.ok) return 'unknown'
    const data = await response.json()
    if (data.private === false && data.disabled !== true) return 'public'
    if (data.private === true || data.disabled === true) return 'unavailable'
    return 'unknown'
  } catch {
    return 'unknown'
  } finally {
    clearTimeout(timeout)
  }
}

export function checkRepositoryAccess(href, { refresh = false } = {}) {
  const repository = getGitHubRepository(href)
  if (!repository) return Promise.resolve('unknown')

  const current = requests.get(repository)
  if (
    current &&
    (current.expiresAt === Infinity ||
      (!refresh && current.expiresAt > Date.now()))
  ) {
    return current.promise
  }
  if (!refresh) {
    const saved = readStoredStatus(repository)
    if (saved) return Promise.resolve(saved)
  }

  const entry = { expiresAt: Infinity, promise: null }
  entry.promise = fetchStatus(repository).then((status) => {
    entry.expiresAt =
      Date.now() + (status === 'unknown' ? ERROR_CACHE_DURATION : CACHE_DURATION)
    try {
      const key = STORAGE_PREFIX + repository
      if (status === 'unknown') {
        sessionStorage.removeItem(key)
      } else {
        sessionStorage.setItem(
          key,
          JSON.stringify({ status, expiresAt: entry.expiresAt }),
        )
      }
    } catch {
      // Storage is optional; the in-memory cache also deduplicates requests.
    }
    return status
  })
  requests.set(repository, entry)
  return entry.promise
}

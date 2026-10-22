import { isYouTubeVideoId } from './youtube-source.js'

const requests = new Map()

export function getYouTubeDescription(videoId, baseUrl = '/') {
  if (!isYouTubeVideoId(videoId)) return Promise.reject(new Error('Vidéo invalide'))
  const url = `${baseUrl}youtube/${videoId}.json`
  if (requests.has(url)) return requests.get(url)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  const request = fetch(url, {
    credentials: 'omit',
    cache: 'no-cache',
    signal: controller.signal,
  }).then(async (response) => {
    if (!response.ok) throw new Error('Description indisponible')
    const data = await response.json()
    if (data.videoId !== videoId || typeof data.description !== 'string') {
      throw new Error('Description invalide')
    }
    return data.description
  }).catch((error) => {
    requests.delete(url)
    throw error
  }).finally(() => clearTimeout(timeout))
  requests.set(url, request)
  return request
}

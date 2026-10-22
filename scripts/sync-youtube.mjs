import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { getYouTubeVideoIds, parseYouTubeVideoPage } from '../src/lib/youtube-source.js'

const projectsUrl = new URL('../src/data/projects.js', import.meta.url)
const outputUrl = new URL('../public/youtube/', import.meta.url)
const videoIds = getYouTubeVideoIds(await readFile(projectsUrl, 'utf8'))
await mkdir(outputUrl, { recursive: true })

if (process.env.YOUTUBE_SYNC_OFFLINE === '1') {
  console.log('YouTube : synchronisation désactivée, utilisation des descriptions locales.')
} else {
  const results = await Promise.allSettled(videoIds.map(async (videoId) => {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=fr`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const metadata = parseYouTubeVideoPage(await response.text(), videoId)
    const content = `${JSON.stringify(metadata, null, 2)}\n`
    const file = new URL(`${videoId}.json`, outputUrl)
    const previous = await readFile(file, 'utf8').catch(() => null)
    if (content !== previous) await writeFile(file, content)
  }))
  for (const [index, result] of results.entries()) {
    if (result.status === 'rejected') {
      console.warn(`YouTube ${videoIds[index]} : ${result.reason.message}. La copie locale est conservée si elle existe.`)
    }
  }
  console.log(`YouTube : ${results.filter((result) => result.status === 'fulfilled').length}/${videoIds.length} descriptions synchronisées.`)
}

const VIDEO_ID = /^[\w-]{11}$/

export function isYouTubeVideoId(value) {
  return typeof value === 'string' && VIDEO_ID.test(value)
}

export function getYouTubeVideoIds(source) {
  const code = source.replace(/^\s*\/\/.*$/gm, '')
  return [...new Set(
    [...code.matchAll(/\byoutubeId:\s*(['"])([\w-]{11})\1/g)]
      .map((match) => match[2]),
  )]
}

export function parseYouTubeVideoPage(html, videoId) {
  const assignment = /\bytInitialPlayerResponse\s*=\s*/.exec(html)
  if (!assignment) throw new Error('Métadonnées YouTube absentes')
  const start = assignment.index + assignment[0].length
  if (html[start] !== '{') throw new Error('Métadonnées YouTube invalides')
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = start; index < html.length; index++) {
    const character = html[index]
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') inString = true
    else if (character === '{') depth++
    else if (character === '}' && --depth === 0) {
      const { videoDetails } = JSON.parse(html.slice(start, index + 1))
      if (
        videoDetails?.videoId !== videoId ||
        typeof videoDetails.title !== 'string' ||
        typeof videoDetails.shortDescription !== 'string'
      ) {
        throw new Error('Description YouTube indisponible')
      }
      return {
        videoId,
        title: videoDetails.title,
        description: videoDetails.shortDescription,
      }
    }
  }
  throw new Error('Métadonnées YouTube incomplètes')
}

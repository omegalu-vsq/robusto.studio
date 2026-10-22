import { Fragment, useId, useState } from 'react'
import { getYouTubeDescription } from '../lib/youtube'

function DescriptionText({ text }) {
  const result = []
  let cursor = 0
  for (const match of text.matchAll(/https?:\/\/[^\s<>"'’]+/g)) {
    let href = match[0].replace(/[.,;:!?]+$/, '')
    while (
      href.endsWith(')') &&
      (href.match(/\)/g)?.length || 0) > (href.match(/\(/g)?.length || 0)
    ) {
      href = href.slice(0, -1)
    }
    result.push(
      <Fragment key={match.index}>
        {text.slice(cursor, match.index)}
        <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>
      </Fragment>,
    )
    cursor = match.index + href.length
  }
  result.push(text.slice(cursor))
  return result
}

export default function YouTubeDescription({ videoId }) {
  const panelId = useId()
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState({ status: 'idle', description: '' })

  function toggle() {
    setExpanded(!expanded)
    if (expanded || content.status === 'loading' || content.status === 'ready') return
    setContent({ status: 'loading', description: '' })
    getYouTubeDescription(videoId, import.meta.env.BASE_URL).then(
      (description) => setContent({ status: 'ready', description }),
      () => setContent({ status: 'error', description: '' }),
    )
  }

  return (
    <div className="youtube-description">
      <button
        type="button"
        className="youtube-description-toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
      >
        {expanded ? 'Replier la description' : 'Afficher la description YouTube'}
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div
        id={panelId}
        className="youtube-description-content"
        hidden={!expanded}
        aria-busy={content.status === 'loading'}
        aria-live="polite"
      >
        {content.status === 'loading' && <p>Chargement de la description…</p>}
        {content.status === 'ready' && (
          <p className="youtube-description-text">
            {content.description.trim()
              ? <DescriptionText text={content.description} />
              : 'Cette vidéo ne contient pas de description.'}
          </p>
        )}
        {content.status === 'error' && (
          <p>
            La description est indisponible pour le moment.{' '}
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              La consulter sur YouTube
            </a>
          </p>
        )}
      </div>
    </div>
  )
}

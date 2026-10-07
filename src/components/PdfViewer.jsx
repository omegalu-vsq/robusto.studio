import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './PdfViewer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const options = {
  cMapUrl: `${import.meta.env.BASE_URL}pdfjs/cmaps/`,
  standardFontDataUrl: `${import.meta.env.BASE_URL}pdfjs/standard_fonts/`,
  wasmUrl: `${import.meta.env.BASE_URL}pdfjs/wasm/`,
}

function PdfPage({ pageNumber, width, renderWidth, scrollRoot }) {
  const container = useRef(null)
  const [visible, setVisible] = useState(pageNumber === 1)
  const [aspectRatio, setAspectRatio] = useState(1 / Math.SQRT2)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { root: scrollRoot.current, rootMargin: '800px 0px' },
    )
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [scrollRoot])

  return (
    <div
      ref={container}
      className="pdf-page"
      data-page-number={pageNumber}
      role="group"
      aria-label={`Page ${pageNumber}`}
      style={{ width, aspectRatio }}
    >
      {visible && renderWidth > 0 && (
        <div
          className="pdf-page-content"
          style={{ width: renderWidth, transform: `scale(${width / renderWidth})` }}
        >
          <Page
            pageNumber={pageNumber}
            width={renderWidth}
            devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2, 2000 / renderWidth)}
            loading={<p className="pdf-status" role="status">Chargement de la page…</p>}
            error={<p className="pdf-status" role="alert">Cette page n’a pas pu être affichée.</p>}
            onLoadSuccess={(page) => {
              const viewport = page.getViewport({ scale: 1 })
              setAspectRatio(viewport.width / viewport.height)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function PdfViewer({ src, title, controlsTarget }) {
  const scrollRoot = useRef(null)
  const zoomAnchor = useRef(null)
  const zoomValue = useRef(100)
  const changeZoomRef = useRef(null)
  const zoomRenderTimer = useRef(null)
  const [width, setWidth] = useState(0)
  const [numPages, setNumPages] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [renderZoom, setRenderZoom] = useState(100)
  const pageWidth = Math.round(width * zoom / 100)
  const renderWidth = Math.round(width * renderZoom / 100)

  useEffect(() => () => clearTimeout(zoomRenderTimer.current), [])

  useEffect(() => {
    const element = scrollRoot.current
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(element)
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      setWidth(Math.floor(Math.min(1000, element.clientWidth - padding)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const anchor = zoomAnchor.current
    if (!anchor) return
    const viewer = scrollRoot.current
    const page = viewer.querySelector(`[data-page-number="${anchor.pageNumber}"]`)
    if (page) {
      const viewportX = anchor.point ? Math.min(anchor.point.x, viewer.clientWidth) : viewer.clientWidth / 2
      const viewportY = anchor.point ? Math.min(anchor.point.y, viewer.clientHeight) : viewer.clientHeight / 2
      viewer.scrollTop = page.offsetTop + page.offsetHeight * anchor.y - viewportY
      viewer.scrollLeft = page.offsetLeft + page.offsetWidth * anchor.x - viewportX
    }
    zoomAnchor.current = null
  }, [pageWidth, zoom])

  function changeZoom(requestedZoom, pointer, deferRender = false) {
    const nextZoom = Math.max(50, Math.min(300, requestedZoom))
    if (nextZoom === zoomValue.current) return
    const viewer = scrollRoot.current
    const rect = viewer.getBoundingClientRect()
    const point = pointer && pointer.x >= rect.left && pointer.x <= rect.right &&
      pointer.y >= rect.top && pointer.y <= rect.bottom
      ? {
          x: Math.min(pointer.x - rect.left, viewer.clientWidth),
          y: Math.min(pointer.y - rect.top, viewer.clientHeight),
        }
      : null
    const centerY = viewer.scrollTop + (point?.y ?? viewer.clientHeight / 2)
    const pages = [...viewer.querySelectorAll('.pdf-page')]
    const page = pages.find((item) => item.offsetTop + item.offsetHeight >= centerY) || pages.at(-1)
    if (page) {
      zoomAnchor.current = {
        pageNumber: page.dataset.pageNumber,
        x: (viewer.scrollLeft + (point?.x ?? viewer.clientWidth / 2) - page.offsetLeft) / page.offsetWidth,
        y: (centerY - page.offsetTop) / page.offsetHeight,
        point,
      }
    }
    zoomValue.current = nextZoom
    setZoom(nextZoom)
    clearTimeout(zoomRenderTimer.current)
    if (deferRender) {
      // Scale the existing page during the gesture; redraw sharply once it stops.
      zoomRenderTimer.current = setTimeout(() => setRenderZoom(zoomValue.current), 150)
    } else {
      setRenderZoom(nextZoom)
    }
  }

  useLayoutEffect(() => {
    changeZoomRef.current = changeZoom
  })

  useEffect(() => {
    const dialog = controlsTarget?.closest('dialog')
    if (!dialog) return
    let pendingDelta = 0
    let wheelFrame = null
    let pointer = null

    function onWheel(event) {
      if (!dialog.open || !(event.ctrlKey || event.metaKey) || event.altKey) return
      event.preventDefault()
      if (!numPages || !width || !event.deltaY) return
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scrollRoot.current.clientHeight : 1
      pendingDelta += event.deltaY * unit
      pointer = { x: event.clientX, y: event.clientY }
      if (wheelFrame !== null) return
      wheelFrame = requestAnimationFrame(() => {
        wheelFrame = null
        changeZoomRef.current(zoomValue.current * Math.exp(-pendingDelta / 100), pointer, true)
        pendingDelta = 0
      })
    }

    function onKeyDown(event) {
      if (!dialog.open || !(event.ctrlKey || event.metaKey) || event.altKey) return
      let nextZoom
      if (event.key === '+' || event.key === '=' || event.code === 'NumpadAdd') {
        nextZoom = zoomValue.current + 25
      } else if (event.key === '-' || event.code === 'NumpadSubtract') {
        nextZoom = zoomValue.current - 25
      } else if (event.key === '0' || event.code === 'Digit0' || event.code === 'Numpad0') {
        nextZoom = 100
      } else {
        return
      }
      event.preventDefault()
      if (wheelFrame !== null) cancelAnimationFrame(wheelFrame)
      wheelFrame = null
      pendingDelta = 0
      if (numPages && width) changeZoomRef.current(nextZoom)
    }

    dialog.addEventListener('wheel', onWheel, { capture: true, passive: false })
    dialog.addEventListener('keydown', onKeyDown, { capture: true })
    return () => {
      dialog.removeEventListener('wheel', onWheel, { capture: true })
      dialog.removeEventListener('keydown', onKeyDown, { capture: true })
      if (wheelFrame !== null) cancelAnimationFrame(wheelFrame)
    }
  }, [controlsTarget, numPages, width])

  function goToPage({ pageNumber }) {
    const viewer = scrollRoot.current
    const page = viewer.querySelector(`[data-page-number="${pageNumber}"]`)
    if (page) {
      const padding = parseFloat(getComputedStyle(viewer).paddingTop)
      viewer.scrollTop = page.offsetTop - padding
    }
  }

  return (
    <>
      {controlsTarget && createPortal(
        <>
          <button
            type="button"
            aria-label="Dézoomer"
            title="Dézoomer"
            disabled={!numPages || !width || zoom <= 50}
            onClick={() => changeZoom(Math.max(50, zoom - 25))}
          >
            −
          </button>
          <button
            type="button"
            className="lightbox-zoom-reset"
            aria-label="Réinitialiser le zoom à 100 %"
            title="Réinitialiser le zoom à 100 %"
            disabled={!numPages || !width}
            onClick={() => changeZoom(100)}
          >
            <span aria-live="polite" aria-atomic="true">{Math.round(zoom)} %</span>
          </button>
          <button
            type="button"
            aria-label="Zoomer"
            title="Zoomer"
            disabled={!numPages || !width || zoom >= 300}
            onClick={() => changeZoom(Math.min(300, zoom + 25))}
          >
            +
          </button>
        </>,
        controlsTarget,
      )}
      <div
        ref={scrollRoot}
        className="pdf-viewer"
        role="region"
        aria-label={`Document PDF : ${title}`}
        tabIndex={0}
      >
        <Document
          className="pdf-document"
          file={src}
          options={options}
          suspense={false}
          externalLinkTarget="_blank"
          loading={<p className="pdf-status" role="status">Chargement du document…</p>}
          error={
            <p className="pdf-status" role="alert">
              Impossible d’afficher ce document. Vous pouvez le télécharger avec le bouton en haut.
            </p>
          }
          onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
          onItemClick={goToPage}
        >
          {Array.from({ length: numPages }, (_, index) => (
            <PdfPage
              key={index + 1}
              pageNumber={index + 1}
              width={pageWidth}
              renderWidth={renderWidth}
              scrollRoot={scrollRoot}
            />
          ))}
        </Document>
      </div>
    </>
  )
}

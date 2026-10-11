import { useLayoutEffect, useRef, useState } from 'react'
import '@fontsource-variable/fraunces/wght.css'

function createBlobPath(index, time = 0) {
  const phase = (index + 1) * 1.37
  const motion = time * 0.85
  const left = 5 + 1.5 * Math.sin(motion + phase)
  const right = 95 + 1.5 * Math.cos(motion + phase)
  const top = 8 + 2.8 * Math.sin(motion + phase + 1)
  const bottom = 52 + 2.8 * Math.sin(motion + phase + 3)
  const topX = 50 + 6 * Math.sin(motion * 0.8 + phase)
  const bottomX = 50 + 6 * Math.cos(motion * 0.8 + phase)
  const rightY = 30 + 3 * Math.sin(motion + phase + 2)
  const leftY = 30 + 3 * Math.cos(motion + phase + 2)
  const fullness = 0.78 + 0.035 * Math.sin(phase)
  const topReach = Math.min(topX - left, right - topX) * fullness
  const bottomReach = Math.min(bottomX - left, right - bottomX) * fullness
  const rightReach = Math.min(rightY - top, bottom - rightY) * 0.8
  const leftReach = Math.min(leftY - top, bottom - leftY) * 0.8
  const point = (x, y) => `${x.toFixed(3)} ${y.toFixed(3)}`

  // Four generous arcs with matching tangents stay rounded as they breathe.
  return [
    `M${point(topX, top)}`,
    `C${point(topX + topReach, top)} ${point(right, rightY - rightReach)} ${point(right, rightY)}`,
    `C${point(right, rightY + rightReach)} ${point(bottomX + bottomReach, bottom)} ${point(bottomX, bottom)}`,
    `C${point(bottomX - bottomReach, bottom)} ${point(left, leftY + leftReach)} ${point(left, leftY)}`,
    `C${point(left, leftY - leftReach)} ${point(topX - topReach, top)} ${point(topX, top)}Z`,
  ].join('')
}

function FilterBlob({ kind, bounds, index, visible = true, slide = true, pathRef }) {
  const extraX = kind === 'selected' && bounds ? Math.max(0, (bounds.width - 100) * 0.1) : 0
  const extraY = Math.min(4, extraX * 0.4)

  return (
    <span
      className={`filter-blob filter-blob-${kind}`}
      data-visible={visible && Boolean(bounds)}
      data-slide={slide}
      style={bounds ? {
        width: bounds.width + 2 * extraX,
        height: bounds.height + 2 * extraY,
        transform: `translate3d(${bounds.x - extraX}px, ${bounds.y - extraY}px, 0)`,
      } : undefined}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" focusable="false">
        <path ref={pathRef} d={createBlobPath(index)} />
      </svg>
    </span>
  )
}

export default function ProjectFilters({ categories, selected, onSelect }) {
  const group = useRef(null)
  const selectedPath = useRef(null)
  const hoverPath = useRef(null)
  const [bounds, setBounds] = useState([])
  const [hover, setHover] = useState({ index: 0, visible: false, slide: false })
  const selectedIndex = categories.indexOf(selected)

  useLayoutEffect(() => {
    const element = group.current
    const buttons = [...element.querySelectorAll('button')]
    const measure = () => {
      setBounds(buttons.map((button) => ({
        x: button.offsetLeft - 6,
        y: button.offsetTop - 5,
        width: button.offsetWidth + 12,
        height: button.offsetHeight + 10,
      })))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    buttons.forEach((button) => observer.observe(button))
    measure()
    return () => observer.disconnect()
  }, [categories])

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = true
    let frame = null
    let lastPaint = 0
    const paint = (timestamp) => {
      const time = reducedMotion.matches ? 0 : timestamp / 1000
      selectedPath.current?.setAttribute('d', createBlobPath(selectedIndex, time))
      if (hover.visible) {
        hoverPath.current?.setAttribute('d', createBlobPath(hover.index, time + 3))
      }
    }
    const tick = (timestamp) => {
      if (timestamp - lastPaint >= 1000 / 30) {
        paint(timestamp)
        lastPaint = timestamp
      }
      frame = window.requestAnimationFrame(tick)
    }
    const updateAnimation = () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
      paint(performance.now())
      if (visible && !reducedMotion.matches && !document.hidden) {
        frame = window.requestAnimationFrame(tick)
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateAnimation()
    })
    observer.observe(group.current)
    reducedMotion.addEventListener('change', updateAnimation)
    document.addEventListener('visibilitychange', updateAnimation)
    updateAnimation()

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      observer.disconnect()
      reducedMotion.removeEventListener('change', updateAnimation)
      document.removeEventListener('visibilitychange', updateAnimation)
    }
  }, [selectedIndex, hover.index, hover.visible])

  const hideHover = () => setHover((current) => ({ ...current, visible: false }))
  const showHover = (index) => setHover((current) => ({
    index,
    visible: true,
    slide: current.visible && current.index !== selectedIndex,
  }))

  return (
    <div className="project-filters">
      <div
        className="project-filter-options"
        ref={group}
        role="group"
        aria-label="Filtrer les projets par domaine"
        onPointerLeave={hideHover}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) hideHover()
        }}
      >
        <FilterBlob
          kind="hover"
          bounds={bounds[hover.index]}
          index={hover.index}
          visible={hover.visible && hover.index !== selectedIndex}
          slide={hover.slide}
          pathRef={hoverPath}
        />
        <FilterBlob
          kind="selected"
          bounds={bounds[selectedIndex]}
          index={selectedIndex}
          pathRef={selectedPath}
        />
        {categories.map((name, index) => (
          <button
            key={name}
            type="button"
            aria-pressed={selected === name}
            onClick={() => onSelect(name)}
            onPointerEnter={(event) => {
              if (event.pointerType !== 'touch') showHover(index)
            }}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible')) {
                showHover(index)
              }
            }}
          >
            <span className="filter-label-space" aria-hidden="true">{name}</span>
            <span className="filter-label">{name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

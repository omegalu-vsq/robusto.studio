const contours = [
  'M0 42 C150 42 170 76 350 76 C530 76 570 24 740 24 C870 24 920 50 1000 50',
  'M0 68 C180 68 220 24 410 24 C600 24 690 82 850 82 C925 82 960 62 1000 62',
  'M0 36 C160 36 220 80 460 80 C700 80 730 26 890 26 C940 26 970 38 1000 38',
]

export default function SectionDivider({
  from,
  to,
  variant = 0,
  emphasis = false,
  subtle = false,
}) {
  const contour = contours[variant % contours.length]

  return (
    <div
      className={`section-divider${emphasis ? ' section-divider-emphasis' : ''}${subtle ? ' section-divider-subtle' : ''}`}
      style={{
        '--divider-from': `var(--${from})`,
        '--divider-to': `var(--${to})`,
        '--divider-line': to === 'dark' ? '#f4f0e233' : '#203c3226',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false">
        <path className="section-divider-fill" d={`${contour} L1000 101 H0 Z`} />
        {(from === to || emphasis) && (
          <path
            className="section-divider-edge"
            d={contour}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  )
}

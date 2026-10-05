import { Fragment, useEffect, useRef, useState } from 'react'
import SectionDivider from './components/SectionDivider'
import { categories, projects } from './data/projects'
import { checkRepositoryAccess, getGitHubRepository } from './lib/github'
import { createHeaderContour } from './lib/header-shapes'
import epitaLogo from '../assets/img/epitalogo.png'
import imageLogo from '../assets/img/imagelogo.png'
import './App.css'

function Arrow({ diagonal = false, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function ProjectLogo({ project }) {
  return (
    <div className="project-logo-surface">
      {project.logo && project.logoFrame ? (
        <svg
          className="project-logo-image"
          viewBox={project.logoFrame.viewBox}
          role="img"
          aria-label={`Logo ${project.name}`}
        >
          <image
            href={project.logo}
            width={project.logoFrame.width}
            height={project.logoFrame.height}
          />
        </svg>
      ) : project.logo ? (
        <img
          className="project-logo-image"
          src={project.logo}
          alt={`Logo ${project.name}`}
          loading="lazy"
        />
      ) : (
        <div className="project-wordmark" aria-label={project.name}>
          {(project.wordmark || [project.name]).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ResourceLink({ href, children, ...props }) {
  return (
    <a
      className="resource-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
      <Arrow diagonal />
    </a>
  )
}

function SourceCodeLink({ href, projectId }) {
  const repository = getGitHubRepository(href)
  const [check, setCheck] = useState({ href, status: 'checking' })
  const status = check.href === href ? check.status : 'checking'
  const statusId = `${projectId}-source-status`

  useEffect(() => {
    if (!repository) return
    let active = true
    checkRepositoryAccess(href).then((result) => {
      if (active) setCheck({ href, status: result })
    })
    return () => {
      active = false
    }
  }, [href, repository])

  if (!repository) return <ResourceLink href={href}>Code source</ResourceLink>

  const labels = {
    checking: 'Vérification de l’accès…',
    unavailable: 'Indisponible pour le moment',
    unknown: 'Vérification indisponible',
  }

  return (
    <div className="source-resource">
      {status === 'public' ? (
        <ResourceLink href={href}>Code source</ResourceLink>
      ) : (
        <button
          type="button"
          className="resource-link"
          disabled
          aria-describedby={statusId}
        >
          Code source <Arrow diagonal />
        </button>
      )}
      {status !== 'public' && (
        <div className="source-access-status">
          <span
            id={statusId}
            role="status"
            className={status === 'unavailable' ? 'source-unavailable' : undefined}
          >
            {labels[status]}
          </span>
        </div>
      )}
    </div>
  )
}

function ProjectResources({ project }) {
  const resources = [
    {
      url: project.sourceUrl,
      planned: project.sourcePlanned,
      label: 'Code source',
      isSource: true,
    },
    {
      url: project.reportUrl,
      planned: project.reportPlanned,
      label: project.reportLabel || 'Rapport PDF',
    },
    {
      url: project.slidesUrl,
      planned: project.slidesPlanned,
      label: 'Présentation',
    },
    {
      url: project.documentUrl,
      planned: project.documentPlanned,
      label: 'Document PDF',
    },
  ].filter((resource) => resource.url || resource.planned)
  if (!resources.length) return null
  return (
    <div className="project-resources">
      {resources.map((resource) =>
        resource.url ? (
          resource.isSource ? (
            <SourceCodeLink
              key={resource.label}
              href={resource.url}
              projectId={project.id}
            />
          ) : (
            <ResourceLink key={resource.label} href={resource.url}>
              {resource.label}
            </ResourceLink>
          )
        ) : (
          <span key={resource.label} className="resource-pending">
            {resource.label} à venir
          </span>
        ),
      )}
    </div>
  )
}

function MediaPending({ title, detail, kind = 'video' }) {
  return (
    <div className="media-pending">
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="26" height="22" rx="2" stroke="currentColor" />
        {kind === 'images' ? (
          <>
            <circle cx="11" cy="12" r="2" stroke="currentColor" />
            <path d="m4 23 8-8 6 6 5-5 6 7" stroke="currentColor" />
          </>
        ) : (
          <path d="m13 11 8 5-8 5Z" stroke="currentColor" />
        )}
      </svg>
      <p>
        <strong>{title}</strong>
        <span>{detail}</span>
      </p>
    </div>
  )
}

function MediaPreview({ project, onOpen }) {
  if (!project.media.length && !project.mediaKind) return null
  return (
    <div className="project-media">
      {project.media.length ? (
        project.media.map((media, i) =>
          media.type === 'pending' ? (
            <MediaPending
              key={media.alt}
              title={media.alt}
              detail={media.detail}
              kind={project.mediaKind}
            />
          ) : (
            <figure key={media.src || media.youtubeId}>
              {media.type === 'youtube' ? (
                <>
                  <iframe
                    width="560"
                    height="315"
                    src={
                      media.embedUrl ||
                      `https://www.youtube.com/embed/${media.youtubeId}`
                    }
                    title={media.alt}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <figcaption>
                    <span>
                      {String(i + 1).padStart(2, '0')} / {media.alt}
                    </span>
                    <a
                      href={`https://youtu.be/${media.youtubeId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir sur YouTube <Arrow diagonal />
                    </a>
                  </figcaption>
                  {media.note && <p className="media-note">{media.note}</p>}
                </>
              ) : (
                <>
                  <button
                    className="media-button"
                    onClick={() => onOpen({ project, media })}
                    aria-label={`Agrandir : ${media.alt}`}
                  >
                    <img src={media.src} alt={media.alt} loading="lazy" />
                    <span className="media-expand">
                      <Arrow diagonal />
                    </span>
                  </button>
                  <figcaption>{media.alt}</figcaption>
                </>
              )}
            </figure>
          ),
        )
      ) : (
        <MediaPending title="Illustrations du projet" detail="À venir" kind="images" />
      )}
    </div>
  )
}

function ProjectCard({ project, onOpen }) {
  return (
    <article
      id={project.id}
      className={`project project-${project.tone}`}
      aria-labelledby={`${project.id}-title`}
    >
      {project.category !== 'Projets divers' && (
        <div className="project-topline">
          <span>
            {project.number} / {project.category}
          </span>
          {project.date && <span>{project.date}</span>}
        </div>
      )}
      <div className="project-layout">
        <div className="project-identity">
          <ProjectLogo project={project} />
        </div>
        <div className="project-detail">
          <h3 id={`${project.id}-title`}>{project.name}</h3>
          <p className="project-description">{project.description}</p>
          <ul className="tech-list" aria-label="Technologies">
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <ProjectResources project={project} />
          <MediaPreview project={project} onOpen={onOpen} />
        </div>
      </div>
    </article>
  )
}

function Lightbox({ selected, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    if (!selected) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selected])
  if (!selected) return null
  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-labelledby="lightbox-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="lightbox-header">
        <h2 id="lightbox-title">{selected.project.name}</h2>
        <button onClick={onClose} autoFocus aria-label="Fermer l’aperçu">
          Fermer <span aria-hidden="true">×</span>
        </button>
      </div>
      <img src={selected.media.src} alt={selected.media.alt} />
      <p>{selected.media.alt}</p>
    </dialog>
  )
}

function HeaderShape({ side }) {
  const contour = createHeaderContour(side)

  return (
    <span className="header-corner-shape" data-header-shape={side} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path className="header-corner-fill" d={contour.fill} />
        <path
          className="header-corner-edge"
          d={contour.edge}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  )
}

function SiteHeader() {
  const header = useRef(null)

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY)
    let progress = Math.min(previousY / 160, 1)
    let frame = null
    const element = header.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const shapes = [...element.querySelectorAll('[data-header-shape]')].map(
      (shape) => ({
        side: shape.dataset.headerShape,
        fill: shape.querySelector('.header-corner-fill'),
        edge: shape.querySelector('.header-corner-edge'),
      }),
    )
    const paintShapes = (y) => {
      for (const shape of shapes) {
        const contour = createHeaderContour(
          shape.side,
          reducedMotion.matches ? 0 : y,
          reducedMotion.matches ? 0 : progress,
        )
        shape.fill.setAttribute('d', contour.fill)
        shape.edge.setAttribute('d', contour.edge)
      }
    }

    const update = () => {
      frame = null
      const y = Math.max(0, window.scrollY)
      progress =
        y === 0 ? 0 : Math.max(0, Math.min(1, progress + (y - previousY) / 160))
      previousY = y
      element.style.setProperty('--header-progress', progress.toFixed(4))
      paintShapes(y)
    }
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }

    element.style.setProperty('--header-progress', progress.toFixed(4))
    paintShapes(previousY)
    const onMotionChange = () => paintShapes(previousY)
    window.addEventListener('scroll', onScroll, { passive: true })
    reducedMotion.addEventListener('change', onMotionChange)
    return () => {
      window.removeEventListener('scroll', onScroll)
      reducedMotion.removeEventListener('change', onMotionChange)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="site-header-shell" ref={header}>
      <header className="site-header">
        <a
          className="site-brand header-corner header-corner-brand"
          href="#"
          aria-label="robusto.studio — accueil"
        >
          <HeaderShape side="brand" />
          <span className="site-brand-logo">
            <span className="site-brand-logo-motion">
              <img src="/wordmark-sofachrome.png" alt="robusto.studio" />
            </span>
          </span>
          <span className="site-brand-line" aria-hidden="true" />
          <span className="site-brand-caption-mask">
            <span className="site-brand-caption-motion">
              <span className="site-brand-caption">
                Portfolio de Lucas Estrade
              </span>
            </span>
          </span>
        </a>
        <nav
          className="header-corner header-corner-nav"
          aria-label="Navigation principale"
        >
          <HeaderShape side="nav" />
          <a className="nav-projects" href="#projets">
            Projets
          </a>
          <a className="nav-about" href="#a-propos">
            À propos
          </a>
          <a className="nav-contact" href="#contact">
            Contact
          </a>
        </nav>
      </header>
    </div>
  )
}

function App() {
  const [category, setCategory] = useState('Tous')
  const [selected, setSelected] = useState(null)
  const visibleProjects = projects.filter(
    (project) => category === 'Tous' || project.category === category,
  )
  const mainProjects = visibleProjects.filter(
    (project) => project.category !== 'Projets divers',
  )
  const otherProjects = visibleProjects.filter(
    (project) => project.category === 'Projets divers',
  )
  const projectCount = String(projects.length).padStart(2, '0')

  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="main">
        <section
          id="projets"
          className="projects-section"
          aria-labelledby="projects-title"
        >
          <div className="projects-intro">
            <div className="section-title">
              <h1 id="projects-title">Projets.</h1>
            </div>
          </div>
          <div
            className="project-filters"
            role="group"
            aria-label="Filtrer les projets par domaine"
          >
            {categories.map((name) => (
              <button
                key={name}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
                {name === 'Tous' && <span>{projectCount}</span>}
              </button>
            ))}
          </div>
          <div className="project-list">
            {mainProjects.map((project, index) => (
              <Fragment key={project.id}>
                {(index > 0 || project.tone !== 'cream') && (
                  <SectionDivider
                    from={mainProjects[index - 1]?.tone || 'cream'}
                    to={project.tone}
                    variant={Number(project.number)}
                  />
                )}
                <ProjectCard project={project} onOpen={setSelected} />
              </Fragment>
            ))}
          </div>
          {otherProjects.length > 0 && (
            <section
              className={`other-projects${mainProjects.length ? ' other-projects-with-main' : ''}`}
              aria-labelledby="other-projects-title"
            >
              <SectionDivider
                from={mainProjects.at(-1)?.tone || 'cream'}
                to="dark"
                variant={1}
                emphasis
              />
              <div className="other-projects-banner">
                <div className="other-projects-heading">
                  <div>
                    <h2 id="other-projects-title">Projets divers.</h2>
                    <p>Systèmes, compilation, accessibilité et typographie.</p>
                  </div>
                </div>
              </div>
              <SectionDivider from="dark" to="sage" variant={2} />
              <div className="other-projects-list">
                <SectionDivider from="sage" to="cream" />
                {otherProjects.map((project, index) => (
                  <Fragment key={project.id}>
                    {index > 0 && (
                      <SectionDivider
                        from="cream"
                        to="cream"
                        variant={Number(project.number)}
                        subtle
                      />
                    )}
                    <ProjectCard project={project} onOpen={setSelected} />
                  </Fragment>
                ))}
                <SectionDivider from="cream" to="sage" variant={1} />
              </div>
            </section>
          )}
        </section>
        <SectionDivider
          from={
            otherProjects.length ? 'sage' : mainProjects.at(-1)?.tone || 'cream'
          }
          to="cream"
          variant={2}
        />
        <section id="a-propos" className="about" aria-labelledby="about-title">
          <div className="about-title">
            <p className="about-label">À propos</p>
            <h2 id="about-title">
              Lucas{' '}
              <span className="about-name-end">
                Estrade.
                <span className="about-affiliations">
                  <img
                    className="about-affiliation-logo"
                    src={epitaLogo}
                    alt="EPITA"
                    width="1924"
                    height="1310"
                    loading="lazy"
                  />
                  <img
                    className="about-affiliation-logo"
                    src={imageLogo}
                    alt="Majeure IMAGE"
                    width="1084"
                    height="1084"
                    loading="lazy"
                  />
                </span>
              </span>
            </h2>
            <p className="about-role">
              Élève ingénieur à EPITA · Majeure IMAGE
            </p>
            <p className="about-search">
              À la recherche d’un stage de fin d’études de 6 mois dans
              l’informatique graphique et le traitement d’image à partir de
              février 2027.
            </p>
            <a
              className="text-link"
              href="/cv-lucas-estrade.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Consulter mon CV <Arrow diagonal />
            </a>
          </div>
          <div className="about-copy">
            <p>
              Curieux et passionné par plusieurs aspects de l’informatique, je
              suis surtout intéressé par la synthèse et le traitement d’image.
              Je suis également un grand passionné des transports en commun
              depuis mon enfance. Outre ces deux passions, j’aime beaucoup le
              cinéma d’auteur et jouer au tennis.
            </p>
            <div className="about-facts">
              <div>
                <span>Formation</span>
                <strong>EPITA · Majeure IMAGE</strong>
              </div>
              <div>
                <span>Localisation</span>
                <strong>Bourg-la-Reine, France</strong>
              </div>
            </div>
          </div>
        </section>
        <SectionDivider from="cream" to="dark" />
        <footer id="contact" className="contact">
          <div className="contact-top">
            <span className="availability">
              <span className="status-dot" /> Stage de fin d’études · Février
              2027
            </span>
          </div>
          <a className="contact-heading" href="mailto:pclucas@outlook.fr">
            Me contacter
            <Arrow diagonal />
          </a>
          <div className="contact-links">
            <a href="mailto:pclucas@outlook.fr">
              pclucas@outlook.fr <Arrow diagonal />
            </a>
            <div>
              <a
                href="https://github.com/omegalu-vsq"
                target="_blank"
                rel="noreferrer"
              >
                GitHub <Arrow diagonal />
              </a>
              <a
                href="https://www.linkedin.com/in/lucas-estrade-blr/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <Arrow diagonal />
              </a>
              <a
                href="https://www.youtube.com/@omegalu"
                target="_blank"
                rel="noreferrer"
              >
                YouTube <Arrow diagonal />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <img src="/wordmark-sofachrome.png" alt="robusto.studio" />
            <span>© {new Date().getFullYear()} Lucas Estrade</span>
            <a href="#">Retour en haut ↑</a>
          </div>
        </footer>
      </main>
      <Lightbox selected={selected} onClose={() => setSelected(null)} />
    </>
  )
}

export default App

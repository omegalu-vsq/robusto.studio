import fastlaneLogo from '../../assets/img/fastlanelogo.png'
import metroglLogo from '../../assets/img/metrogllogo.png'
import chromauraLogo from '../../assets/img/chromauralogo.png'
import ivokSignalsLogo from '../../assets/img/ivoksignalslogo.png'
import awakenMemoryLogo from '../../assets/img/awakenmemorylogo.png'
import awakenMemoryCover from '../../assets/img/awakenmemoryboxcover.png'
import raytracerIllustration from '../../assets/img/ray.png'
import pbrDemo from '../../assets/img/repr.gif'
import sudokuLogo from '../../assets/img/sudokusolverlogo.png'
import cataractorLogo from '../../assets/img/cataractorlogonew.png'
import ivokEditorLogo from '../../assets/img/ivoklogo.png'
import latexLogo from '../../assets/img/latex-logo.svg'
import fastlaneManual from '../../assets/pdf/ISIM___Fastlane_Engine_Manuel.pdf?url'
import fastlaneSlides from '../../assets/pdf/FastlaneSlides.pdf?url'
import metroglManual from '../../assets/pdf/POGL___MétroGL_Manuel.pdf?url'
import chromauraManual from '../../assets/pdf/CFW___ChromAura_Manuel.pdf?url'
import awakenMemoryReport from '../../assets/pdf/Anluda_Games___Rapport_de_Soutenance_3_2023.pdf?url'
import sudokuReport from '../../assets/pdf/The_Sudo_Pacman_project___Rapport_Final.pdf?url'
import typographyDocument from '../../assets/pdf/Projet_TYPO.pdf?url'

// Les URLs et médias disponibles sont renseignés ; les fichiers à venir restent null.
// Image : { type: 'image', src: '/projects/fastlane/apercu.webp', alt: '…' }
// Vidéo : { type: 'youtube', youtubeId: 'IDENTIFIANT', alt: '…' }
// tone : couleur de toute la section, choisie pour le contraste du logo.
// logoFrame : cadrage SVG des marges transparentes, sans modifier le PNG original.
export const categories = [
  'Tous',
  'Synthèse d’image',
  'Traitement & vision',
  'Jeu vidéo',
  'Projets divers',
]

export const projects = [
  {
    id: 'fastlane',
    name: 'Fastlane Engine',
    wordmark: ['FASTLANE', 'ENGINE'],
    date: '2026',
    category: 'Synthèse d’image',
    discipline: 'Moteur de rendu · Pseudo-3D',
    description: `Moteur de rendu développé en C++ conçu pour calculer et afficher des routes dites "pseudo-3D".
      Le moteur est capable d'afficher des virages, des montagnes, des sprites de décoration,
      ainsi que plusieurs couches pour le ciel/fond, dont on peut régler la vitesse de défilement selon les virages pour
      créer un effet de parallaxe. Il est également possible de plaquer des images/sprites sur la surface projetée.

      Le manuel détaille comment prendre en main le projet, tandis que les transparents comportent des schémas et les
      formules utilisées dans le code.`,
    technologies: ['C++'],
    tone: 'cream',
    logo: fastlaneLogo,
    logoFrame: { viewBox: '27 113 1455 348', width: 1482, height: 490 },
    sourceUrl: 'https://github.com/omegalu-vsq/fastlane',
    reportUrl: fastlaneManual,
    reportLabel: 'Manuel',
    slidesUrl: fastlaneSlides,
    media: [
      {
        type: 'pending',
        alt: 'Démonstration complète',
        detail: 'Vidéo en préparation',
      },
      {
        type: 'youtube',
        youtubeId: '_Zywu5EYRPg',
        alt: 'Fastlane Engine — Nobody Here',
      },
    ],
  },
  {
    id: 'metrogl',
    name: 'MétroGL',
    wordmark: ['Métro', 'GL'],
    date: '2026',
    category: 'Synthèse d’image',
    discipline: 'Temps réel · Environnement 3D',
    description:
      `Reproduction d'une station de métro parisienne typique avec son fameux carrelage blanc biseauté.
      Celle-ci est reconstruite et rendue en temps réel, avec des modèles réalisés sur Blender, un rendu OpenGL et des shaders en GLSL.
      Le rendu utilise un modèle d'éclairage Lambert-Phong.`,
    technologies: ['C++', 'OpenGL', 'GLSL', 'Blender'],
    tone: 'sage',
    logo: metroglLogo,
    logoFrame: { viewBox: '8 65 1435 352', width: 1445, height: 558 },
    sourceUrl: 'https://github.com/omegalu-vsq/metro-gl',
    reportUrl: metroglManual,
    reportLabel: 'Manuel',
    media: [
      {
        type: 'youtube',
        youtubeId: 'sUi2SdhL95M',
        alt: 'Démonstration de MétroGL',
      },
    ],
  },
  {
    id: 'pbr',
    name: 'Moteur photoréaliste',
    wordmark: ['PBR', 'renderer.'],
    date: '2026',
    category: 'Synthèse d’image',
    discipline: 'Rendu physique · Lumière & matière',
    description:
      'Moteur de rendu PBR avec une BRDF diffuse de Lambert, une BRDF spéculaire de Cook–Torrance GGX et un éclairage basé sur l’environnement (IBL).',
    technologies: [
      'TypeScript',
      'WebGL',
      'Lambert',
      'Cook–Torrance GGX',
      'IBL',
    ],
    tone: 'cream',
    logo: null,
    sourceUrl: null,
    mediaKind: 'images',
    media: [
      {
        type: 'image',
        src: pbrDemo,
        alt: 'Démonstration du moteur photoréaliste.',
        width: 800,
        height: 398,
      },
    ],
  },
  {
    id: 'raytracer',
    name: 'Raytracer C++',
    wordmark: ['Raytracer.'],
    date: '2026',
    category: 'Synthèse d’image',
    discipline: 'Ray tracing · Éclairage Lambert–Phong',
    description:
      'Raytracer développé en C++ avec un modèle d’éclairage Lambert–Phong.',
    technologies: ['C++'],
    tone: 'dark',
    logo: null,
    sourceUrl: 'https://github.com/omegalu-vsq/raytracer',
    mediaKind: 'images',
    media: [
      {
        type: 'image',
        src: raytracerIllustration,
        alt:
          'La sphère jade à gauche a un fort coefficient diffus, tandis que la sphère bleue à droite a un fort coefficient spéculaire.',
        width: 1920,
        height: 1080,
      },
    ],
  },
  {
    id: 'chromaura',
    name: 'ChromAura',
    wordmark: ['Chrom', 'Aura'],
    date: '2026',
    category: 'Traitement & vision',
    discipline: 'Installation · Interaction corporelle',
    description:`
      Expérience visuelle interactive avec capteur Kinect, conçue avec Godot en C#. L'objectif était de créer une expérience facilement utilisable et
      configurable pour l'exposer lors des portes ouvertes de l'école. Le programme détecte la silhouette des utilisateurs et la
      reconstruit avec des particules brillantes animées. La position des doigts est également détectée, ce qui permet par exemple de dessiner
      en levant le doigt, ou bien de déclancher diverses animations telles que le coeur ou le pistolet.`,
    technologies: ['Godot', 'C#', 'Kinect', 'MediaPipe'],
    tone: 'sage',
    logo: chromauraLogo,
    logoFrame: { viewBox: '0 0 1586 284', width: 1587, height: 284 },
    sourceUrl: 'https://github.com/Ggabin018/ChromAura',
    reportUrl: chromauraManual,
    reportLabel: 'Manuel',
    media: [
      {
        type: 'youtube',
        youtubeId: '2IRo9NuWq-4',
        embedUrl:
          'https://www.youtube.com/embed/2IRo9NuWq-4?si=LqqsBH3w39oRXlvX',
        alt: 'Démonstration de ChromAura',
        note:
          'N’hésitez pas à régler la qualité de la vidéo sur 1440p pour limiter les effets de la compression YouTube.',
      },
    ],
  },
  {
    id: 'ivok-signals',
    name: 'IVoK Signals',
    wordmark: ['IVoK', 'SIGNALS'],
    date: '2026',
    category: 'Traitement & vision',
    discipline: 'Vision par ordinateur · Classification',
    description:
      'Détection et classification de panneaux routiers par traitement d’image et apprentissage automatique, avec OpenCV et HOG/SVM.',
    technologies: ['Python', 'C++', 'OpenCV', 'HOG', 'SVM'],
    tone: 'cream',
    logo: ivokSignalsLogo,
    logoFrame: { viewBox: '64 13 1552 704', width: 1672, height: 851 },
    sourceUrl: null,
    mediaKind: 'images',
    media: [],
  },
  {
    id: 'cataractor',
    name: 'CATARACTOR',
    wordmark: ['CATARACTOR'],
    date: '2026',
    category: 'Traitement & vision',
    discipline: 'MedViz · Visualisation médicale',
    description:
      'Application d’assistance médicale pour la détection de la cataracte par machine learning.',
    technologies: ['Python', 'SVM'],
    tone: 'dark',
    logo: cataractorLogo,
    logoFrame: { viewBox: '367 468 1286 130', width: 1920, height: 1080 },
    sourceUrl: 'https://github.com/AndreaIzzillo/Cataractor',
    reportUrl: null,
    media: [
      {
        type: 'youtube',
        youtubeId: '6IL0gQ0oAuE',
        embedUrl: 'https://www.youtube.com/embed/6IL0gQ0oAuE?list=PLQ6KNnC6liH0',
        alt: 'Cataractor — EPITA IMAGE 2027',
      },
    ],
  },
  {
    id: 'awaken-memory',
    name: 'Awaken Memory',
    wordmark: ['Awaken', 'Memory'],
    date: '2022 — 2023',
    category: 'Jeu vidéo',
    discipline: 'Jeu vidéo · RPG en 2D',
    description:
      'Jeu de rôle en 2D au tour par tour, conçu sur Unity et développé en C#.',
    technologies: ['Unity', 'C#'],
    tone: 'sage',
    logo: awakenMemoryLogo,
    logoFrame: { viewBox: '7 12 1221 484', width: 1232, height: 501 },
    sourceUrl: null,
    reportUrl: awakenMemoryReport,
    cover: {
      src: awakenMemoryCover,
      alt: 'Jaquette d’Awaken Memory parodiant une jaquette de Nintendo Switch.',
    },
    media: [
      {
        type: 'pending',
        alt: 'Démonstration d’Awaken Memory',
        detail: 'Vidéo en préparation',
      },
    ],
  },
  {
    id: 'sudoku-solver',
    name: 'Sudoku Solver',
    wordmark: ['SUDOKU', 'SOLVER'],
    date: '2023',
    category: 'Traitement & vision',
    discipline: 'Reconnaissance · Résolution automatique',
    description:
      'Résolveur automatique de sudoku avec détection de formes et réseau de neurones, écrit en C.',
    technologies: ['C'],
    tone: 'cream',
    logo: sudokuLogo,
    logoFrame: { viewBox: '16 18 1046 135', width: 1065, height: 160 },
    sourceUrl: 'https://github.com/JohanBourdais1/OCR',
    reportUrl: sudokuReport,
    media: [],
  },
  {
    id: '42sh',
    name: '42sh',
    wordmark: ['42sh'],
    date: '2025',
    category: 'Projets divers',
    discipline: 'Système · Shell Unix',
    description:
      `Shell écrit en C, avec conception d'un lexer, d'un parser et d'un arbre syntaxique abstrait (AST).`,
    technologies: ['C', 'AST', 'Lexer', 'Parser'],
    tone: 'dark',
    logo: null,
    sourceUrl: null,
    media: [],
  },
  {
    id: 'tiger',
    name: 'Tiger',
    wordmark: ['Tiger'],
    date: '2025',
    category: 'Projets divers',
    discipline: 'Compilation · Langage Tiger',
    description:
      `Compilateur du langage Tiger développé en C++ à partir d'une base de code,
      avec Bison pour l’analyse syntaxique et Flex pour l’analyse lexicale.`,
    technologies: ['C++', 'Bison', 'Flex'],
    tone: 'sage',
    logo: null,
    sourceUrl: null,
    media: [],
  },
  {
    id: 'ivok-editor',
    name: 'IVoK Editor',
    wordmark: ['IVoK', 'EDITOR'],
    date: '2025',
    category: 'Projets divers',
    discipline: 'Accessibilité · Environnement de développement',
    description:
      'IDE web destiné aux personnes tétraplégiques, avec une fonctionnalité de reconnaissance vocale.',
    technologies: ['React'],
    tone: 'cream',
    logo: ivokEditorLogo,
    logoFrame: { viewBox: '158 245 1254 495', width: 1500, height: 1000 },
    sourceUrl: null,
    media: [],
  },
  {
    id: 'typographie-ratp',
    name: 'Étude typographique',
    wordmark: ['TYPO'],
    date: '2025',
    category: 'Projets divers',
    discipline: 'Typographie · Mise en page',
    description:
      'Travail de typographie et de mise en page en LaTeX.',
    technologies: ['LaTeX'],
    tone: 'sage',
    logo: latexLogo,
    logoFrame: { viewBox: '0 0 1200 500', width: 1200, height: 500 },
    sourceUrl: null,
    documentUrl: typographyDocument,
    media: [],
  },
].map((project, index) => ({
  ...project,
  number: String(index + 1).padStart(2, '0'),
}))

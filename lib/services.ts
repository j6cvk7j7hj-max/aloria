export const services = [
  {
    slug: 'space-planning',
    number: '01',
    title: 'Space Planning',
    description:
      'A tailored furniture layout created to maximize flow, comfort, and function.',
    headline: 'A room that flows beautifully starts with the right layout.',
    intro:
      "Receive a custom furniture plan created around your room's dimensions, lifestyle, and needs, giving you a clear foundation for designing your space with confidence.",
    alt: 'An overhead furniture floor plan with neutral fabric samples and architectural tools',
    includes: [
      'Custom furniture layout',
      'Scaled floor plan',
      'Recommended furniture placement',
      'Circulation and flow consideration',
      'One revision',
    ],
    steps: [
      [
        'Submit Your Space',
        'Share your measurements, room photos, and how you would like the space to work.',
      ],
      [
        'Design Begins',
        'Your layout is thoughtfully developed around the proportions of your room and everyday life.',
      ],
      [
        'Receive Your Plan',
        'Receive a clear furniture plan, with one revision to refine the details.',
      ],
    ],
    preparation:
      'Room measurements, ceiling height, window and door dimensions, door swing directions, and any important outlets. Include measurements of furniture you want to keep, photos from each corner, your style preferences, and how many people use the room.',
    cta: 'PLAN YOUR SPACE',
  },
  {
    slug: 'concept-board',
    number: '02',
    title: 'Concept Board',
    description:
      'A curated collection of colors, materials, and inspiration that brings your design vision together.',
    headline: 'A clear visual direction for your space.',
    intro:
      'Bring your ideas into focus with a considered palette of colors, materials, and inspiration. Your concept board creates a cohesive starting point for a room that feels like you.',
    alt: 'A tactile concept board with interior inspiration, warm wood, marble, linen, and brass',
    includes: [
      'A considered color palette',
      'Textures and materials',
      'Inspiration imagery',
      'Overall mood and design direction',
      'One revision',
    ],
    steps: [
      [
        'Share Your Inspiration',
        'Tell us about your room, the styles you love, and the details you want to keep.',
      ],
      [
        'Your Direction Takes Shape',
        'Colors, textures, and materials are brought together into a cohesive visual concept.',
      ],
      [
        'Receive Your Board',
        'Explore your room’s direction, with one revision to bring the vision into focus.',
      ],
    ],
    preparation:
      'Room photos, preferred styles, inspiration images or a Pinterest board, colors you love or would rather avoid, and any existing elements that must remain.',
    cta: 'FIND YOUR DIRECTION',
  },
  {
    slug: 'furniture-curation',
    number: '03',
    title: 'Furniture Curation',
    description:
      'Curated furniture and décor recommendations tailored to your style, space, and budget.',
    headline: 'The right pieces, thoughtfully selected.',
    intro:
      'Create a room that feels collected and cohesive with furniture and décor chosen for your space. Receive considered recommendations and sourcing links so you can make each selection with confidence.',
    alt: 'Coordinated furniture selections with a classic chair, sofa, console, table, and fabric samples',
    includes: [
      'Furniture recommendations',
      'Décor recommendations',
      'Coordinated selections',
      'Shopping and sourcing links',
      'Recommendations based on your budget',
      'Optional alternatives',
    ],
    steps: [
      [
        'Tell Us What You Need',
        'Share your space, budget, style, and the pieces you would like to keep.',
      ],
      [
        'Your Pieces Are Curated',
        'Furniture and décor are selected to work together beautifully in your room.',
      ],
      [
        'Receive Your Selections',
        'Receive curated recommendations and shopping links to purchase at your own pace.',
      ],
    ],
    preparation:
      'Room photos and dimensions, your furnishing budget, style inspiration, and the dimensions of any existing pieces you would like to keep.',
    note: 'This service provides curated recommendations and sourcing links. Purchasing, delivery, and installation are arranged by you.',
    cta: 'CURATE YOUR ROOM',
  },
  {
    slug: 'signature-design',
    number: '04',
    title: 'Signature Design',
    description:
      'A complete design experience, thoughtfully curated from first ideas to final selections.',
    headline:
      'Your room, thoughtfully designed from concept to final selections.',
    intro:
      'Our most comprehensive design service brings the whole room together. From a thoughtful layout and a cohesive concept to furniture, materials, and finishing details, every selection belongs to one considered vision.',
    alt: 'A complete design concept with a room plan, finished interior inspiration, marble, wood, and furnishings',
    includes: [
      'A thoughtful space plan',
      'Concept and mood board',
      'Furniture curation',
      'Material suggestions',
      'Décor selections',
      'A coordinated shopping list',
      'Revisions',
      'Complete room direction',
    ],
    steps: [
      [
        'Share Your Vision',
        'Tell us how you live, what you love, and what you want your room to become.',
      ],
      [
        'Your Room Comes Together',
        'The layout, concept, materials, and furnishings are developed as one cohesive design.',
      ],
      [
        'Receive Your Design',
        'Receive your complete room direction and shopping list, with revisions to refine the details.',
      ],
    ],
    preparation:
      'Room measurements, photos from each corner, inspiration, your budget and timeline, and details of any furniture or architectural elements that will remain.',
    cta: 'DESIGN YOUR ROOM',
  },
] as const;
export const serviceSlugs = [
  'space-planning',
  'concept-board',
  'furniture-curation',
  'signature-design',
  'not-sure',
] as const;

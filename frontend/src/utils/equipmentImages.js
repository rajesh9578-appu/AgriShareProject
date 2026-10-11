// ==============================================================================
// AGRISHARE - CURATED AGRICULTURAL EQUIPMENT IMAGE REGISTRY
// High-resolution, accurately matched photos for each equipment category & name
// ==============================================================================

export const CATEGORY_IMAGE_MAP = {
  'Tractor': [
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80', // Red Farm Tractor
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80', // Green Farm Tractor in field
    'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?w=800&auto=format&fit=crop&q=80', // Tractor plowing
    'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80'  // Modern heavy tractor
  ],
  'Rotavator': [
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80', // Rotary tiller & soil preparation
    'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&auto=format&fit=crop&q=80', // Heavy soil cultivation tiller
    'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=800&auto=format&fit=crop&q=80'  // Rotary ploughing
  ],
  'Combine Harvester': [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80', // Combine Harvester in golden field
    'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=800&auto=format&fit=crop&q=80', // Crop harvesting machinery
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'  // Field harvest action
  ],
  'Sprayer': [
    'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80', // Tractor Boom Sprayer misting crops
    'https://images.unsplash.com/photo-1508873696983-2df57046475b?w=800&auto=format&fit=crop&q=80', // Agricultural pesticide rig
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'  // Drone / Crop care sprayer
  ],
  'Seed Drill': [
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80', // Paddy mechanical transplanter field
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop&q=80', // Seed sowing & drilling machine
    'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800&auto=format&fit=crop&q=80'  // Seedlings transplantation
  ],
  'Water Pump': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80', // Farm water canal & pump irrigation
    'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=800&auto=format&fit=crop&q=80', // Irrigation water flow & pump system
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'  // Field watering setup
  ],
  'Drip Irrigation': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80', // Micro irrigation & crop watering
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'  // Drip irrigation layout
  ],
  'Drip Irrigation Equipment': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'
  ],
  'Agricultural Transport': [
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80', // Farm transport haulage vehicle
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'  // Heavy agricultural haulage
  ],
  'Storage Space': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80', // Agricultural warehouse storage
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=80'  // Barn & crop store
  ]
};

// Default fallback if category is unknown
export const GLOBAL_DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';

/**
 * Returns the best matching image URL for a given resource or category/name.
 */
export function getEquipmentImage(resourceOrCategory, name = '') {
  if (!resourceOrCategory) return GLOBAL_DEFAULT_IMAGE;

  let category = '';
  let itemName = name;
  let photos = [];

  if (typeof resourceOrCategory === 'object') {
    photos = resourceOrCategory.photos || [];
    category = resourceOrCategory.category || '';
    itemName = resourceOrCategory.name || '';
    if (photos.length > 0 && photos[0] && typeof photos[0] === 'string' && photos[0].startsWith('http')) {
      return photos[0];
    }
  } else {
    category = resourceOrCategory;
  }

  // Name keyword heuristics
  const nameLower = (itemName || '').toLowerCase();
  const catLower = (category || '').toLowerCase();

  if (nameLower.includes('harvester') || catLower.includes('harvester')) {
    return CATEGORY_IMAGE_MAP['Combine Harvester'][0];
  }
  if (nameLower.includes('rotavator') || nameLower.includes('tiller') || catLower.includes('rotavator')) {
    return CATEGORY_IMAGE_MAP['Rotavator'][0];
  }
  if (nameLower.includes('spray') || catLower.includes('spray')) {
    return CATEGORY_IMAGE_MAP['Sprayer'][0];
  }
  if (nameLower.includes('transplanter') || nameLower.includes('seed') || catLower.includes('seed drill')) {
    return CATEGORY_IMAGE_MAP['Seed Drill'][0];
  }
  if (nameLower.includes('pump') || catLower.includes('pump') || nameLower.includes('water')) {
    return CATEGORY_IMAGE_MAP['Water Pump'][0];
  }
  if (nameLower.includes('drip') || catLower.includes('drip') || catLower.includes('irrigation')) {
    return CATEGORY_IMAGE_MAP['Drip Irrigation'][0];
  }
  if (nameLower.includes('transport') || nameLower.includes('trolley') || catLower.includes('transport')) {
    return CATEGORY_IMAGE_MAP['Agricultural Transport'][0];
  }
  if (nameLower.includes('storage') || nameLower.includes('warehouse') || catLower.includes('storage')) {
    return CATEGORY_IMAGE_MAP['Storage Space'][0];
  }
  if (catLower.includes('tractor') || nameLower.includes('tractor') || nameLower.includes('mahindra')) {
    return CATEGORY_IMAGE_MAP['Tractor'][0];
  }

  // Direct category lookup
  if (CATEGORY_IMAGE_MAP[category] && CATEGORY_IMAGE_MAP[category].length > 0) {
    return CATEGORY_IMAGE_MAP[category][0];
  }

  return GLOBAL_DEFAULT_IMAGE;
}

// Preset gallery for Owner Add/Edit Resource page
export const PHOTO_PRESETS = [
  {
    label: '🚜 Tractor (Mahindra / Swaraj)',
    category: 'Tractor',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🚜 Tractor (John Deere Green)',
    category: 'Tractor',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '⚙️ Rotavator / Rotary Tiller',
    category: 'Rotavator',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🌾 Combine Harvester (Paddy / Multi-Crop)',
    category: 'Combine Harvester',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🌧️ Boom Sprayer / Crop Protection Rig',
    category: 'Sprayer',
    url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🌱 Paddy Transplanter / Seed Drill',
    category: 'Seed Drill',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '💧 Diesel Irrigation Water Pump',
    category: 'Water Pump',
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🚚 Agricultural Transport Trolley',
    category: 'Agricultural Transport',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: '🏢 Warehouse Storage Space',
    category: 'Storage Space',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  }
];

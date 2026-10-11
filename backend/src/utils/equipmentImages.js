// ==============================================================================
// AGRISHARE BACKEND - EQUIPMENT IMAGE REGISTRY
// ==============================================================================

const CATEGORY_IMAGE_MAP = {
  'Tractor': [
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80'
  ],
  'Rotavator': [
    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&auto=format&fit=crop&q=80'
  ],
  'Combine Harvester': [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=800&auto=format&fit=crop&q=80'
  ],
  'Sprayer': [
    'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508873696983-2df57046475b?w=800&auto=format&fit=crop&q=80'
  ],
  'Seed Drill': [
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop&q=80'
  ],
  'Water Pump': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=800&auto=format&fit=crop&q=80'
  ],
  'Drip Irrigation Equipment': [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80'
  ],
  'Agricultural Transport': [
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'
  ],
  'Storage Space': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  ]
};

const GLOBAL_DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80';

function getDefaultEquipmentImage(category, name = '') {
  const nameLower = (name || '').toLowerCase();
  const catLower = (category || '').toLowerCase();

  if (nameLower.includes('harvester') || catLower.includes('harvester')) {
    return CATEGORY_IMAGE_MAP['Combine Harvester'];
  }
  if (nameLower.includes('rotavator') || nameLower.includes('tiller') || catLower.includes('rotavator')) {
    return CATEGORY_IMAGE_MAP['Rotavator'];
  }
  if (nameLower.includes('spray') || catLower.includes('spray')) {
    return CATEGORY_IMAGE_MAP['Sprayer'];
  }
  if (nameLower.includes('transplanter') || nameLower.includes('seed') || catLower.includes('seed drill')) {
    return CATEGORY_IMAGE_MAP['Seed Drill'];
  }
  if (nameLower.includes('pump') || catLower.includes('pump') || nameLower.includes('water')) {
    return CATEGORY_IMAGE_MAP['Water Pump'];
  }
  if (nameLower.includes('drip') || catLower.includes('drip') || catLower.includes('irrigation')) {
    return CATEGORY_IMAGE_MAP['Drip Irrigation Equipment'];
  }
  if (nameLower.includes('transport') || nameLower.includes('trolley') || catLower.includes('transport')) {
    return CATEGORY_IMAGE_MAP['Agricultural Transport'];
  }
  if (nameLower.includes('storage') || nameLower.includes('warehouse') || catLower.includes('storage')) {
    return CATEGORY_IMAGE_MAP['Storage Space'];
  }
  if (catLower.includes('tractor') || nameLower.includes('tractor')) {
    return CATEGORY_IMAGE_MAP['Tractor'];
  }

  return CATEGORY_IMAGE_MAP[category] || [GLOBAL_DEFAULT_IMAGE];
}

module.exports = {
  CATEGORY_IMAGE_MAP,
  GLOBAL_DEFAULT_IMAGE,
  getDefaultEquipmentImage
};

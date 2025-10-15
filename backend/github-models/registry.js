/**
 * Model registry - merges discovery with fallback catalog
 */

const { discoverModels } = require('./discovery');
const { getFilePolicy } = require('./filePolicy');

/**
 * Fallback model catalog
 */
const FALLBACK_MODELS = [
  'gpt-5',
  'gpt-4.0',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.1',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-mini',
  'claude-4.5',
  'claude-4',
  'claude-3-5-sonnet',
  'claude-3-opus',
  'claude-3-haiku',
  'claude-2.1'
];

/**
 * Prettify model name
 */
function prettifyModelName(modelId) {
  let name = modelId
    .replace(/^(openai\/|anthropic\/|meta\/|google\/|mistral\/)/, '')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return name;
}

/**
 * Infer provider from model ID
 */
function inferProvider(modelId) {
  const id = modelId.toLowerCase();
  
  if (id.includes('gpt')) return 'openai';
  if (id.includes('claude')) return 'anthropic';
  if (id.includes('gemini')) return 'google';
  if (id.includes('llama')) return 'meta';
  if (id.includes('mistral')) return 'mistral';
  
  return 'unknown';
}

/**
 * Check if model supports images
 */
function supportsImages(modelId) {
  const id = modelId.toLowerCase();
  
  const imagePatterns = [
    '4o',
    '4.0',
    'mini',
    'vision',
    'claude-3',
    'claude-4'
  ];
  
  return imagePatterns.some(pattern => id.includes(pattern));
}

/**
 * Get models list (discovered or fallback)
 */
async function getModels(pat) {
  // Try discovery first
  const discovered = await discoverModels(pat);
  
  if (discovered && discovered.length > 0) {
    console.log(`✅ [GITHUB MODELS] Returning ${discovered.length} discovered models`);
    return discovered;
  }
  
  // Fallback to catalog
  console.warn('⚠️ [GITHUB MODELS] Using fallback catalog');
  const fallbackModels = FALLBACK_MODELS.map(modelId => {
    const provider = inferProvider(modelId);
    const filePolicy = getFilePolicy(modelId);
    
    return {
      id: modelId,
      displayName: prettifyModelName(modelId),
      provider,
      capabilities: {
        text: true,
        images: supportsImages(modelId)
      },
      filePolicy,
      available: false // Not confirmed available
    };
  });
  
  return fallbackModels;
}

module.exports = {
  getModels,
  FALLBACK_MODELS
};

/**
 * Model registry - curated list of verified working GitHub Models
 */

/**
 * Verified working models for GitHub Models
 * Only includes models that have been tested and confirmed to work
 */
const FALLBACK_MODELS = [
  // OpenAI GPT series
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-5',
  'o1-mini',
  
  // Meta Llama series
  'llama-3.2-90b-vision-instruct',
  'llama-3.2-11b-vision-instruct',
  
  // Mistral AI series
  'mistral-large-2411',
  'mistral-small',
  'mistral-nemo',
  
  // Microsoft Phi series
  'phi-4'
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
  
  if (id.includes('gpt') || id.includes('o1')) return 'openai';
  if (id.includes('claude')) return 'anthropic';
  if (id.includes('gemini')) return 'google';
  if (id.includes('llama')) return 'meta';
  if (id.includes('mistral')) return 'mistral';
  if (id.includes('cohere')) return 'cohere';
  if (id.includes('ai21') || id.includes('jamba')) return 'ai21';
  if (id.includes('phi')) return 'microsoft';
  
  return 'unknown';
}

/**
 * Get models list
 * Returns the curated list of working models
 */
async function getModels(pat) {
  if (!pat) {
    console.warn('⚠️ [GITHUB MODELS] No PAT configured');
  }
  
  // Use the hardcoded list of verified working models
  const modelIds = FALLBACK_MODELS;
  
  console.log(`📋 [GITHUB MODELS] Loading ${modelIds.length} verified working models`);
  
  const models = modelIds.map(modelId => {
    const provider = inferProvider(modelId);
    
    return {
      id: modelId,
      displayName: prettifyModelName(modelId),
      provider,
      capabilities: {
        text: true,
        images: false  // GitHub models don't support file uploads
      },
      available: !!pat // Models are available if PAT is configured
    };
  });
  
  return models;
}

module.exports = {
  getModels,
  FALLBACK_MODELS
};

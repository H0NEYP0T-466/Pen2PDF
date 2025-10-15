/**
 * Model registry - comprehensive catalog of GitHub Models
 */

const { getFilePolicy, isVisionCapable } = require('./filePolicy');
const { discoverModels } = require('./discovery');

/**
 * Comprehensive model catalog for GitHub Models
 * Based on models available via GitHub Models marketplace
 * https://github.com/marketplace/models
 * Note: Only includes models verified to work with GitHub Models API
 */
const FALLBACK_MODELS = [
  // OpenAI GPT series (verified models only)
  'gpt-4o',
  'gpt-4o-mini',
  'o1-preview',
  'o1-mini',
  
  // Anthropic Claude series
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet',
  'claude-3-opus-20240229',
  'claude-3-opus',
  'claude-3-sonnet-20240229',
  'claude-3-sonnet',
  'claude-3-haiku-20240307',
  'claude-3-haiku',
  
  // Meta Llama series
  'llama-3.3-70b-instruct',
  'llama-3.2-90b-vision-instruct',
  'llama-3.2-11b-vision-instruct',
  'llama-3.1-405b-instruct',
  'llama-3.1-70b-instruct',
  'llama-3.1-8b-instruct',
  
  // Google Gemini series
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  
  // Mistral AI series
  'mistral-large-2411',
  'mistral-large',
  'mistral-small',
  'mistral-nemo',
  
  // Cohere series
  'cohere-command-r-plus',
  'cohere-command-r',
  
  // AI21 Labs series
  'ai21-jamba-1.5-large',
  'ai21-jamba-1.5-mini',
  
  // Microsoft Phi series
  'phi-4',
  'phi-3.5-moe-instruct',
  'phi-3.5-mini-instruct',
  'phi-3-medium-instruct',
  'phi-3-small-instruct',
  'phi-3-mini-instruct'
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
 * First tries to discover models from GitHub API
 * Falls back to comprehensive catalog if discovery fails
 */
async function getModels(pat) {
  if (!pat) {
    console.warn('⚠️ [GITHUB MODELS] No PAT configured');
  }
  
  // Try to discover models from GitHub API first
  let discoveredModelIds = null;
  if (pat) {
    discoveredModelIds = await discoverModels(pat);
  }
  
  // Use discovered models if available, otherwise use fallback
  const modelIds = discoveredModelIds || FALLBACK_MODELS;
  
  if (discoveredModelIds) {
    console.log(`📋 [GITHUB MODELS] Using ${modelIds.length} discovered models from GitHub API`);
  } else {
    console.log(`📋 [GITHUB MODELS] Loading ${modelIds.length} available models from catalog`);
  }
  
  const models = modelIds.map(modelId => {
    const provider = inferProvider(modelId);
    const filePolicy = getFilePolicy(modelId);
    
    return {
      id: modelId,
      displayName: prettifyModelName(modelId),
      provider,
      capabilities: {
        text: true,
        images: isVisionCapable(modelId)  // Use shared function from filePolicy
      },
      filePolicy,
      available: !!pat // Models are available if PAT is configured
    };
  });
  
  return models;
}

module.exports = {
  getModels,
  FALLBACK_MODELS
};

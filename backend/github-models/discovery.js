/**
 * Model discovery for GitHub Models API
 */

const { getFilePolicy } = require('./filePolicy');

const GITHUB_MODELS_BASE = 'https://models.inference.ai.azure.com';

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
 * Prettify model name for display
 */
function prettifyModelName(modelId) {
  // Remove common prefixes
  let name = modelId
    .replace(/^(openai\/|anthropic\/|meta\/|google\/|mistral\/)/, '')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return name;
}

/**
 * Check if model supports images based on heuristics
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
 * Discover models from GitHub Models API
 */
async function discoverModels(pat) {
  if (!pat) {
    console.warn('⚠️ [GITHUB MODELS] No PAT provided for discovery');
    return null;
  }

  try {
    console.log('🔍 [GITHUB MODELS] Discovering models from GitHub Models API...');
    
    const response = await fetch(`${GITHUB_MODELS_BASE}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [GITHUB MODELS] Discovery failed: ${response.status} ${response.statusText}`);
      console.warn(`   Error details: ${errorText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ [GITHUB MODELS] Discovery successful, found ${data.data?.length || 0} models`);
    
    // Map models to our format
    const models = (data.data || []).map(model => {
      const modelId = model.id;
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
        available: true
      };
    });

    return models;
  } catch (error) {
    console.error('❌ [GITHUB MODELS] Discovery error:', error.message);
    return null;
  }
}

module.exports = {
  discoverModels,
  GITHUB_MODELS_BASE
};

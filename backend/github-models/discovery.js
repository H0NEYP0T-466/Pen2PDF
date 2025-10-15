/**
 * Model discovery for GitHub Models API
 */

const { getFilePolicy } = require('./filePolicy');

const GITHUB_MODELS_BASE = 'https://models.inference.ai.azure.com';
const GITHUB_MODELS_API = 'https://api.github.com';

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
    
    const response = await fetch(`${GITHUB_MODELS_API}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [GITHUB MODELS] Discovery failed: ${response.status} ${response.statusText}`);
      console.warn(`   Error details: ${errorText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();
    
    // Debug: Log raw response structure
    if (process.env.DEBUG_GITHUB_MODELS) {
      console.log('🔍 [DEBUG] Raw API response:', JSON.stringify(data, null, 2));
    }
    
    // GitHub API returns array directly, not wrapped in data.data
    const modelsArray = Array.isArray(data) ? data : (data.data || []);
    console.log(`✅ [GITHUB MODELS] Discovery successful, found ${modelsArray.length} models`);
    
    // Map models to our format
    const models = modelsArray.map(model => {
      // GitHub API returns models with 'name' field, Azure might use 'id'
      const modelId = model.name || model.id;
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
  GITHUB_MODELS_BASE,
  GITHUB_MODELS_API
};

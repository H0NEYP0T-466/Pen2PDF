/**
 * Model discovery for GitHub Models API
 */

const GITHUB_MODELS_BASE = 'https://models.inference.ai.azure.com';
const GITHUB_MODELS_API = 'https://api.github.com';

/**
 * Discover models from GitHub Models API
 * Uses the GitHub API to get the actual list of available models
 */
async function discoverModels(pat) {
  if (!pat) {
    console.log('⚠️ [GITHUB MODELS] No PAT provided for discovery - will use fallback');
    return null;
  }

  try {
    const debugMode = process.env.DEBUG_GITHUB_MODELS === 'true';
    
    if (debugMode) {
      console.log('🔍 [GITHUB MODELS] Starting model discovery...');
      console.log(`   Endpoint: ${GITHUB_MODELS_API}/models`);
    }

    const response = await fetch(`${GITHUB_MODELS_API}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ [GITHUB MODELS] Discovery failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Handle both array response and object with data property
    let models = Array.isArray(data) ? data : (data.data || []);
    
    if (debugMode) {
      console.log(`✅ [GITHUB MODELS] Discovery successful, found ${models.length} models`);
    }

    // Extract model IDs/names
    const modelIds = models.map(model => model.name || model.id).filter(Boolean);
    
    if (modelIds.length === 0) {
      console.warn('⚠️ [GITHUB MODELS] Discovery returned 0 models - using fallback');
      return null;
    }

    if (debugMode) {
      console.log(`✅ [GITHUB MODELS] Returning ${modelIds.length} discovered models`);
    }

    return modelIds;

  } catch (error) {
    console.warn('⚠️ [GITHUB MODELS] Discovery error:', error.message);
    return null;
  }
}

module.exports = {
  discoverModels,
  GITHUB_MODELS_BASE,
  GITHUB_MODELS_API
};

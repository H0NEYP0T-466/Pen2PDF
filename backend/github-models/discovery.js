/**
 * Model discovery for GitHub Models API
 * NOTE: This module is deprecated as GitHub Models doesn't provide a public API for model discovery
 * The registry.js now uses a comprehensive hardcoded catalog instead
 */

const GITHUB_MODELS_BASE = 'https://models.inference.ai.azure.com';
const GITHUB_MODELS_API = 'https://api.github.com';

/**
 * Discover models from GitHub Models API
 * DEPRECATED: GitHub Models doesn't provide a public discovery API
 * This function now returns null to trigger fallback to catalog
 */
async function discoverModels() {
  console.log('⚠️ [GITHUB MODELS] API discovery deprecated - using catalog instead');
  return null;
}

module.exports = {
  discoverModels,
  GITHUB_MODELS_BASE,
  GITHUB_MODELS_API
};

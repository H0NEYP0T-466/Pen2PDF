/**
 * File policy for GitHub Models
 * Defines which models support file uploads and which MIME types are allowed
 */

const ALLOWED_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
];

const BLOCKED_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/pdf',
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/rtf'
];

/**
 * Determine if a model supports vision/images based on its ID
 */
function isVisionCapable(modelId) {
  const id = modelId.toLowerCase();
  
  // Vision-capable model patterns from GitHub Models marketplace
  const visionPatterns = [
    'gpt-4o',          // GPT-4o and GPT-4o-mini
    'gpt-4-turbo',     // GPT-4 Turbo
    'claude-3',        // All Claude 3 variants
    'llama-3.2',       // Llama 3.2 vision models
    'gemini',          // All Gemini models support vision
    'phi-3.5-moe',     // Phi-3.5 MoE
    'phi-4'            // Phi-4
  ];
  
  return visionPatterns.some(pattern => id.includes(pattern));
}

/**
 * Get file policy for a model
 */
function getFilePolicy(modelId) {
  const allowsFiles = isVisionCapable(modelId);
  
  return {
    allowsFiles,
    allowedMimeTypes: allowsFiles ? ALLOWED_IMAGE_MIMES : [],
    blockedMimeTypes: BLOCKED_MIMES
  };
}

/**
 * Validate if a MIME type is allowed for a model
 */
function isFileAllowed(modelId, mimeType) {
  const policy = getFilePolicy(modelId);
  
  // Check if blocked
  if (policy.blockedMimeTypes.includes(mimeType)) {
    return false;
  }
  
  // Check if model allows files at all
  if (!policy.allowsFiles) {
    return false;
  }
  
  // Check if MIME type is in allowed list
  return policy.allowedMimeTypes.includes(mimeType);
}

module.exports = {
  getFilePolicy,
  isFileAllowed,
  isVisionCapable,
  ALLOWED_IMAGE_MIMES,
  BLOCKED_MIMES
};

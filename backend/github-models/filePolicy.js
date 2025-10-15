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
  
  // Vision-capable model patterns
  const visionPatterns = [
    '4o',
    '4.0',
    'mini',
    'vision',
    'claude-3',
    'claude-4'
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
  ALLOWED_IMAGE_MIMES,
  BLOCKED_MIMES
};

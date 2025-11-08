

const ALLOWED_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif'
];

const ALLOWED_PDF_MIME = 'application/pdf';

// MIME types that are explicitly blocked for all models
const BLOCKED_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/rtf'
];


function isVisionCapable(modelId) {
  const id = modelId.toLowerCase();

  const visionPatterns = [
    'gpt-4o',          // GPT-4o and GPT-4o-mini
    'gpt-4-turbo',     // GPT-4 Turbo
    'llama-3.2',       // Llama 3.2 vision models
    'gemini',          // All Gemini models support vision
    'phi-3.5-moe',     // Phi-3.5 MoE
    'phi-4'            // Phi-4
  ];
  
  return visionPatterns.some(pattern => id.includes(pattern));
}


function isPDFCapable(modelId) {
  const id = modelId.toLowerCase();
  

  const pdfPatterns = [
    'gemini',          // Gemini 2.5 Pro and Flash support PDFs
    'gpt-4o',          // GPT-4o and GPT-4o-mini support PDFs
    'o1-mini',         // o1-mini supports PDFs
    'llama-3.2',       // Llama 3.2 vision models support PDFs
    'phi-4'            // Phi-4 supports PDFs
  ];
  
  return pdfPatterns.some(pattern => id.includes(pattern));
}

/**
 * Get file policy for a model
 */
function getFilePolicy(modelId) {
  const supportsImages = isVisionCapable(modelId);
  const supportsPDF = isPDFCapable(modelId);
  const allowsFiles = supportsImages || supportsPDF;
  
  // Build allowed MIME types array
  const allowedMimeTypes = [];
  if (supportsImages) {
    allowedMimeTypes.push(...ALLOWED_IMAGE_MIMES);
  }
  if (supportsPDF) {
    allowedMimeTypes.push(ALLOWED_PDF_MIME);
  }
  
  return {
    allowsFiles,
    allowedMimeTypes,
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
  isPDFCapable,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_PDF_MIME,
  BLOCKED_MIMES
};

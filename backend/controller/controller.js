const { generateGeminiResponse } = require("../gemini/gemini");

const SUPPORTED_MIME_TYPES = new Set([
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  // Docs
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-powerpoint", // .ppt (legacy)
]);

const generateRES = async (req, res) => {
  try {
    console.log("Received request at /textExtract");

    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { file } = req.files;

    if (!SUPPORTED_MIME_TYPES.has(file.mimetype)) {
      return res.status(415).json({
        error: `Unsupported file type: ${file.mimetype}. Try an image, PDF, or PPTX.`,
      });
    }

    // Convert uploaded file buffer to base64 for inlineData
    const base64 = Buffer.from(file.data).toString("base64");

    // Build prompt parts: the file + extraction instruction
    const parts = [
      {
        inlineData: {
          data: base64,
          mimeType: file.mimetype,
        },
      },
      {
        text:
          "Extract all text from this file, preserve headings (H1/H2/H3) and basic structure. Return only the clean text.",
      },
    ];

    // For very large PDFs/PPTX, switch to the Files API instead of inlineData.
    const reply = await generateGeminiResponse(parts);

    return res.json({ text: reply });
  } catch (err) {
    console.error("❌ Error in /textExtract route:", err);
    return res.status(500).json({
      error: "Something went wrong with text extraction.",
      detail: err?.message,
    });
  }
};

module.exports = { generateRES };
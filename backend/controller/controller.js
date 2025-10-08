const { generateGeminiResponse } = require("../gemini/gemini");

const SUPPORTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
]);

const generateRES = async (req, res) => {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📄 [TEXT EXTRACT] Text extraction request received');

    if (!req.files || !req.files.file) {
      console.log('❌ [TEXT EXTRACT] No file uploaded');
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { file } = req.files;

    console.log(`📁 [TEXT EXTRACT] File: ${file.name}`);
    console.log(`📊 [TEXT EXTRACT] Type: ${file.mimetype}`);
    console.log(`📏 [TEXT EXTRACT] Size: ${(file.size / 1024).toFixed(2)} KB`);

    if (!SUPPORTED_MIME_TYPES.has(file.mimetype)) {
      console.log('❌ [TEXT EXTRACT] Unsupported file type:', file.mimetype);
      return res.status(415).json({
        error: `Unsupported file type: ${file.mimetype}. Try an image, PDF, or PPTX.`,
      });
    }

    const base64 = Buffer.from(file.data).toString("base64");

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

    console.log('🚀 [TEXT EXTRACT] Sending to Gemini API for extraction...');

    const reply = await generateGeminiResponse(parts);

    console.log('✅ [TEXT EXTRACT] Text extracted successfully');
    console.log(`📝 [TEXT EXTRACT] Extracted text length: ${reply.length} characters`);
    console.log('='.repeat(80) + '\n');

    return res.json({ text: reply });
  } catch (err) {
    console.error("❌ [TEXT EXTRACT] Error:", err);
    console.log('='.repeat(80) + '\n');
    return res.status(500).json({
      error: "Something went wrong with text extraction.",
      detail: err?.message,
    });
  }
};

module.exports = { generateRES };
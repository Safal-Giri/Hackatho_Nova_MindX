const { GoogleGenerativeAI } = require("@google/generative-ai");
console.log("Key starts with:", process.env.GEMINI_API_KEY?.substring(0, 7))
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
exports.summarizeConversation = async (req, res) => {
  try {
    const { transcript, conversation } = req.body;
    const contentToSummarize = transcript || conversation;

    if (!contentToSummarize || contentToSummarize.trim().length < 5) {
      return res.status(400).json({ error: "Transcript is too short or missing." });
    }

    const prompt = `Summarize the following conversation transcript into a very short, clear, and friendly sentence that a person with dementia can easily understand. Focus on the main topic.
    
    Transcript: "${contentToSummarize}"
    
    Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim().replace(/["]+/g, '');

    res.json({ summary });
  } catch (error) {
    console.error("AI Summarization error:", error);
    res.status(500).json({ error: "Failed to generate summary." });
  }
};


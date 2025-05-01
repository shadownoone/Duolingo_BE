const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "AIzaSyC_kuNTTU17rPwVZZihpFsdrhDnB-LYRzI",
});

const analyzeOptions = async (question, options, context) => {
  const analysisContent = `Câu hỏi: ${question}\nLựa chọn: ${options}\nThông tin bài học: ${context}\nHãy phân tích lựa chọn nào đúng và vì sao.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash", // Sử dụng mô hình Gemini để phân tích
    contents: [
      {
        role: "user",
        parts: [{ text: analysisContent }],
      },
    ],
  });

  return response.text; // Trả về phân tích của AI
};

module.exports.genai = { analyzeOptions };

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeOptions(question, options, context) {
  const systemMessage = {
    role: "system",
    content:
      "Bạn là trợ lý giáo viên, giúp phân tích câu hỏi trắc nghiệm. " +
      "Hãy cho biết lựa chọn nào đúng và giải thích vì sao ngắn gọn, rõ ràng.",
  };

  const userMessage = {
    role: "user",
    content:
      `Câu hỏi: ${question}\n` +
      `Các lựa chọn: ${options}\n` +
      `Thông tin bài học: ${context}\n` +
      `Hãy phân tích lựa chọn nào đúng và vì sao.`,
  };

  try {
    // 3) Gọi OpenAI.chat.completions.create
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 512, // Tùy chỉnh tuỳ ngữ cảnh. Khoảng 512–800 là ổn cho phân tích.
      // Anh có thể set thấp hơn (ví dụ 256) nếu chỉ cần trả lời ngắn gọn.
    });

    // Lấy nội dung ChatGPT trả về
    const answer = response.choices[0].message.content;
    return answer.trim();
  } catch (err) {
    console.error("Lỗi khi gọi ChatGPT:", err);
    throw new Error("Lỗi khi gọi OpenAI Chat Completion");
  }
}

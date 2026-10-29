
const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        message: "Only POST requests are allowed."
      })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Please enter a question."
        })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: "AI API key is missing in Netlify."
        })
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: question
    });

    const answer = response.text;

    if (!answer || !answer.trim()) {
      throw new Error("Empty AI response");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    console.error("AI error:", error.message);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "AI could not answer. Check the Netlify function logs."
      })
    };
  }
};

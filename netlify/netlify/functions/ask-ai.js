
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  try {
    const { question } = JSON.parse(event.body || "{}");

    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Please enter a question." })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "AI service is not configured on Netlify yet."
        })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "You are a helpful study assistant. Explain clearly in simple language. Question: " + question
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return {
        statusCode: 502,
        body: JSON.stringify({
          message: "AI could not answer right now. Check the Gemini API key and model settings."
        })
      };
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: answer || "No answer received. Please try again."
      })
    };
  } catch (error) {
    console.error("AI function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Something went wrong in the AI service."
      })
    };
  }
};

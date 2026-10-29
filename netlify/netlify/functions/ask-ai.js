
exports.handler = async function (event) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  function reply(statusCode, data) {
    return {
      statusCode,
      headers,
      body: JSON.stringify(data)
    };
  }

  if (event.httpMethod !== "POST") {
    return reply(405, {
      success: false,
      message: "Please send a POST request."
    });
  }

  try {
    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return reply(400, {
        success: false,
        message: "Invalid request data. Please try again."
      });
    }

    const question = String(
      body.question || body.topic || ""
    ).trim();

    if (!question) {
      return reply(400, {
        success: false,
        message: "Please enter your question."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return reply(500, {
        success: false,
        message: "AI API key is missing in Netlify environment variables."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are the AI assistant for All-in-One Learning & Smart. Answer accurately and helpfully. Explain difficult concepts in simple language. For educational questions, give clear step-by-step explanations. Match the language used by the user."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: question }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const raw = await response.text();

    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      console.error("Gemini returned a non-JSON response.");

      return reply(502, {
        success: false,
        message: "AI returned an invalid response. Please try again."
      });
    }

    if (!response.ok) {
      console.error("Gemini API status:", response.status);
      console.error("Gemini API error:", data.error?.message);

      return reply(502, {
        success: false,
        message:
          data.error?.message ||
          "Gemini API request failed. Check your API key and model access."
      });
    }

    const answer = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    if (!answer) {
      return reply(502, {
        success: false,
        message: "AI did not return an answer. Please try again."
      });
    }

    return reply(200, {
      success: true,
      answer: answer
    });

  } catch (error) {
    console.error("ask-ai function error:", error);

    return reply(500, {
      success: false,
      message: "AI service failed. Please check the Netlify function logs."
    });
  }
};

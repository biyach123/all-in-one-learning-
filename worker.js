
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return json({
        success: true,
        message: "All-in-One Learning & Smart Worker is running."
      });
    }

    if (request.method !== "POST") {
      return json({ message: "Use POST for this endpoint." }, 405);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json({ message: "Invalid JSON request body." }, 400);
    }

    if (url.pathname === "/ask-ai") {
      const question = body.question || body.topic;

      if (typeof question !== "string" || !question.trim()) {
        return json({ message: "Please enter a question." }, 400);
      }

      if (!env.GEMINI_API_KEY) {
        return json({
          message: "AI API key is not configured in Cloudflare."
        }, 500);
      }

      try {
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: question.trim()
                }]
              }]
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return json({
            message: result.error?.message || "AI service request failed."
          }, 502);
        }

        const answer = result.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("")
          .trim();

        return json({
          success: true,
          answer: answer || "Please try asking again."
        });
      } catch {
        return json({ message: "Could not connect to the AI service." }, 502);
      }
    }

    if (url.pathname === "/search") {
      const topic = body.topic || body.question;

      if (typeof topic !== "string" || !topic.trim()) {
        return json({ message: "Please enter a topic." }, 400);
      }

      const cleanTopic = topic.trim();
      const q = encodeURIComponent(cleanTopic);

      return json({
        success: true,
        topic: cleanTopic,
        resources: [
          {
            title: "YouTube Video Lectures",
            url: `https://www.youtube.com/results?search_query=${q}`
          },
          {
            title: "Khan Academy",
            url: `https://www.khanacademy.org/search?page_search_query=${q}`
          },
          {
            title: "Research Papers",
            url: `https://scholar.google.com/scholar?q=${q}`
          },
          {
            title: "Educational Articles",
            url: `https://en.wikipedia.org/w/index.php?search=${q}`
          },
          {
            title: "MIT OpenCourseWare",
            url: `https://ocw.mit.edu/search/?q=${q}`
          }
        ]
      });
    }

    return json({ message: "Endpoint not found." }, 404);
  }
};

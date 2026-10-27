
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  try {
    const { topic } = JSON.parse(event.body || "{}");

    if (!topic || !topic.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Please enter a topic." })
      };
    }

    const q = encodeURIComponent(topic.trim());

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        results: [
          {
            title: "YouTube Video Lectures",
            url: `https://www.youtube.com/results?search_query=${q}`
          },
          {
            title: "Khan Academy",
            url: `https://www.khanacademy.org/search?page_search_query=${q}`
          },
          {
            title: "Google Scholar Research Papers",
            url: `https://scholar.google.com/scholar?q=${q}`
          },
          {
            title: "Wikipedia",
            url: `https://en.wikipedia.org/wiki/Special:Search?search=${q}`
          }
        ]
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Search failed. Please try again." })
    };
  }
};

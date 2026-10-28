
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Backend test
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "All-in-One Learning & Smart Backend is working!"
    });
});

// Learning resources search
app.post("/search", (req, res) => {
    const topic = req.body?.topic;

    if (typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({
            message: "Please enter a topic."
        });
    }

    const cleanTopic = topic.trim();
    const q = encodeURIComponent(cleanTopic);

    res.json({
        success: true,
        message: "Learning resources found!",
        topic: cleanTopic,
        resources: [
            {
                title: "YouTube Video Lectures",
                description: `Video lectures about ${cleanTopic}`,
                url: `https://www.youtube.com/results?search_query=${q}`
            },
            {
                title: "Khan Academy",
                description: `Lessons about ${cleanTopic}`,
                url: `https://www.khanacademy.org/search?page_search_query=${q}`
            },
            {
                title: "MIT OpenCourseWare",
                description: `University courses about ${cleanTopic}`,
                url: `https://ocw.mit.edu/search/?q=${q}`
            },
            {
                title: "Research Papers",
                description: `Academic papers about ${cleanTopic}`,
                url: `https://scholar.google.com/scholar?q=${q}`
            },
            {
                title: "Educational Articles",
                description: `Articles about ${cleanTopic}`,
                url: `https://en.wikipedia.org/w/index.php?search=${q}`
            },
            {
                title: "Study Notes",
                description: `Study notes about ${cleanTopic}`,
                url: `https://www.studocu.com/search/${q}`
            }
        ]
    });
});

// AI Assistant
app.post("/ask-ai", async (req, res) => {
    const question = req.body?.question;

    if (typeof question !== "string" || !question.trim()) {
        return res.status(400).json({
            message: "Please enter a question."
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            message: "GEMINI_API_KEY missing. Check your .env file."
        });
    }

    try {
        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: question.trim()
        });

        res.json({
            answer: response.text || "Please try asking again."
        });
    } catch (error) {
        console.error("AI error:", error.message);

        res.status(500).json({
            message: "AI request failed. Check your API key, model access, and internet connection."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

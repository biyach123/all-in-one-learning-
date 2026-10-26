require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("All-in-One Learning & Smart Backend is working!");
});

app.post("/search", (req, res) => {
    const topic = req.body.topic;

    if (!topic || topic.trim() === "") {
        return res.status(400).json({
            message: "Please enter a topic."
        });
    }

    const searchTopic = encodeURIComponent(topic.trim());


    const resources = [
        {
            title: "YouTube Video Lectures",
            description: "Find video lectures about " + topic,
            url: "https://www.youtube.com/results?search_query=" + searchTopic
        },
        {
            title: "Khan Academy",
            description: "Find educational lessons about " + topic,
            url: "https://www.khanacademy.org/search?page_search_query=" + searchTopic
        },
        {
            title: "MIT OpenCourseWare",
            description: "Explore university course materials about " + topic,
            url: "https://ocw.mit.edu/search/?q=" + searchTopic
        },
        {
            title: "Study Notes & Summaries",
            description: "Search study notes and summaries about " + topic,
            url: "https://www.studocu.com/search/" + searchTopic
        },
        {
            title: "Research Papers",
            description: "Find academic research papers about " + topic,
            url: "https://scholar.google.com/scholar?q=" + searchTopic
        },
        {
            title: "Educational Articles",
            description: "Find educational articles about " + topic,
            url: "https://en.wikipedia.org/w/index.php?search=" + searchTopic
        }
    ];
    
    
    res.json({
        message: "Learning resources found!",
        topic: topic,
        resources: resources
    });
});


app.post("/ask-ai", async (req, res) => {
    const question = req.body.question;

    if (!question || !question.trim()) {
        return res.status(400).json({
            message: "Please enter a question."
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            message: "AI API key is not configured."
        });
    }

    try {
        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: question
        });

        res.json({
            answer: response.text || "Please try asking again."
        });
    } catch (error) {
        console.error("AI error:", error.message);

        res.status(500).json({
            message: "AI could not answer right now. Please try again."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
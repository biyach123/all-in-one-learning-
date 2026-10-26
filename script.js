
document.addEventListener("DOMContentLoaded", function () {

    // Navigation
    

window.showSection = function (sectionId) {
    const target = document.getElementById(sectionId);

    if (!target) {
        alert("Page not found: " + sectionId);
        return;
    }

    document.querySelectorAll("main section").forEach(function (section) {
        section.style.display = "none";
    });

    target.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};


    // Back to Top
    window.scrollToTop = function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Choose Topic
    
window.chooseTopic = function (topic) {
    const input = document.getElementById("topic-input");
    const message = document.getElementById("searchmessage");

    if (!input || !message) {
        return;
    }

    input.value = "";
    input.placeholder = "Enter a topic in " + topic + "...";
    input.dataset.subject = topic;

    message.textContent = "Selected subject: " + topic + ". Now enter your topic.";

    window.showSection("search");
    input.focus();
};


    // Smart Search
    
   
window.searchResearch = async function () {
    const input = document.getElementById("topic-input");
    const message = document.getElementById("searchmessage");
    const resultsTopic = document.getElementById("results-topic");

    if (!input || !message || !resultsTopic) {
        alert("Please check the Smart Search and Results HTML.");
        return;
    }

    const topic = input.value.trim();

    if (topic === "") {
        message.textContent = "Please enter a topic first.";
        input.focus();
        return;
    }

    message.textContent = "Sending search request...";
    resultsTopic.textContent = "Resources for: " + topic;

    try {
        const response = await fetch("http://localhost:3000/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ topic: topic })
        });

        const data = await response.json();

message.textContent = data.message;

const oldResults = document.getElementById("learning-resources");

if (oldResults) {
    oldResults.remove();
}

const resultsContainer = document.createElement("div");
resultsContainer.id = "learning-resources";

data.resources.forEach((resource) => {
    const card = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const link = document.createElement("a");

    title.textContent = resource.title;
    description.textContent = resource.description;
    link.textContent = "Open resources";
    link.href = resource.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(link);
    resultsContainer.appendChild(card);
});

document.getElementById("results-page").appendChild(resultsContainer);

window.showSection("results-page");
  

    } catch (error) {
        message.textContent =
            "Could not connect to the backend. Please check that the server is running.";
    }
};

    
    // SMART SEARCH CATEGORIES

    
window.openCategory = function (category) {
    const input = document.getElementById("topic-input");
    const message = document.getElementById("searchmessage");

    const topic = input ? input.value.trim() : "";
    const subject = input?.dataset.subject || "";

    if (!topic) {
        if (message) {
            message.textContent = "Please enter a topic first.";
        }
        if (input) input.focus();
        return;
    }

    const fullTopic = (subject ? subject + " " : "") + topic;

    const google = "https://www.google.com/search?q=";
    const youtube = "https://www.youtube.com/results?search_query=";

    const resources = {
        "Video Lectures": [
            ["▶️", "YouTube", youtube + encodeURIComponent(fullTopic + " lecture")],
            ["🌐", "Khan Academy", google + encodeURIComponent("site:khanacademy.org " + fullTopic + " lesson")],
            ["🌐", "MIT OpenCourseWare", google + encodeURIComponent("site:ocw.mit.edu " + fullTopic + " lecture")],
            ["🔎", "Google Video Results", "https://www.google.com/search?tbm=vid&q=" + encodeURIComponent(fullTopic)],
            ["🌐", "Educational Lecture Websites", google + encodeURIComponent(fullTopic + " educational video lecture")]
        ],

        "Articles": [
            ["🔎", "Google Articles", google + encodeURIComponent(fullTopic + " article")],
            ["🌐", "Britannica", google + encodeURIComponent("site:britannica.com " + fullTopic)],
            ["🌐", "Khan Academy", google + encodeURIComponent("site:khanacademy.org " + fullTopic)],
            ["🌐", "Wikipedia", "https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(fullTopic)],
            ["🌐", "Educational Websites", google + encodeURIComponent(fullTopic + " educational article")]
        ],

        "Research Papers": [
            ["🎓", "Google Scholar", "https://scholar.google.com/scholar?q=" + encodeURIComponent(fullTopic)],
            ["🔬", "Semantic Scholar", "https://www.semanticscholar.org/search?q=" + encodeURIComponent(fullTopic)],
            ["🌐", "CORE Research", google + encodeURIComponent("site:core.ac.uk " + fullTopic)],
            ["🌐", "arXiv Papers", google + encodeURIComponent("site:arxiv.org " + fullTopic)],
            ["🔎", "More Research Papers", google + encodeURIComponent(fullTopic + " research paper")]
        ],

        "Notes & Summaries": [
            ["📘", "Study Notes", google + encodeURIComponent(fullTopic + " study notes")],
            ["🌐", "Khan Academy", google + encodeURIComponent("site:khanacademy.org " + fullTopic)],
            ["🌐", "OpenStax Textbooks", google + encodeURIComponent("site:openstax.org " + fullTopic)],
            ["📝", "Chapter Summaries", google + encodeURIComponent(fullTopic + " chapter summary")],
            ["🔎", "More Notes", google + encodeURIComponent(fullTopic + " notes PDF")]
        ],

        "Questions & MCQs": [
            ["❓", "Practice Questions", google + encodeURIComponent(fullTopic + " practice questions")],
            ["📝", "Multiple Choice Questions", google + encodeURIComponent(fullTopic + " MCQs with answers")],
            ["🌐", "Quizlet", google + encodeURIComponent("site:quizlet.com " + fullTopic)],
            ["🎯", "Online Quizzes", google + encodeURIComponent(fullTopic + " online quiz")],
            ["🔎", "Past Paper Questions", google + encodeURIComponent(fullTopic + " past paper questions")]
        ],

        "Assignments": [
            ["📝", "Assignment Examples", google + encodeURIComponent(fullTopic + " assignment examples")],
            ["📄", "Worksheets", google + encodeURIComponent(fullTopic + " worksheets")],
            ["🌐", "Educational Resources", google + encodeURIComponent(fullTopic + " educational assignment")],
            ["📚", "Project Ideas", google + encodeURIComponent(fullTopic + " project ideas")],
            ["🔎", "More Assignments", google + encodeURIComponent(fullTopic + " assignment PDF")]
        ],

        "Experiments & Practicals": [
            ["🧪", "Practical Guides", google + encodeURIComponent(fullTopic + " practical guide")],
            ["🔬", "Science Experiments", google + encodeURIComponent(fullTopic + " science experiment")],
            ["🌐", "PhET Simulations", google + encodeURIComponent("site:phet.colorado.edu " + fullTopic)],
            ["📘", "Lab Manuals", google + encodeURIComponent(fullTopic + " lab manual")],
            ["🔎", "Practical Videos", youtube + encodeURIComponent(fullTopic + " practical experiment")]
        ],

        "History & General Knowledge": [
            ["🌐", "Britannica", google + encodeURIComponent("site:britannica.com " + fullTopic)],
            ["📚", "Wikipedia", "https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(fullTopic)],
            ["🔎", "History Articles", google + encodeURIComponent(fullTopic + " history facts")],
            ["▶️", "Educational Videos", youtube + encodeURIComponent(fullTopic + " explained")],
            ["🌍", "More Information", google + encodeURIComponent(fullTopic + " facts and information")]
        ],

        "AI Study Assistant": [
            ["🤖", "AI Study Tools", google + encodeURIComponent(fullTopic + " AI study tools")],
            ["📘", "Study Explanations", google + encodeURIComponent(fullTopic + " explained simply")],
            ["❓", "Questions and Answers", google + encodeURIComponent(fullTopic + " questions and answers")]
        ]
    };

    const oldResults = document.getElementById("category-results");
    if (oldResults) oldResults.remove();

    const results = document.createElement("section");
    results.id = "category-results";
    results.className = "section";

    const heading = document.createElement("h2");
    heading.textContent = category;

    const topicText = document.createElement("p");
    topicText.textContent = "Subject: " + (subject || "General") + " | Topic: " + topic;

    const info = document.createElement("p");
    info.textContent = "Choose a resource below to explore more learning materials.";

    results.append(heading, topicText, info);
    
const cardSearch = document.createElement("input");
cardSearch.type = "search";
cardSearch.placeholder = "🔎 Search these 6 learning resources...";
cardSearch.setAttribute("aria-label", "Search learning resources");
cardSearch.style.width = "100%";
cardSearch.style.maxWidth = "500px";
cardSearch.style.padding = "12px";
cardSearch.style.margin = "15px 0";
cardSearch.style.border = "1px solid #cbdaf0";
cardSearch.style.borderRadius = "10px";
cardSearch.style.boxSizing = "border-box";

results.appendChild(cardSearch);

    const list = document.createElement("div");
    list.style.display = "grid";
    list.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
    list.style.gap = "15px";
    list.style.margin = "20px 0";

    const items = resources[category] || [
        ["🔎", "Search this topic", google + encodeURIComponent(fullTopic + " " + category)]
    ];

    items.forEach(function (item) {
        const card = document.createElement("div");
        card.style.padding = "16px";
        card.style.border = "1px solid #d7e4f5";
        card.style.borderRadius = "12px";
        card.style.background = "#ffffff";

        const title = document.createElement("h3");
        title.textContent = item[0] + " " + item[1];

        const link = document.createElement("a");
        link.href = item[2];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Explore resources ↗";
        link.style.color = "#2675d8";

        card.append(title, link);
        list.appendChild(card);
        
cardSearch.addEventListener("input", function () {
    const query = cardSearch.value.toLowerCase().trim();

    Array.from(list.children).forEach(function (card) {
        card.style.display =
            card.textContent.toLowerCase().includes(query)
                ? ""
                : "none";
    });
});

    });

    const note = document.createElement("p");
    note.textContent =
        "These links open searches on the named platforms. Check each result for relevance and quality.";

    const backButton = document.createElement("button");
    backButton.textContent = "Back to Search Results";
    backButton.onclick = function () {
        results.remove();
        window.showSection("results-page");
    };

    results.append(list, note, backButton);
    document.querySelector("main").appendChild(results);

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
};
 

    // Calculator mode switching
    const mode = document.getElementById("calculator-mode");

    function updateCalculatorMode() {
        if (!mode) return;

        ["basic", "scientific", "percentage", "power"].forEach(function (name) {
            const panel = document.getElementById(name + "-calculator");

            if (panel) {
                panel.style.display =
                    mode.value === name ? "block" : "none";
            }
        });
    }

    if (mode) {
        mode.addEventListener("change", updateCalculatorMode);
        updateCalculatorMode();
    }

    function getNumber(id) {
        const input = document.getElementById(id);

        if (!input || input.value.trim() === "") {
            throw new Error("Please enter all required numbers.");
        }

        const number = Number(input.value);

        if (!Number.isFinite(number)) {
            throw new Error("Please enter valid numbers.");
        }

        return number;
    }

    function showResult(value) {
        const output = document.getElementById("calculator-result");

        if (output) {
            output.textContent = "Result: " +
                (Number.isFinite(value) ? Number(value.toPrecision(10)) : value);
        }
    }

    function showError(message) {
        const output = document.getElementById("calculator-result");

        if (output) {
            output.textContent = message;
        }
    }

    // Basic Calculator
    window.calculateBasic = function () {
        try {
            const a = getNumber("number1");
            const b = getNumber("number2");
            const operation = document.getElementById("operation").value;
            let result;

            switch (operation) {
                case "add": result = a + b; break;
                case "subtract": result = a - b; break;
                case "multiply": result = a * b; break;
                case "divide":
                    if (b === 0) throw new Error("Cannot divide by zero.");
                    result = a / b;
                    break;
                case "modulo":
                    if (b === 0) throw new Error("Cannot find remainder with zero.");
                    result = a % b;
                    break;
                default: throw new Error("Choose an operation.");
            }

            showResult(result);
        } catch (error) {
            showError(error.message);
        }
    };

    // Scientific Calculator
    window.calculateScientific = function () {
        try {
            const x = getNumber("scientific-number");
            const operation =
                document.getElementById("scientific-operation").value;
            let result;

            switch (operation) {
                case "sqrt":
                    if (x < 0) throw new Error("Square root needs a non-negative number.");
                    result = Math.sqrt(x);
                    break;

                case "square": result = x * x; break;
                case "sin": result = Math.sin(x * Math.PI / 180); break;
                case "cos": result = Math.cos(x * Math.PI / 180); break;

                case "tan":
                    if (Math.abs(Math.cos(x * Math.PI / 180)) < 1e-10) {
                        throw new Error("Tangent is undefined for this angle.");
                    }
                    result = Math.tan(x * Math.PI / 180);
                    break;

                case "log":
                    if (x <= 0) throw new Error("Log needs a number greater than zero.");
                    result = Math.log10(x);
                    break;

                case "ln":
                    if (x <= 0) throw new Error("Natural log needs a number greater than zero.");
                    result = Math.log(x);
                    break;

                case "factorial":
                    if (x < 0 || !Number.isInteger(x) || x > 170) {
                        throw new Error("Factorial needs a whole number from 0 to 170.");
                    }

                    result = 1;
                    for (let i = 2; i <= x; i++) {
                        result *= i;
                    }
                    break;

                default: throw new Error("Choose an operation.");
            }

            showResult(result);
        } catch (error) {
            showError(error.message);
        }
    };

    // Percentage Calculator: calculate rate% of value
    window.calculatePercentage = function () {
        try {
            const value = getNumber("percentage-value");
            const rate = getNumber("percentage-rate");
            showResult(value * rate / 100);
        } catch (error) {
            showError(error.message);
        }
    };

    // Powers and Roots
    window.calculatePower = function () {
        try {
            const base = getNumber("power-number");
            const degree = getNumber("power-exponent");
            const operation = document.getElementById("power-operation").value;
            let result;

            if (operation === "power") {
                result = Math.pow(base, degree);
            } else {
                if (degree <= 0 || !Number.isInteger(degree)) {
                    throw new Error("Root degree must be a positive whole number.");
                }

                if (base < 0 && degree % 2 === 0) {
                    throw new Error("An even root of a negative number is not real.");
                }

                result = base < 0
                    ? -Math.pow(-base, 1 / degree)
                    : Math.pow(base, 1 / degree);
            }

            if (!Number.isFinite(result)) {
                throw new Error("This calculation is outside the supported range.");
            }

            showResult(result);
        } catch (error) {
            showError(error.message);
        }
    };

    // LOGIN AND SIGN UP FORM

    let currentFormMode = "login";

    window.showLoginForm = function (mode) {
        currentFormMode = mode;

        const heading = document.getElementById("form-heading");
        const button = document.getElementById("login-submit");
        const password = document.getElementById("login-password");
        const message = document.getElementById("login-message");

        if (!heading || !button || !password || !message) return;

        message.textContent = "";

        if (mode === "signup") {
            heading.textContent = "Create Your Account";
            button.textContent = "Create Account";
            password.autocomplete = "new-password";
            password.placeholder = "Create a password (8+ characters)";
        } else {
            heading.textContent = "Login to Your Account";
            button.textContent = "Login";
            password.autocomplete = "current-password";
            password.placeholder = "Enter your password";
        }
    };

    window.handleLogin = function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const message = document.getElementById("login-message");

        if (!email || !password) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        if (currentFormMode === "signup") {
            message.textContent =
                "Your form is ready! Real account creation will be enabled when secure authentication is connected.";
        } else {
            message.textContent =
                "Login is not connected yet. Secure authentication is needed to sign in.";
        }
    };

});

async function askAI() {
    const input = document.getElementById("ai-question");
    const messages = document.getElementById("chat-messages");
    const question = input.value.trim();

    if (!question) {
        alert("Please enter a question!");
        return;
    }

    const userMessage = document.createElement("p");
    userMessage.textContent = "You: " + question;
    messages.appendChild(userMessage);

    const aiMessage = document.createElement("p");
    aiMessage.textContent = "AI Assistant: Thinking...";
    messages.appendChild(aiMessage);

    input.value = "";

    try {
        const response = await fetch("http://localhost:3000/ask-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question: question })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "AI request failed.");
        }

        aiMessage.textContent = "AI Assistant: " + data.answer;
    } catch (error) {
        aiMessage.textContent =
            "AI Assistant: " + error.message +
            " Please check that the server is running.";
    }
}


document.addEventListener("DOMContentLoaded", function () {
        // Connect Search form to its function
    const searchForm = document.getElementById("search-form");

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            window.searchResearch();
        });
    }

    // Connect AI form to its function
    const aiForm = document.getElementById("ai-form");

    if (aiForm) {
        aiForm.addEventListener("submit", function (event) {
            event.preventDefault();
            window.askAI();
        });
    }

    // Connect Login form to its function
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", window.handleLogin);
    }
    // NAVIGATION
    window.showSection = function (sectionId) {
        const target = document.getElementById(sectionId);

        if (!target) {
            alert("Page not found: " + sectionId);
            return;
        }

        document.querySelectorAll("main section").forEach(section => {
            section.style.display = "none";
        });

        target.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.scrollToTop = function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // TOPIC SELECTION
    window.chooseTopic = function (subject) {
        const input = document.getElementById("topic-input");
        const message = document.getElementById("searchmessage");

        if (!input || !message) return;

        input.value = "";
        input.dataset.subject = subject;
        input.placeholder = "Enter a topic in " + subject + "...";
        message.textContent =
            "Selected subject: " + subject + ". Now enter your topic.";

        window.showSection("search");
        input.focus();
    };

    // SMART SEARCH — NETLIFY FUNCTION
    window.searchResearch = async function () {
        const input = document.getElementById("topic-input");
        const message = document.getElementById("searchmessage");
        const resultsTopic = document.getElementById("results-topic");

        if (!input || !message || !resultsTopic) return;

        const topic = input.value.trim();
        const subject = input.dataset.subject || "";

        if (!topic) {
            message.textContent = "Please enter a topic first.";
            input.focus();
            return;
        }

        const fullTopic = (subject ? subject + " " : "") + topic;

        message.textContent = "Searching for resources...";
        resultsTopic.textContent = "Resources for: " + fullTopic;

        try {
            const response = await fetch("/.netlify/functions/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: fullTopic })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Search request failed.");
            }

            const oldResults = document.getElementById("learning-resources");
            if (oldResults) oldResults.remove();

            const container = document.createElement("div");
            container.id = "learning-resources";

            const heading = document.createElement("h3");
            heading.textContent = "Quick Learning Resources";
            container.appendChild(heading);

            // Supports the results format in the Netlify search function.
            const resources = data.results || data.resources || [];

            if (resources.length === 0) {
                const note = document.createElement("p");
                note.textContent = "No resources returned. Try another topic.";
                container.appendChild(note);
            }

            resources.forEach(resource => {
                const card = document.createElement("div");
                const title = document.createElement("h3");
                const link = document.createElement("a");

                title.textContent = resource.title || "Learning Resource";
                link.textContent = "Open resource";
                link.href = resource.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                card.append(title, link);

                if (resource.description) {
                    const description = document.createElement("p");
                    description.textContent = resource.description;
                    card.appendChild(description);
                }

                container.appendChild(card);
            });

            document.getElementById("results-page").appendChild(container);

            message.textContent = "Search completed!";
            window.showSection("results-page");
        } catch (error) {
            console.error("Search error:", error);
            message.textContent =
                "Search service could not connect. Please try again after deployment.";
        }
    };

    // LEARNING CATEGORY RESOURCES
    window.openCategory = function (category) {
        const input = document.getElementById("topic-input");
        const topic = input ? input.value.trim() : "";
        const subject = input?.dataset.subject || "";

        if (!topic) {
            const message = document.getElementById("searchmessage");
            if (message) message.textContent = "Please enter a topic first.";
            window.showSection("search");
            return;
        }

        const fullTopic = (subject ? subject + " " : "") + topic;
        const q = encodeURIComponent(fullTopic);
        const google = "https://www.google.com/search?q=";
        const youtube = "https://www.youtube.com/results?search_query=";

        const resources = {
            "Video Lectures": [
                ["YouTube Lectures", youtube + encodeURIComponent(fullTopic + " lecture")],
                ["Khan Academy", google + encodeURIComponent("site:khanacademy.org " + fullTopic)],
                ["MIT OpenCourseWare", google + encodeURIComponent("site:ocw.mit.edu " + fullTopic)],
                ["Educational Videos", "https://www.google.com/search?tbm=vid&q=" + q]
            ],
            "Articles": [
                ["Google Articles", google + q + "+article"],
                ["Britannica", google + encodeURIComponent("site:britannica.com " + fullTopic)],
                ["Wikipedia", "https://en.wikipedia.org/w/index.php?search=" + q],
                ["Educational Websites", google + encodeURIComponent(fullTopic + " explanation")]
            ],
            "Research Papers": [
                ["Google Scholar", "https://scholar.google.com/scholar?q=" + q],
                ["Semantic Scholar", "https://www.semanticscholar.org/search?q=" + q],
                ["CORE Research", google + encodeURIComponent("site:core.ac.uk " + fullTopic)],
                ["arXiv Papers", google + encodeURIComponent("site:arxiv.org " + fullTopic)]
            ],
            "Notes & Summaries": [
                ["Study Notes", google + encodeURIComponent(fullTopic + " study notes")],
                ["Khan Academy", google + encodeURIComponent("site:khanacademy.org " + fullTopic)],
                ["OpenStax Textbooks", google + encodeURIComponent("site:openstax.org " + fullTopic)],
                ["Chapter Summaries", google + encodeURIComponent(fullTopic + " summary")]
            ],
            "Questions & MCQs": [
                ["Practice Questions", google + encodeURIComponent(fullTopic + " practice questions")],
                ["MCQs with Answers", google + encodeURIComponent(fullTopic + " MCQs with answers")],
                ["Quizlet", google + encodeURIComponent("site:quizlet.com " + fullTopic)],
                ["Past Papers", google + encodeURIComponent(fullTopic + " past paper questions")]
            ],
            "Assignments": [
                ["Assignment Examples", google + encodeURIComponent(fullTopic + " assignment examples")],
                ["Worksheets", google + encodeURIComponent(fullTopic + " worksheets")],
                ["Project Ideas", google + encodeURIComponent(fullTopic + " project ideas")],
                ["Assignment Guides", google + encodeURIComponent(fullTopic + " assignment guide")]
            ],
            "Experiments & Practicals": [
                ["Practical Guides", google + encodeURIComponent(fullTopic + " practical guide")],
                ["Science Experiments", google + encodeURIComponent(fullTopic + " science experiment")],
                ["PhET Simulations", google + encodeURIComponent("site:phet.colorado.edu " + fullTopic)],
                ["Practical Videos", youtube + encodeURIComponent(fullTopic + " practical experiment")]
            ]
        };

        const old = document.getElementById("category-results");
        if (old) old.remove();

        const section = document.createElement("section");
        section.id = "category-results";
        section.className = "section";

        const heading = document.createElement("h2");
        heading.textContent = category;

        const description = document.createElement("p");
        description.textContent =
            "Subject: " + (subject || "General") + " | Topic: " + topic;

        section.append(heading, description);

        const searchBox = document.createElement("input");
        searchBox.type = "search";
        searchBox.placeholder = "Filter these resources...";
        searchBox.setAttribute("aria-label", "Filter resources");
        searchBox.style.cssText =
            "width:100%;max-width:500px;padding:12px;margin:15px 0;box-sizing:border-box;";

        section.appendChild(searchBox);

        const list = document.createElement("div");
        list.style.cssText =
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:15px;margin:20px 0;";

        const items = resources[category] || [
            ["Search this topic", google + q + "+" + encodeURIComponent(category)]
        ];

        items.forEach(item => {
            const card = document.createElement("div");
            card.style.cssText =
                "padding:16px;border:1px solid #d7e4f5;border-radius:12px;background:white;";

            const title = document.createElement("h3");
            title.textContent = item[0];

            const link = document.createElement("a");
            link.href = item[1];
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Explore resource";

            card.append(title, link);
            list.appendChild(card);
        });

        searchBox.addEventListener("input", function () {
            const filter = searchBox.value.toLowerCase().trim();

            Array.from(list.children).forEach(card => {
                card.style.display =
                    card.textContent.toLowerCase().includes(filter) ? "" : "none";
            });
        });

        const back = document.createElement("button");
        back.type = "button";
        back.textContent = "Back to Search Results";
        back.addEventListener("click", function () {
            window.showSection("results-page");
        });

        section.append(list, back);
        document.querySelector("main").appendChild(section);
        window.showSection("category-results");
    };

    // CALCULATOR MODE
    const mode = document.getElementById("calculator-mode");

    function updateCalculatorMode() {
        if (!mode) return;

        ["basic", "scientific", "percentage", "power"].forEach(name => {
            const panel = document.getElementById(name + "-calculator");
            if (panel) {
                panel.style.display = mode.value === name ? "block" : "none";
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

    function showError(error) {
        const output = document.getElementById("calculator-result");
        if (output) output.textContent = error;
    }

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

    window.calculateScientific = function () {
        try {
            const x = getNumber("scientific-number");
            const operation = document.getElementById("scientific-operation").value;
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
                    for (let i = 2; i <= x; i++) result *= i;
                    break;
                default: throw new Error("Choose an operation.");
            }

            showResult(result);
        } catch (error) {
            showError(error.message);
        }
    };

    window.calculatePercentage = function () {
        try {
            showResult(getNumber("percentage-value") * getNumber("percentage-rate") / 100);
        } catch (error) {
            showError(error.message);
        }
    };

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

            if (!Number.isFinite(result)) throw new Error("Calculation is outside the supported range.");
            showResult(result);
        } catch (error) {
            showError(error.message);
        }
    };

    // LOGIN AND SIGN UP — FIREBASE
    let currentFormMode = "login";

    window.showLoginForm = function (formMode) {
        currentFormMode = formMode;

        const heading = document.getElementById("form-heading");
        const button = document.getElementById("login-submit");
        const password = document.getElementById("login-password");
        const message = document.getElementById("login-message");

        if (!heading || !button || !password || !message) return;

        message.textContent = "";

        if (formMode === "signup") {
            heading.textContent = "Create Your Account";
            button.textContent = "Create Account";
            password.autocomplete = "new-password";
        } else {
            heading.textContent = "Login to Your Account";
            button.textContent = "Login";
            password.autocomplete = "current-password";
        }
    };

    window.handleLogin = async function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const message = document.getElementById("login-message");
        const button = document.getElementById("login-submit");

        if (!email || !password) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        const auth = window.firebaseAuth;
        const firebase = window.firebaseFunctions;

        if (!auth || !firebase) {
            message.textContent =
                "Firebase is not ready. Check your Firebase setup and refresh.";
            return;
        }

        button.disabled = true;
        message.textContent = "Please wait...";

        try {
            if (currentFormMode === "signup") {
                await firebase.createUserWithEmailAndPassword(auth, email, password);
                message.textContent = "Account created successfully!";
            } else {
                await firebase.signInWithEmailAndPassword(auth, email, password);
                message.textContent = "Login successful!";
            }

            setTimeout(() => window.showSection("home"), 1000);
        } catch (error) {
            const messages = {
                "auth/email-already-in-use": "This email already has an account. Please log in.",
                "auth/invalid-email": "Please enter a valid email.",
                "auth/weak-password": "Choose a stronger password.",
                "auth/invalid-credential": "Email or password is incorrect.",
                "auth/network-request-failed": "Check your internet connection.",
                "auth/operation-not-allowed": "Enable Email/Password in Firebase Authentication."
            };

            message.textContent = messages[error.code] || "Authentication failed. Please try again.";
            console.error("Firebase authentication error:", error);
        } finally {
            button.disabled = false;
        }
    };

    // AI ASSISTANT — NETLIFY FUNCTION
    window.askAI = async function () {
        const input = document.getElementById("ai-question");
        const messages = document.getElementById("chat-messages");
        const button = document.getElementById("ai-send-button");

        if (!input || !messages) return;

        const question = input.value.trim();

        if (!question) {
            alert("Please enter a question!");
            return;
        }

        const userMessage = document.createElement("p");
        userMessage.textContent = "You: " + question;

        const aiMessage = document.createElement("p");
        aiMessage.textContent = "AI Assistant: Thinking...";

        messages.append(userMessage, aiMessage);
        input.value = "";
        if (button) button.disabled = true;

        try {
            const response = await fetch("/.netlify/functions/ask-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "AI request failed.");
            }

            aiMessage.textContent = "AI Assistant: " +
                (data.answer || "The server returned no answer.");
        } catch (error) {
            console.error("AI request error:", error);
            aiMessage.textContent = "AI Assistant: Error — " + error.message;
        } finally {
            if (button) button.disabled = false;
        }
    };
});

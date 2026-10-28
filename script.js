
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  let currentSubject = "";
  let currentTopic = "";
  let currentCategory = "";
  let loginMode = "login";
  let firebaseStarted = false;

  const intro = $("intro-screen");
  const authScreen = $("auth-screen");
  const appShell = $("app-shell");

  function showScreen(screen) {
    if (intro) intro.style.display = "none";
    if (authScreen) authScreen.style.display = "none";
    if (appShell) appShell.style.display = "none";

    if (screen === "intro" && intro) intro.style.display = "flex";
    if (screen === "auth" && authScreen) authScreen.style.display = "flex";
    if (screen === "app" && appShell) appShell.style.display = "flex";
  }

  function setMessage(id, message, isError = false) {
    const element = $(id);
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "#c62828" : "#18794e";
  }

  function firebaseFunctions() {
    return window.firebaseFunctions || null;
  }

  function setLoginMode(mode) {
    loginMode = mode;
    const signup = mode === "signup";

    const nameField = $("login-name");
    const submit = $("login-submit");
    document.getElementById("google-login-button")?.addEventListener("click", async () => {
  try {
    const fb = firebaseFunctions();
    const provider = new fb.GoogleAuthProvider();
    await fb.signInWithPopup(window.firebaseAuth, provider);
  } catch (error) {
    setMessage("login-message", error.message, true);
  }
});

    if (nameField) {
      nameField.style.display = signup ? "block" : "none";
      nameField.required = signup;
    }

    if (submit) {
      submit.textContent = signup ? "Create Account" : "Login";
    }

    const title = $("auth-title");
    if (title) title.textContent = signup ? "Create Your Account" : "Welcome Back";

    const subtitle = $("auth-subtitle");
    if (subtitle) {
      subtitle.textContent = signup
        ? "Join All-in-One Learning & Smart"
        : "Login to continue learning";
    }

    setMessage("login-message", "");
  }

  window.showLoginForm = (mode) => {
    setLoginMode(mode === "signup" ? "signup" : "login");
  };

  function showApp(user) {
    showScreen("app");

    const userName = user?.displayName || user?.email?.split("@")[0] || "Learner";
    const welcome = $("welcome-user");
    if (welcome) welcome.textContent = `Welcome, ${userName}!`;

    showSection("home");
  }

  function showAuth(message = "") {
    showScreen("auth");
    setLoginMode(loginMode);
    if (message) setMessage("login-message", message, true);
  }

  function watchFirebase() {
    const fb = firebaseFunctions();

    if (fb && fb.onAuthStateChanged && window.firebaseAuth) {
      if (firebaseStarted) return;
      firebaseStarted = true;

      fb.onAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
          showApp(user);
        } else {
          showAuth();
        }
      });

      return;
    }

    // Firebase may still be loading.
    if (window.firebaseReady === undefined) {
      window.addEventListener("firebase-ready", watchFirebase, { once: true });
      setTimeout(() => {
        if (!firebaseStarted) {
          showAuth("Firebase is still loading. Refresh the page and try again.");
        }
      }, 5000);
    } else {
      showAuth("Firebase did not load. Check your internet connection and Firebase configuration.");
    }
  }

  // Navigation
  window.showSection = (sectionId) => {
    const sections = document.querySelectorAll("main section");

    sections.forEach((section) => {
      section.classList.remove("active");
      section.style.display = "none";
    });

    const target = $(sectionId);
    if (target) {
      target.style.display = "block";
      target.classList.add("active");
    }

    document.querySelectorAll("[data-section]").forEach((button) => {
      button.classList.toggle("active", button.dataset.section === sectionId);
    });

    const sidebar = $("sidebar");
    if (sidebar) sidebar.classList.remove("open");
  };

  // Subject selection
  window.chooseTopic = (subject) => {
    currentSubject = subject;
    const input = $("topic-input");
    if (input) input.value = "";

    const message = $("topic-message");
    if (message) {
      message.textContent = `Selected: ${subject}. Enter a topic to find learning resources.`;
    }

    showSection("topics");
    if (input) input.focus();
  };

  // Search resources through the Netlify function
  async function runSearch(topic) {
    const cleanTopic = String(topic || "").trim();

    if (!cleanTopic) {
      setMessage("smart-search-message", "Please enter a topic.", true);
      return;
    }

    currentTopic = cleanTopic;
    setMessage("smart-search-message", "Finding learning resources...");

    const resultsBox = $("smart-search-results");
    if (resultsBox) resultsBox.textContent = "Loading resources...";

    try {
      const response = await fetch("/.netlify/functions/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: cleanTopic })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search could not be completed.");
      }

      const results = Array.isArray(data.results) ? data.results : [];
      currentTopic = cleanTopic;

      const title = $("results-title");
      if (title) title.textContent = `Learning resources: ${cleanTopic}`;

      const description = $("results-description");
      if (description) {
        description.textContent = "Choose a category below or open a resource.";
      }

      renderResources($("learning-resources"), results);

      if (resultsBox) renderResources(resultsBox, results);

      setMessage("smart-search-message", "Resources are ready.");
      showSection("results-page");
    } catch (error) {
      const message = error.message || "Search failed. Please try again.";
      setMessage("smart-search-message", message, true);
      if (resultsBox) resultsBox.textContent = message;
    }
  }

  function renderResources(container, resources) {
    if (!container) return;

    container.replaceChildren();

    if (!resources.length) {
      container.textContent = "No resources were returned. Try another topic.";
      return;
    }

    resources.forEach((resource) => {
      if (!resource || !resource.url || !resource.title) return;

      const link = document.createElement("a");
      link.href = resource.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = resource.title;
      link.className = "resource-link";
      container.appendChild(link);
    });
  }

  const topicForm = $("topic-search-form");
  if (topicForm) {
    topicForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = $("topic-input");
      const topic = input ? input.value.trim() : "";

      if (!topic) {
        const message = $("topic-message");
        if (message) message.textContent = "Please enter a topic first.";
        return;
      }

      const fullTopic = currentSubject
        ? `${currentSubject} ${topic}`
        : topic;

      runSearch(fullTopic);
    });
  }

  const smartForm = $("smart-search-form");
  if (smartForm) {
    smartForm.addEventListener("submit", (event) => {
      event.preventDefault();
      runSearch($("smart-topic-input")?.value || "");
    });
  }

  const globalSearchButton = $("global-search-button");
  if (globalSearchButton) {
    globalSearchButton.addEventListener("click", () => {
      runSearch($("global-search")?.value || "");
    });
  }

  const globalSearchInput = $("global-search");
  if (globalSearchInput) {
    globalSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runSearch(globalSearchInput.value);
      }
    });
  }

  // Topic category pages
  const categorySources = {
    "Video Lectures": [
      ["YouTube Video Lectures", "https://www.youtube.com/results?search_query="],
      ["Khan Academy", "https://www.khanacademy.org/search?page_search_query="],
      ["Google Video Search", "https://www.google.com/search?tbm=vid&q="]
    ],
    "Research Papers": [
      ["Google Scholar", "https://scholar.google.com/scholar?q="],
      ["Semantic Scholar", "https://www.semanticscholar.org/search?q="],
      ["arXiv", "https://arxiv.org/search/?query="]
    ],
    "Articles": [
      ["Google Articles Search", "https://www.google.com/search?q="],
      ["Britannica", "https://www.britannica.com/search?query="],
      ["Wikipedia", "https://en.wikipedia.org/wiki/Special:Search?search="]
    ],
    "Notes & Summaries": [
      ["OpenStax Textbooks", "https://openstax.org/search?query="],
      ["Study Notes Search", "https://www.google.com/search?q="],
      ["Quizlet Study Sets", "https://quizlet.com/search?query="]
    ],
    "Questions & MCQs": [
      ["Practice Questions", "https://www.google.com/search?q="],
      ["Khan Academy Practice", "https://www.khanacademy.org/search?page_search_query="],
      ["Quizlet Questions", "https://quizlet.com/search?query="]
    ],
    "Tests & MCQs": [
      ["Online Practice Tests", "https://www.google.com/search?q="],
      ["Khan Academy", "https://www.khanacademy.org/search?page_search_query="],
      ["Quizlet Tests", "https://quizlet.com/search?query="]
    ],
    "Assignments": [
      ["Assignment Examples", "https://www.google.com/search?q="],
      ["YouTube Tutorials", "https://www.youtube.com/results?search_query="],
      ["OpenStax Learning", "https://openstax.org/search?query="]
    ],
    "Experiments & Practicals": [
      ["PhET Simulations", "https://phet.colorado.edu/en/simulations/filter?subjects="],
      ["Practical Videos", "https://www.youtube.com/results?search_query="],
      ["Practical Guides", "https://www.google.com/search?q="]
    ],
    "History & General Knowledge": [
      ["Britannica", "https://www.britannica.com/search?query="],
      ["Wikipedia", "https://en.wikipedia.org/wiki/Special:Search?search="],
      ["Documentary Videos", "https://www.youtube.com/results?search_query="]
    ],
    "Projects & Ideas": [
      ["Project Ideas", "https://www.google.com/search?q="],
      ["Project Tutorials", "https://www.youtube.com/results?search_query="],
      ["Science Projects", "https://www.google.com/search?q="]
    ]
  };

  window.openCategory = (category) => {
    currentCategory = category;

    const title = $("category-title");
    if (title) title.textContent = category;

    const description = $("category-description");
    if (description) {
      description.textContent = `Resources for ${currentTopic || "your topic"} — ${category}`;
    }

    const container = $("category-results");
    if (container) {
      container.replaceChildren();

      const sources = categorySources[category] || [
        ["Google Search", "https://www.google.com/search?q="],
        ["YouTube", "https://www.youtube.com/results?search_query="]
      ];

      const query = `${currentTopic} ${category}`.trim();

      sources.forEach(([name, baseUrl]) => {
        const link = document.createElement("a");
        link.className = "resource-link";
        link.href = baseUrl + encodeURIComponent(query);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = name;
        container.appendChild(link);
      });
    }

    showSection("category-page");
  };

  // AI assistant
  function addChatMessage(message, sender) {
    const chat = $("chat-messages");
    if (!chat) return;

    const bubble = document.createElement("div");
    bubble.className = sender === "user" ? "chat-message user-message" : "chat-message ai-message";
    bubble.textContent = message;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
    return bubble;
  }

  const aiForm = $("ai-form");
  if (aiForm) {
    aiForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const input = $("ai-question");
      const button = $("ai-send-button");
      const question = input ? input.value.trim() : "";

      if (!question) {
        addChatMessage("Please type your question first.", "ai");
        return;
      }

      addChatMessage(question, "user");
      input.value = "";

      if (button) {
        button.disabled = true;
        button.textContent = "Thinking...";
      }

      const loadingBubble = addChatMessage("Preparing your answer...", "ai");

      try {
        const response = await fetch("/.netlify/functions/ask-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "The AI service is unavailable.");
        }

        if (loadingBubble) {
          loadingBubble.textContent = data.answer || "No answer was returned. Please try again.";
        }
      } catch (error) {
        if (loadingBubble) {
          loadingBubble.textContent =
            `${error.message || "Could not connect to the AI."} Check that the website is deployed on Netlify and its AI function is working.`;
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = "Send";
        }
        if (input) input.focus();
      }
    });
  }

  // Calculator
  window.showCalculatorMode = (mode) => {
    const modes = {
      basic: "basic-calculator",
      scientific: "scientific-calculator",
      percentage: "percentage-calculator",
      power: "power-calculator"
    };

    Object.entries(modes).forEach(([key, id]) => {
      const panel = $(id);
      if (panel) panel.style.display = key === mode ? "block" : "none";
    });

    const result = $("calculator-result");
    if (result) result.textContent = "Result will appear here.";
  };

  const calculatorMode = $("calculator-mode");
  if (calculatorMode) {
    calculatorMode.addEventListener("change", () => {
      window.showCalculatorMode(calculatorMode.value);
    });
    window.showCalculatorMode(calculatorMode.value || "basic");
  }

  function showResult(value) {
    const output = $("calculator-result");
    if (!output) return;

    if (typeof value === "number" && Number.isFinite(value)) {
      output.textContent = `Result: ${Number(value.toFixed(10))}`;
    } else {
      output.textContent = String(value);
    }
  }

  function getNumber(id) {
    const element = $(id);
    if (!element || element.value.trim() === "") return null;

    const value = Number(element.value);
    return Number.isFinite(value) ? value : null;
  }

  const basicButton = $("basic-calculate");
  if (basicButton) {
    basicButton.addEventListener("click", () => {
      const a = getNumber("basic-num1");
      const b = getNumber("basic-num2");
      const operation = $("basic-operation")?.value;

      if (a === null || b === null) {
        showResult("Enter two valid numbers.");
        return;
      }

      const operations = {
        add: () => a + b,
        subtract: () => a - b,
        multiply: () => a * b,
        divide: () => b === 0 ? "Cannot divide by zero." : a / b
      };

      showResult(operations[operation] ? operations[operation]() : "Choose an operation.");
    });
  }

  const scientificButton = $("scientific-calculate");
  if (scientificButton) {
    scientificButton.addEventListener("click", () => {
      const value = getNumber("scientific-number");
      const operation = $("scientific-operation")?.value;

      if (value === null) {
        showResult("Enter a valid number.");
        return;
      }

      const radians = value * Math.PI / 180;
      const operations = {
        square: () => value ** 2,
        squareRoot: () => value < 0 ? "Square root needs a non-negative number." : Math.sqrt(value),
        sin: () => Math.sin(radians),
        cos: () => Math.cos(radians),
        tan: () => Math.abs(Math.cos(radians)) < 1e-10 ? "Undefined for this angle." : Math.tan(radians),
        log: () => value <= 0 ? "Log needs a number greater than zero." : Math.log10(value),
        ln: () => value <= 0 ? "Natural log needs a number greater than zero." : Math.log(value),
        absolute: () => Math.abs(value)
      };

      showResult(operations[operation] ? operations[operation]() : "Choose an operation.");
    });
  }

  const percentageButton = $("percentage-calculate");
  if (percentageButton) {
    percentageButton.addEventListener("click", () => {
      const percentage = getNumber("percentage-value");
      const total = getNumber("percentage-total");

      if (percentage === null || total === null) {
        showResult("Enter a valid percentage and total.");
        return;
      }

      showResult((percentage / 100) * total);
    });
  }

  const powerButton = $("power-calculate");
  if (powerButton) {
    powerButton.addEventListener("click", () => {
      const base = getNumber("power-base");
      const exponent = getNumber("power-exponent");

      if (base === null || exponent === null) {
        showResult("Enter a valid base and exponent.");
        return;
      }

      showResult(base ** exponent);
    });
  }

  // Login and sign-up
  const loginForm = $("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fb = firebaseFunctions();
      if (!fb || !window.firebaseAuth) {
        setMessage("login-message", "Firebase is not ready. Refresh the page and try again.", true);
        return;
      }

      const email = $("login-email")?.value.trim();
      const password = $("login-password")?.value;
      const name = $("login-name")?.value.trim();

      if (!email || !password) {
        setMessage("login-message", "Enter your email and password.", true);
        return;
      }

      const submit = $("login-submit");
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Please wait...";
      }

      try {
        if (loginMode === "signup") {
          if (!name) throw new Error("Enter your name to create an account.");

          const result = await fb.createUserWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
          );

          await fb.updateProfile(result.user, { displayName: name });
          setMessage("login-message", "Account created successfully.");
        } else {
          await fb.signInWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
          );
        }
      } catch (error) {
        const messages = {
          "auth/email-already-in-use": "This email already has an account. Try logging in.",
          "auth/invalid-email": "Enter a valid email address.",
          "auth/weak-password": "Use a stronger password with at least 6 characters.",
          "auth/invalid-credential": "Email or password is incorrect.",
          "auth/invalid-api-key": "Firebase API key is invalid. Check the Firebase configuration in index.html.",
          "auth/network-request-failed": "Network error. Check your internet connection."
        };

        setMessage(
          "login-message",
          messages[error.code] || error.message || "Authentication failed.",
          true
        );
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = loginMode === "signup" ? "Create Account" : "Login";
        }
      }
    });
  }

  const forgotButton = $("forgot-password");
  if (forgotButton) {
    forgotButton.addEventListener("click", async () => {
      const fb = firebaseFunctions();
      const email = $("login-email")?.value.trim();

      if (!email) {
        setMessage("login-message", "Enter your email first, then click Forgot Password.", true);
        return;
      }

      if (!fb || !window.firebaseAuth) {
        setMessage("login-message", "Firebase is not ready. Try again shortly.", true);
        return;
      }

      try {
        await fb.sendPasswordResetEmail(window.firebaseAuth, email);
        setMessage("login-message", "Password reset email sent. Check your inbox.");
      } catch (error) {
        setMessage("login-message", error.message || "Could not send the reset email.", true);
      }
    });
  }

  window.logoutUser = async () => {
    const fb = firebaseFunctions();

    if (!fb || !window.firebaseAuth) {
      showAuth();
      return;
    }

    try {
      await fb.signOut(window.firebaseAuth);
      showAuth();
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  // Mobile sidebar toggle, if its button exists
  const menuButton = $("menu-toggle");
  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const sidebar = $("sidebar");
      if (sidebar) sidebar.classList.toggle("open");
    });
  }

  // Temporary preview: open the website without login.
showScreen("app");
showSection("home");
});

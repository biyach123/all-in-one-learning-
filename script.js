
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

  // --------------------------------------------------
  // SCREEN MANAGEMENT
  // --------------------------------------------------

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

  // --------------------------------------------------
  // LOGIN / SIGN-UP MODE
  // --------------------------------------------------

  function setLoginMode(mode) {
    loginMode = mode === "signup" ? "signup" : "login";
    const signup = loginMode === "signup";

    const nameField = $("login-name");
    const submit = $("login-submit");
    const title = $("auth-title");
    const subtitle = $("auth-subtitle");

    if (nameField) {
      nameField.style.display = signup ? "block" : "none";
      nameField.required = signup;
    }

    if (submit) {
      submit.textContent = signup ? "Create Account" : "Login";
    }

    if (title) {
      title.textContent = signup ? "Create Your Account" : "Welcome Back";
    }

    if (subtitle) {
      subtitle.textContent = signup
        ? "Join All-in-One Learning & Smart"
        : "Login to continue learning";
    }

    setMessage("login-message", "");
  }

  window.showLoginForm = (mode) => {
    setLoginMode(mode);
    showScreen("auth");
  };

  // Google login listener is added only once.
  const googleLoginButton = $("google-login-button");

  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", async () => {
      try {
        const fb = firebaseFunctions();

        if (
          !fb ||
          !fb.GoogleAuthProvider ||
          !fb.signInWithPopup ||
          !window.firebaseAuth
        ) {
          throw new Error("Firebase Google Login is not configured correctly.");
        }

        const provider = new fb.GoogleAuthProvider();

        await fb.signInWithPopup(window.firebaseAuth, provider);
      } catch (error) {
        setMessage(
          "login-message",
          error.message || "Google Login failed.",
          true
        );
      }
    });
  }

  function showApp(user) {
    showScreen("app");

    const userName =
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "Learner";

    const welcome = $("welcome-user");

    if (welcome) {
      welcome.textContent = `Welcome, ${userName}!`;
    }

    window.showSection("home");
  }

  function showAuth(message = "") {
    showScreen("auth");
    setLoginMode(loginMode);

    if (message) {
      setMessage("login-message", message, true);
    }
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

    if (window.firebaseReady === undefined) {
      window.addEventListener("firebase-ready", watchFirebase, {
        once: true
      });

      setTimeout(() => {
        if (!firebaseStarted) {
          showAuth(
            "Firebase is still loading. Refresh the page and try again."
          );
        }
      }, 5000);
    } else {
      showAuth(
        "Firebase did not load. Check your internet connection and configuration."
      );
    }
  }

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

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
    } else {
      console.warn(`Section not found: ${sectionId}`);
    }

    document.querySelectorAll("[data-section]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.section === sectionId
      );
    });

    const sidebar = $("sidebar");

    if (sidebar) {
      sidebar.classList.remove("open");
    }
  };

  // --------------------------------------------------
  // RESOURCE SEARCH
  // This works on Live Server without a backend.
  // --------------------------------------------------

  function renderResources(container, resources) {
    if (!container) return;

    container.replaceChildren();

    if (!Array.isArray(resources) || resources.length === 0) {
      container.textContent =
        "No resources found. Please try another topic.";
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

  function createSearchResources(topic) {
    const query = encodeURIComponent(topic);

    return [
      {
        title: "YouTube Video Lectures",
        url: `https://www.youtube.com/results?search_query=${query}`
      },
      {
        title: "Khan Academy",
        url: `https://www.khanacademy.org/search?page_search_query=${query}`
      },
      {
        title: "Google Scholar Research Papers",
        url: `https://scholar.google.com/scholar?q=${query}`
      },
      {
        title: "Google Articles and Study Notes",
        url: `https://www.google.com/search?q=${query}`
      },
      {
        title: "Wikipedia",
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${query}`
      }
    ];
  }

  function runSearch(topic) {
    const cleanTopic = String(topic || "").trim();

    if (!cleanTopic) {
      setMessage(
        "smart-search-message",
        "Please enter a topic first.",
        true
      );

      const topicMessage = $("topic-message");

      if (topicMessage) {
        topicMessage.textContent = "Please enter a topic first.";
      }

      return;
    }

    currentTopic = cleanTopic;

    const results = createSearchResources(cleanTopic);

    const title = $("results-title");

    if (title) {
      title.textContent = `Learning resources: ${cleanTopic}`;
    }

    const description = $("results-description");

    if (description) {
      description.textContent =
        "Choose a category below or open a resource.";
    }

    renderResources($("learning-resources"), results);
    renderResources($("smart-search-results"), results);

    setMessage("smart-search-message", "Resources are ready.");

    const topicMessage = $("topic-message");

    if (topicMessage) {
      topicMessage.textContent = "Resources are ready.";
    }

    window.showSection("results-page");
  }

  // Subject selection
  window.chooseTopic = (subject) => {
    currentSubject = subject;

    const input = $("topic-input");

    if (input) {
      input.value = "";
    }

    const message = $("topic-message");

    if (message) {
      message.textContent =
        `Selected: ${subject}. Enter a topic to find resources.`;
    }

    window.showSection("topics");

    if (input) {
      input.focus();
    }
  };

  // Topic search form
  const topicForm = $("topic-search-form");

  if (topicForm) {
    topicForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const topic = $("topic-input")?.value.trim() || "";

      if (!topic) {
        setMessage("topic-message", "Please enter a topic first.", true);
        return;
      }

      const fullTopic = currentSubject
        ? `${currentSubject} ${topic}`
        : topic;

      runSearch(fullTopic);
    });
  }

  // Smart search form
  const smartForm = $("smart-search-form");

  if (smartForm) {
    smartForm.addEventListener("submit", (event) => {
      event.preventDefault();
      runSearch($("smart-topic-input")?.value || "");
    });
  }

  // Global search button
  const globalSearchButton = $("global-search-button");

  if (globalSearchButton) {
    globalSearchButton.addEventListener("click", () => {
      runSearch($("global-search")?.value || "");
    });
  }

  // Pressing Enter in global search also works.
  const globalSearchInput = $("global-search");

  if (globalSearchInput) {
    globalSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runSearch(globalSearchInput.value);
      }
    });
  }

  // --------------------------------------------------
  // CATEGORY PAGES
  // --------------------------------------------------

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
      ["PhET Simulations", "https://phet.colorado.edu/en/simulations"],
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

    if (title) {
      title.textContent = category;
    }

    const description = $("category-description");

    if (description) {
      description.textContent =
        `Resources for ${currentTopic || "your topic"} — ${category}`;
    }

    const container = $("category-results");

    if (container) {
      container.replaceChildren();

      const sources = categorySources[category] || [
        ["Google Search", "https://www.google.com/search?q="],
        ["YouTube", "https://www.youtube.com/results?search_query="]
      ];

      const query = encodeURIComponent(
        `${currentTopic} ${category}`.trim()
      );

      sources.forEach(([name, baseUrl]) => {
        const link = document.createElement("a");

        link.className = "resource-link";
        link.href = baseUrl + query;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = name;

        container.appendChild(link);
      });
    }

    window.showSection("category-page");
  };

  // --------------------------------------------------
  // AI ASSISTANT
  // Requires a working Cloudflare Worker and API.
  // --------------------------------------------------

  function addChatMessage(message, sender) {
    const chat = $("chat-messages");

    if (!chat) return null;

    const bubble = document.createElement("div");

    bubble.className =
      sender === "user"
        ? "chat-message user-message"
        : "chat-message ai-message";

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
      const question = input?.value.trim() || "";

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

      const loadingBubble = addChatMessage(
        "Preparing your answer...",
        "ai"
      );

      try {
        const response = await fetch(
          "https://all-in-one-learnings.hamidch0000.workers.dev/ask-ai",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
          }
        );

        const raw = await response.text();

        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            `The AI server returned an invalid response (HTTP ${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            `AI request failed (HTTP ${response.status}).`
          );
        }

        if (loadingBubble) {
          loadingBubble.textContent =
            data.answer ||
            data.response ||
            "The server did not return an answer.";
        }
      } catch (error) {
        console.error("AI request error:", error);

        if (loadingBubble) {
          loadingBubble.textContent =
            `AI connection failed: ${error.message || "Unknown error"}. ` +
            "Check that the Cloudflare Worker is deployed and its API is working.";
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = "Send";
        }

        if (input) {
          input.focus();
        }
      }
    });
  }

  // --------------------------------------------------
  // CALCULATOR
  // --------------------------------------------------

  window.showCalculatorMode = (mode) => {
   const modes = {
    basic: "basic-calculator",
    scientific: "scientific-calculator",
    percentage: "percentage-calculator",
    power: "power-calculator"
  };

  Object.entries(modes).forEach(([key, id]) => {
    const panel = $(id);

    if (panel) {
      panel.hidden = key !== mode;
      panel.style.display = key === mode ? "block" : "none";
    }
  });

  const result = $("calculator-result");

  if (result) {
    result.textContent = "Result will appear here.";
  }
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

    if (!element || element.value.trim() === "") {
      return null;
    }

    const value = Number(element.value);

    return Number.isFinite(value) ? value : null;
  }

  // Basic operations
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

  divide: () =>
    b === 0 ? "Cannot divide by zero." : a / b,

  modulo: () =>
    b === 0 ? "Cannot divide by zero." : a % b
};

      showResult(
        operations[operation]
          ? operations[operation]()
          : "Choose an operation."
      );
    });
  }

  // Scientific operations
 const scientificButton = $("scientific-calculate");

if (scientificButton) {
  scientificButton.addEventListener("click", () => {
    const value = getNumber("scientific-number");
    const angleInput = $("scientific-angle");
    const angle = angleInput ? angleInput.value : "degrees";
    const radians = angle === "degrees"
      ? value * Math.PI / 180
      : value;

    const operations = {
      square: () => value ** 2,

      sqrt: () =>
        value < 0
          ? "Square root needs a non-negative number."
          : Math.sqrt(value),

      sin: () => Math.sin(radians),
      cos: () => Math.cos(radians),

      tan: () =>
        Math.abs(Math.cos(radians)) < 1e-10
          ? "Undefined for this angle."
          : Math.tan(radians),

      log: () =>
        value <= 0
          ? "Log needs a number greater than zero."
          : Math.log10(value),

      ln: () =>
        value <= 0
          ? "Natural log needs a number greater than zero."
          : Math.log(value),

      abs: () => Math.abs(value)
    };

    const operationInput = $("scientific-operation");
    const resultElement = $("scientific-result");

    if (!operationInput || !resultElement) {
      console.error("Scientific calculator elements not found.");
      return;
    }

    const operation = operationInput.value;
    const calculate = operations[operation];

    if (!calculate) {
      resultElement.textContent = "Please select a valid operation.";
      return;
    }

    const result = calculate();

    resultElement.textContent =
      typeof result === "number" && !Number.isFinite(result)
        ? "Result is undefined."
        : String(result);
  });
}

  // Powers
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

  // --------------------------------------------------
  // EMAIL LOGIN / SIGN-UP
  // --------------------------------------------------

  const loginForm = $("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fb = firebaseFunctions();

      if (!fb || !window.firebaseAuth) {
        setMessage(
          "login-message",
          "Firebase is not ready. Check the Firebase configuration.",
          true
        );
        return;
      }

      const email = $("login-email")?.value.trim();
      const password = $("login-password")?.value;
      const name = $("login-name")?.value.trim();

      if (!email || !password) {
        setMessage(
          "login-message",
          "Enter your email and password.",
          true
        );
        return;
      }

      const submit = $("login-submit");

      if (submit) {
        submit.disabled = true;
        submit.textContent = "Please wait...";
      }

      try {
        if (loginMode === "signup") {
          if (!name) {
            throw new Error("Enter your name to create an account.");
          }

          const result = await fb.createUserWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
          );

          await fb.updateProfile(result.user, {
            displayName: name
          });

          setMessage(
            "login-message",
            "Account created successfully."
          );
        } else {
          await fb.signInWithEmailAndPassword(
            window.firebaseAuth,
            email,
            password
          );
        }
      } catch (error) {
        const messages = {
          "auth/email-already-in-use":
            "This email already has an account. Try logging in.",

          "auth/invalid-email":
            "Enter a valid email address.",

          "auth/weak-password":
            "Use a stronger password with at least 6 characters.",

          "auth/invalid-credential":
            "Email or password is incorrect.",

          "auth/invalid-api-key":
            "Firebase API key is invalid. Check Firebase configuration in index.html.",

          "auth/network-request-failed":
            "Network error. Check your internet connection."
        };

        setMessage(
          "login-message",
          messages[error.code] ||
          error.message ||
          "Authentication failed.",
          true
        );
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent =
            loginMode === "signup" ? "Create Account" : "Login";
        }
      }
    });
  }

  // Forgot password
  const forgotButton = $("forgot-password");

  if (forgotButton) {
    forgotButton.addEventListener("click", async () => {
      const fb = firebaseFunctions();
      const email = $("login-email")?.value.trim();

      if (!email) {
        setMessage(
          "login-message",
          "Enter your email first, then click Forgot Password.",
          true
        );
        return;
      }

      if (!fb || !window.firebaseAuth) {
        setMessage(
          "login-message",
          "Firebase is not ready. Try again shortly.",
          true
        );
        return;
      }

      try {
        await fb.sendPasswordResetEmail(
          window.firebaseAuth,
          email
        );

        setMessage(
          "login-message",
          "Password reset email sent. Check your inbox."
        );
      } catch (error) {
        setMessage(
          "login-message",
          error.message || "Could not send the reset email.",
          true
        );
      }
    });
  }

  // Logout
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

  // --------------------------------------------------
  // MOBILE SIDEBAR
  // --------------------------------------------------

  const menuButton = $("menu-toggle");
  const closeButton = document.getElementById("close-sidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

if (closeButton) {
  closeButton.addEventListener("click", () => {
    sidebar?.classList.remove("open", "active");
    overlay?.classList.remove("visible", "active", "show");
    document.body.classList.remove("sidebar-open");

    if (overlay) {
      overlay.style.display = "none";
    }
  });
}

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const sidebar = $("sidebar");

      if (sidebar) {
        sidebar.classList.toggle("open");
      }
    });
  }

  // --------------------------------------------------
  // TEMPORARY PREVIEW MODE
  // Opens the app without requiring login.
  // --------------------------------------------------

  showScreen("app");
  window.showSection("home");
});

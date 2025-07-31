import "../styles/main.css";
import { examples } from "./examples.js";

const editors = {};

// Initialize all editors
Object.keys(examples).forEach((exampleKey) => {
  const iframe = document.getElementById(`${exampleKey}-editor`);
  if (!iframe) return;

  const currentLang = exampleKey === "typescript" ? "typescript" : "javascript";

  iframe.src = `iframe.html?example=${exampleKey}&language=${currentLang}`;

  editors[exampleKey] = {
    iframe,
    currentLang,
  };

  // Add run button
  const runButton = document.createElement("button");
  runButton.textContent = "Run";
  runButton.className = "playground-btn";
  runButton.style.background = "#10b981";
  runButton.style.color = "white";
  runButton.onclick = () => runCode(exampleKey);

  const buttonContainer = iframe.parentElement.querySelector(
    ".playground-buttons",
  );
  buttonContainer.appendChild(runButton);

  // Add language toggle buttons
  const buttons = buttonContainer.querySelectorAll(
    ".playground-btn[data-lang]",
  );
  buttons.forEach((button) => {
    button.onclick = () => switchLanguage(exampleKey, button.dataset.lang);
  });
});

function switchLanguage(exampleKey, lang) {
  const editorData = editors[exampleKey];
  if (!editorData || !examples[exampleKey][lang]) return;

  editorData.iframe.src = `iframe.html?example=${exampleKey}&language=${lang}`;
  editorData.currentLang = lang;

  // Update button states
  const playground = document.getElementById(
    `${exampleKey}-editor`,
  ).parentElement;
  const buttons = playground.querySelectorAll(".playground-btn[data-lang]");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

function runCode(exampleKey) {
  const editorData = editors[exampleKey];
  if (!editorData) return;
  const outputElement = document.getElementById(`${exampleKey}-output`);
  // Clear previous output
  outputElement.innerHTML = "";

  editorData.iframe.contentWindow.postMessage(
    {
      type: "run-code",
      exampleKey,
    },
    "*",
  );
}

window.addEventListener("message", (message) => {
  if (
    message.data.type === "update-output" &&
    examples[message.data.exampleKey] &&
    message.data.outputContent
  ) {
    const { exampleKey, outputContent } = message.data;
    const outputElement = document.getElementById(`${exampleKey}-output`);
    outputElement.innerHTML = outputContent;
  }
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Package manager tabs
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const tabName = this.dataset.tab;
    const tabContainer = this.closest(".install-tabs");

    // Update button states
    tabContainer.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    this.classList.add("active");

    // Update tab content
    tabContainer.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active");
    });
    tabContainer.querySelector(`#tab-${tabName}`).classList.add("active");
  });
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', function() {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');

    // Prevent body scroll when menu is open
    if (navLinks.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking on a link
  navLinks.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Handle window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    // Reset mobile menu state on larger screens
    mobileMenuBtn?.classList.remove('active');
    navLinks?.classList.remove('active');
    document.body.style.overflow = '';
  }
});


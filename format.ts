@import "tailwindcss";

:root {
  font-family: Vazirmatn, system-ui, sans-serif;
}

html,
body {
  margin: 0;
  background: #ffffff;
  color: #0f172a;
  font-family: Vazirmatn, system-ui, sans-serif;
}

* {
  font-family: Vazirmatn, system-ui, sans-serif;
}

/* numbers should remain readable in latin while keeping farsi feel */
.tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

@keyframes flash-up {
  0% {
    background-color: rgba(16, 185, 129, 0.18);
  }
  100% {
    background-color: transparent;
  }
}
@keyframes flash-down {
  0% {
    background-color: rgba(239, 68, 68, 0.18);
  }
  100% {
    background-color: transparent;
  }
}
.flash-up {
  animation: flash-up 1s ease-out;
}
.flash-down {
  animation: flash-down 1s ease-out;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

const { execSync } = require("child_process");

// Chrome headless : capture de l'accueil en viewport mobile
const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const chrome = chromeCandidates.find((p) => {
  try {
    require("fs").accessSync(p);
    return true;
  } catch {
    return false;
  }
});

if (!chrome) {
  console.error("Chrome introuvable");
  process.exit(1);
}

const url = "http://localhost:3000";
execSync(
  `"${chrome}" --headless=new --disable-gpu --hide-scrollbars --window-size=412,915 --screenshot="${__dirname}/mobile-home.png" --virtual-time-budget=15000 "${url}"`,
  { stdio: "inherit" }
);
console.log("OK -> front/scripts/mobile-home.png");

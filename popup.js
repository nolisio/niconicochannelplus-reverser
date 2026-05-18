const ENABLED_KEY = "nicoAudioSwapEnabled";

const toggle = document.getElementById("enabled");
const status = document.getElementById("status");
const hint = document.getElementById("hint");

function render(enabled) {
  status.textContent = enabled ? "左右反転 ON" : "左右反転 OFF";

  if (!enabled) {
    hint.textContent = "OFF のときはサイトの通常音声のままです。";
    return;
  }

  hint.textContent = "動画ページで有効になります。切り替わらない場合は、ページ内を1回クリックしてください。";
}

async function syncFromStorage() {
  const data = await chrome.storage.local.get({ [ENABLED_KEY]: false });

  toggle.checked = Boolean(data[ENABLED_KEY]);
  render(toggle.checked);
}

toggle.addEventListener("change", async (event) => {
  const enabled = event.target.checked;
  render(enabled);
  await chrome.storage.local.set({ [ENABLED_KEY]: enabled });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (ENABLED_KEY in changes) {
    void syncFromStorage();
  }
});

void syncFromStorage();

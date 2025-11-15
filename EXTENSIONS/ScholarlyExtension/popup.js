
document.getElementById("apply").addEventListener("click", () => {
    const lang = document.getElementById("language").value;
    chrome.storage.sync.set({ targetLang: lang }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });
        });
    });
});

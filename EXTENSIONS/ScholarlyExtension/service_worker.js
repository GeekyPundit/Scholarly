
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "TRANSLATE_TEXT") {
        const apiUrl =
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${msg.target}&dt=t&q=${encodeURIComponent(msg.text)}`;

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => sendResponse({ translated: data[0][0][0] }))
            .catch(() => sendResponse({ translated: msg.text }));

        return true;
    }
});

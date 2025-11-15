
function getTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let nodes=[], n;
    while (n = walker.nextNode()) nodes.push(n);
    return nodes;
}

chrome.storage.sync.get("targetLang", ({ targetLang }) => {
    if (!targetLang) return;
    const nodes = getTextNodes();

    nodes.forEach(node => {
        const text = node.nodeValue.trim();
        if (!text) return;

        chrome.runtime.sendMessage(
            { type: "TRANSLATE_TEXT", text, target: targetLang },
            res => { if (res?.translated) node.nodeValue = res.translated; }
        );
    });
});

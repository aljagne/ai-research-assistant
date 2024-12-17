chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "query") {
    console.log("query from popup:", message.data); // Add a log to know that the message was recieved.
    sendResponse({ data: `You asked: ${message.data}` }); // Mock the background process for now.
  }
});

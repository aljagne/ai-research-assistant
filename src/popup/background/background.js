// Listen for messages sent from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if the message type is "query"
  if (message.type === "query") {
    // Log the received query data to the console
    console.log("query from popup:", message.data); // Add a log to know that the message was received.
    // Send a response back to the sender with the query data
    sendResponse({ data: `You asked: ${message.data}` }); // Mock the background process for now.
  }
});

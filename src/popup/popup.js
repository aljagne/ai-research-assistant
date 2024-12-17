document.addEventListener("DOMContentLoaded", () => {
  const queryInput = document.getElementById("queryInput");
  const resultsDisplay = document.getElementById("resultsDisplay");

  queryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = queryInput.value.trim();
      if (query) {
        // Send message to background script
        chrome.runtime.sendMessage(
          { type: "query", data: query },
          (response) => {
            // Display response from the background script
            resultsDisplay.textContent =
              response?.data || "No response from background script";
          }
        );
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const queryInput = document.getElementById("queryInput");
  const resultsDisplay = document.getElementById("resultsDisplay");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const summarizeButton = document.getElementById("summarizeButton");

  queryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = queryInput.value.trim();
      if (query) {
        resultsDisplay.textContent = ""; // Remove any existing results
        loadingSpinner.style.display = "block"; // Show the loader
        // Send message to background script
        chrome.runtime.sendMessage(
          { type: "query", data: query },
          (response) => {
            loadingSpinner.style.display = "none"; // Hide the loader
            // Display response from the background script
            resultsDisplay.textContent =
              response?.data || "No response from background script";
          }
        );
      }
    }
  });
  summarizeButton.addEventListener("click", () => {
    resultsDisplay.textContent = ""; // Remove any existing results
    loadingSpinner.style.display = "block"; // Show the loader
    chrome.runtime.sendMessage({ type: "summarize" }, (response) => {
      loadingSpinner.style.display = "none"; // Hide the loader
      resultsDisplay.textContent = response?.data || "Could not get summary.";
    });
  });
});

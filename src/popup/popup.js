// Wait for the DOM to fully load before executing the script
document.addEventListener("DOMContentLoaded", () => {
  // Get references to the input field and the results display element
  const queryInput = document.getElementById("queryInput");
  const resultsDisplay = document.getElementById("resultsDisplay");

  // Add an event listener to the input field to listen for keydown events
  queryInput.addEventListener("keydown", (event) => {
    // Check if the pressed key is "Enter"
    if (event.key === "Enter") {
      // Get the trimmed value of the input field
      const query = queryInput.value.trim();
      // If the input field is not empty
      if (query) {
        // Send a message to the background script with the query data
        chrome.runtime.sendMessage(
          { type: "query", data: query },
          (response) => {
            // Display the response from the background script in the results display element
            resultsDisplay.textContent =
              response?.data || "No response from background script";
          }
        );
      }
    }
  });
});

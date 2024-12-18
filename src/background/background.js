import { pipeline, env } from '@xenova/transformers';
env.allowLocalModels = false; // Allow loading local models
let qaPipeline = null;
let summarizationPipeline = null;

// Initialize the pipelines
async function initializePipelines() {
    try {
        // Load the question answering pipeline.
        qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad', {
            local_files_only: true,
            progress_callback: (data) => {
               console.log("question-answering model download progress", data);
            }
       });
        console.log("question-answering pipeline loaded successfully.");

        // Load the summarization pipeline
       summarizationPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6',{
           local_files_only: true,
           progress_callback: (data) => {
              console.log("summarization model download progress", data);
           }
       });
         console.log("summarization pipeline loaded successfully.");

    } catch(e) {
         console.log("There was error during model loading: ", e);
    }
}

initializePipelines();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'query') { // If the message type is 'query', perform question answering.
         const query = message.data; // Get the query from the message.

        // Check if question-answering model is loaded. If not send a message and return.
        if (!qaPipeline) {
            sendResponse({data: "Question answering model is still loading, please try again in some time."})
            return;
        }

         // Get the active tab and its content
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
           if (tabs && tabs.length > 0) { // Check if there is an active tab.
                const activeTab = tabs[0]; // Get the active tab.
                chrome.scripting.executeScript( // Execute script to get content of active tab.
                    {
                      target: { tabId: activeTab.id },
                      function: () => document.body.innerText // Get innerText of the body element.
                    },
                    (results) => {
                       const pageContent = results?.[0]?.result; // Get the text content of the active page.
                       if (pageContent) { // If content is available
                            // call the question answering pipeline
                           qaPipeline(query, pageContent).then((result) => {
                               // Send the answer to popup, or default message if there is no answer.
                               sendResponse({data: result?.answer || "I don't know the answer."});
                           }).catch((e) => {
                               console.log("There was error during question answering:", e)
                              sendResponse({data: "There was some error during question answering."});
                           })
                       } else { // Send error message if content could not be extracted.
                           sendResponse({data: "Could not get the content of the page."})
                       }
                  }
              )
            } else { // Send error message if active tab is not found
                sendResponse({data: "Could not get the active tab."})
            }
        });
        return true; // Keep sendResponse channel open for the async response
    }
    else if (message.type === 'summarize'){ // If message type is summarize, perform summarization.
         // Check if summarization model is loaded. If not, send message and return.
         if (!summarizationPipeline){
              sendResponse({data: "Summarization model is still loading, please try again in some time."});
             return;
         }
         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // Get active tab
           if (tabs && tabs.length > 0) { // Check if there is any active tab
                const activeTab = tabs[0]; // Get the active tab.
               chrome.scripting.executeScript( // Execute script to get content of the page.
                    {
                      target: { tabId: activeTab.id },
                      function: () => document.body.innerText // Get innerText of the body element.
                   },
                   (results) => {
                       const pageContent = results?.[0]?.result; // Get the text content of the active page
                        if(pageContent){ // If content is available
                             // Call the summarization pipeline.
                           summarizationPipeline(pageContent).then((result) => {
                                // Send the summary to the popup or default message if it fails.
                                sendResponse({data: result?.[0]?.summary_text || "Could not generate summary"});
                           }).catch((e) => {
                               console.log("There was error during summarization: ",e);
                                sendResponse({data: "There was some error during summarization."})
                            });
                       } else { // Send error message if page content could not be extracted.
                           sendResponse({data: "Could not get the content of the page."})
                       }
                   }
                )
            } else { // Send error message if no active tab was found.
                sendResponse({data: "Could not get the active tab."})
            }
         })
          return true; // Keep sendResponse channel open for the async response
    }
});

import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false; // Allow loading local models
let qaPipeline = null;

async function initializeQA() {
  qaPipeline = await pipeline(
    "question-answering",
    "Xenova/distilbert-base-uncased-distilled-squad",
    {
      local_files_only: true,
      progress_callback: (data) => {
        console.log(data);
      },
    }
  );
}
// Listen for messages sent from other parts of the extension
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'query') {
      const query = message.data;
        if (!qaPipeline) {
            sendResponse({data: "Model is still loading, please try again in some time."})
            return;
        }

         // Get the active tab and its content
         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
             const activeTab = tabs[0];
             chrome.scripting.executeScript(
                 {
                   target: { tabId: activeTab.id },
                   function: () => document.body.innerText
                 },
                 (results) => {
                     const pageContent = results?.[0]?.result;
                     if (pageContent) {
                         qaPipeline(query, pageContent).then((result) => {
                             sendResponse({data: result?.answer || "I don't know the answer."});
                         }).catch((e) => {
                             console.log(e)
                            sendResponse({data: "There was some error."});
                         })
                     } else {
                         sendResponse({data: "Could not get the content of the page."})
                     }
                }
             )
           } else {
               sendResponse({data: "Could not get the active tab."})
           }
        });
        return true; // Keep sendResponse channel open for the async response
     }
});
```

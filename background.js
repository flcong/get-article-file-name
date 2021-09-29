// Upon installation: set default values of global variables
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.clear(() => {});
    // Set default global variables upon installation
    chrome.storage.sync.set(
        {
            displayButton: true,
            fileNameFormat: "[workingpaper] [forthcoming] [issueyear] [authorsand] [shortjournal] [fulltitle]",
            FCtext: "FC",
            WPtext: "",
            latinOnly: true
        },
        () => {
            console.log("Default values of global variables set.");
        }
    );
    // Print variable values
    chrome.storage.sync.get(
        null,
        (result) => {
            console.log("Global variables:")
            console.log(result);
        }
    )
});

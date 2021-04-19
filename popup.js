let globalStr = ["fileNameFormat", "FCtext", "WPtext"];
let globalCheck = ["displayButton", "latinOnly"];
let githubpage = "https://github.com/flcong/get-article-file-name";

// Get global variables
chrome.storage.sync.get(globalStr.concat(globalCheck),
    (result) => {
        for (let v of globalStr) {
            document.getElementById(v).value = result[v];
        }
        for (let v of globalCheck) {
            document.getElementById(v).checked = result[v];
        }   
});


// Set global variables
document.getElementById("confirm").addEventListener("click", (event) => {
    // Get values from user input
    let fileNameFormat = document.getElementById("fileNameFormat").value;
    let FCtext = document.getElementById("FCtext").value;
    let WPtext = document.getElementById("WPtext").value;
    let displayButton = document.getElementById("displayButton").checked;
    let latinOnly = document.getElementById("latinOnly").checked;
    // Set to storage
    chrome.storage.sync.set(
        {
            displayButton: displayButton,
            fileNameFormat: fileNameFormat,
            FCtext: FCtext,
            WPtext: WPtext,
            latinOnly: latinOnly
        },
        () => {
            console.log("Default values of global variables updated.");
        }
    );
    alert("File name format is updated successfully. Please refresh the current page for the update to take effect.");
});


// Send a message to trigger get file name
document.getElementById("exec-main").addEventListener("click", (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { msg: "exec-main" }, (response) => {
            if (response) {
                console.log("Executed successfully");
            }
        });
    })
});


// Open help page
document.getElementById("help").addEventListener("click", (event) => {
    chrome.tabs.create({url:githubpage});
});
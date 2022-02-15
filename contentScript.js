// =========================================================
// INITIALIZATION
// =========================================================

// Get global variables
let globalStr = ["fileNameFormat", "FCtext"];
let globalCheck = ["displayButton", "latinOnly"];
// Initialization
let displayButton = true;
let fileNameFormat = "";
let FCtext = "";
let WPtext = "";
let latinOnly = true;

// Create the button
chrome.storage.sync.get(["fileNameFormat", "FCtext", "WPtext", "displayButton", "latinOnly"],
(result) => {
    if (isSupported(window.location.host)) {
        // Load global variables
        displayButton = result.displayButton;
        fileNameFormat = result.fileNameFormat;
        FCtext = result.FCtext;
        WPtext = result.WPtext;
        latinOnly = result.latinOnly;
        // Create the button
        if (displayButton) {
            console.log("fileNameFormat: " + fileNameFormat);
            createButton();
        } else {
            removeButton();
        }
    }
});

// Alternative way to get file name: button in popup page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request) {
        if (request.msg == "exec-main") {
            mainProgram();
            sendResponse({sender: "contentScript.js"}); // This response is sent to the message's sender 
        }
    }
});


// =========================================================
// CREATE UI
// =========================================================

// Create button
function createButton() {
    // Create button
    let button = document.createElement("img");
    button.title = "Click to get formatted file name!";
    button.src = chrome.runtime.getURL("images/gafn48.png");
    button.style.position = "fixed";
    button.style.width = "30px";
    button.style.height = "30px";
    button.style.top = "40%";
    button.style.right = "1px";
    button.style.backgroundColor = "transparent";
    button.style.cursor = "pointer";
    button.style.zIndex = 1000;
    button.setAttribute("id", "gafn-float-button");
    document.body.append(button);
    // Add event
    let isMoved = false;
    button.addEventListener("click", function (event) {
        if (!isMoved) {
            mainProgram();
        }
    });
    // Drag
    button.onmousedown = function (event) {
        // Reset flag
        isMoved = false;
        // (1) prepare to moving: make absolute and on top by z-index
        button.style.zIndex = 1000;
    
        // centers the button at (pageX, pageY) coordinates, taking into account scroll
        function moveAt(pageX, pageY) {
            button.style.top = (pageY - window.scrollY - button.offsetHeight / 2 - clickOffset) / window.innerHeight * 100 + "%";
        }
    
        // move our absolutely positioned button under the pointer
        // moveAt(event.pageX, event.pageY);
    
        // Distance between event.pageY and center of the button
        let clickOffset = event.pageY - (parseFloat(button.style.top)/100*window.innerHeight + window.scrollY) - button.offsetHeight/2;
    
        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
            isMoved = true;
        }
    
        // (2) move the button on mousemove
        document.addEventListener('mousemove', onMouseMove);
    
        // (3) drop the button, remove unneeded handlers
        document.onmouseup = function () {
            document.removeEventListener('mousemove', onMouseMove);
            button.onmouseup = null;
        };
    
    };
    button.ondragstart = function () {
        return false;
    };
}

// Remove button
function removeButton() {
    if (document.getElementById("gafn-float-button") != null) {
        document.getElementById("gafn-float-button").remove();
    }
}


// =========================================================
// MAIN FUNCTIONS
// =========================================================

// Check if the website is supported
function isSupported(hostname) {
    supported_list = [
        /[\.\-]sciencedirect[\.\-]/,
        /[\.\-]wiley[\.\-]/,
        /[\.\-]oup[\.\-]/,
        /[\.\-]cambridge[\.\-]/,
        /[\.\-]informs[\.\-]/,
        /[\.\-]uchicago[\.\-]/,
        /[\.\-]ssrn[\.\-]/,
        /[\.\-]allenpress[\.\-]/,
        /[\.\-]aeaweb[\.\-]/,
        /[\.\-]mit[\.\-]/,
        /[\.\-]tandfonline[\.\-]/,
        /arxiv\.org/,
        /dl\.acm\.org/,
        /ieeexplore\.ieee\.org/,
    ];
    out = false;
    for (let pattern of supported_list) {
        if (hostname.match(pattern) != null) {
            out = true;
            break;
        }
    }
    return out;
}


// Main program to prompt file name
function mainProgram() {
    let hostname = window.location.host;
    let fileName = "";
    // try {
        if (hostname.match(/[\.\-]sciencedirect[\.\-]/) != null) {
            fileInfo = getInfoFromScienceDirect();
        } else if (hostname.match(/[\.\-]wiley[\.\-]/) != null) {
            fileInfo = getInfoFromWiley();
        } else if (hostname.match(/[\.\-]oup[\.\-]/) != null) {
            fileInfo = getInfoFromOup();
        } else if (hostname.match(/[\.\-]cambridge[\.\-]/) != null) {
            fileInfo = getInfoFromCambridge();
        } else if (hostname.match(/[\.\-]informs[\.\-]/) != null) {
            fileInfo = getInfoFromInforms();
        } else if (hostname.match(/[\.\-]uchicago[\.\-]/) != null) {
            fileInfo = getInfoFromChicago();
        } else if (hostname.match(/[\.\-]ssrn[\.\-]/) != null) {
            fileInfo = getInfoFromSSRN();
        } else if (hostname.match(/[\.\-]allenpress[\.\-]/) != null) {
            fileInfo = getInfoFromTAR();
        } else if (hostname.match(/[\.\-]aeaweb[\.\-]/) != null) {
            fileInfo = getInfoFromAEA();
        } else if (hostname.match(/[\.\-]mit[\.\-]/) != null) {
            fileInfo = getInfoFromTAR();
        } else if (hostname.match(/[\.\-]tandfonline[\.\-]/) != null) {
            fileInfo = getInfoFromTandF();
        } else if (hostname.match(/arxiv\.org/) != null) {
            fileInfo = getInfoFromArxiv();
        } else if (hostname.match(/dl\.acm\.org/) != null) {
            fileInfo = getInfoFromACM();
        } else if (hostname.match(/ieeexplore\.ieee\.org/) != null) {
            fileInfo = getInfoFromIEEE();
        } else {
            alert("Unsupported website!");
            return;
        }
        // Clean title name
        if (latinOnly) {
            fileInfo.fullTitle = cleanLetters(cleanTitle(fileInfo.fullTitle));
        } else {
            fileInfo.fullTitle = cleanTitle(fileInfo.fullTitle);
        }
        // Clean author names
        for (let i = 0; i < fileInfo.authors.length; ++i) {
            if (latinOnly) {
                fileInfo.authors[i] = cleanLetters(removeExtraSpace(fileInfo.authors[i]));
            } else {
                fileInfo.authors[i] = removeExtraSpace(fileInfo.authors[i]);
            }
        }
        // Clean journal name
        fileInfo.fullJournal = removeExtraSpace(fileInfo.fullJournal);
        console.log(getAuthVar(fileInfo));
        console.log(getYearVar(fileInfo));
        console.log(getTitleVar(fileInfo, 5));
        console.log(getJournalVar(fileInfo));
        console.log(getForthcomingVar(fileInfo, FCtext));
        console.log(getWPVar(fileInfo, WPtext));
        window.prompt("FileName", getFileName(fileInfo, fileNameFormat, FCtext));
    // }
    // catch(err) {
    //     alert("Cannot find article information!");
    // }
}


// Return file name based on the format
function getFileName(obj, format, FCtext) {
    let fileName = "";
    let authorVars = ["auth", "auth1etal", "auth2etal", "auth2etaland", "authors", "authorsand", "authinit1"];
    let yearVars = ["issueyear", "onlineyear"];
    let journalVars = ["fulljournal", "shortjournal"];
    let FCVars = ["forthcoming"];
    let WPVars = ["workingpaper"];
    let matched = format.matchAll(/\[(auth|auth1etal|auth2etal|auth2etaland|authors|authorsand|authinit1|shorttitle\d*|shorttitleinit\d*|camel|fulltitle|issueyear|onlineyear|fulljournal|shortjournal|forthcoming|workingpaper)\]/g);
    matched = [...matched];
    console.log("Format: \"" + format + "\"");
    if (matched.length > 0) {
        // Get strings from the beginning to the first matched
        fileName += format.slice(0, matched[0].index);
        // Loop over each matched variable
        for (let i = 0; i < matched.length; ++i) {
            // Append variable value
            let matchedVar = matched[i][1];
            let matchedVarFull = matched[i][0];
            console.log("Matched variable: " + matchedVar);
            if (authorVars.indexOf(matchedVar) >= 0) {
                // Author-related variables
                let outobj = getAuthVar(obj);
                fileName += outobj[matchedVar];
            } else if (yearVars.indexOf(matchedVar) >= 0) {
                // year-related variables
                let outobj = getYearVar(obj);
                fileName += outobj[matchedVar];
            } else if (journalVars.indexOf(matchedVar) >= 0) {
                // Journal-related variables
                let outobj = getJournalVar(obj);
                fileName += outobj[matchedVar];
            } else if (FCVars.indexOf(matchedVar) >= 0) {
                // Forthcoming
                let outobj = getForthcomingVar(obj, FCtext);
                fileName += outobj[matchedVar];
            } else if (WPVars.indexOf(matchedVar) >= 0) {
                // Working paper
                let outobj = getWPVar(obj, WPtext);
                fileName += outobj[matchedVar];
            } else if (matchedVar.match(/^(short|full)title/) != null) {
                // Title-related variables
                let N = parseInt(matchedVar.match(/^(?:short|full)title(?:init){0,1}(\d*)$/)[1]);
                outobj = getTitleVar(obj, parseInt(N));
                fileName += outobj[matchedVar];
            } else {
                throw("Unmatched variable name: " + matchedVar);
            }
            // Append text between the current variable and the next (or up to the end)
            if (i == matched.length-1) {
                fileName += format.slice(matched[i].index + matchedVarFull.length);
            } else {
                fileName += format.slice(matched[i].index + matchedVarFull.length, matched[i+1].index);
            }
        }
    }
    // Remove extra spaces
    fileName = removeExtraSpace(fileName);
    console.log("FileName: \"" + fileName + "\"");
    return fileName;
}


// =========================================================
// GET CUSTOMIZABLE VARIABLES
// =========================================================


// Get author-related variables
function getAuthVar(obj) {
    let nAuth = obj.authors.length;
    let auth = "";
    let auth1etal = "";
    let auth2etal = "";
    let auth2etaland = "";
    let authors = "";
    let authorsand = "";
    let authinit1 = "";
    // [auth] The last name of the first author
    auth = obj.authors[0];
    // [auth1etal] The last name of the first author, and "et al" if there are more than one.
    auth1etal = obj.authors[0];
    if (nAuth > 1) {
        auth1etal += " et al";
    }
    // [auth2etal] The last name of the first author, and the last name of the second author if there are two authors or "et al" if there are more than two.
    // [auth2etaland] The last name of the first author, and the last name of the second author if there are two authors (with "and" in between) or "et al" if there are more than two.
    if (nAuth == 1) {
        auth2etal = obj.authors[0];
        auth2etaland = auth2etal;
    } else if (nAuth == 2) {
        auth2etal = obj.authors[0] + " " + obj.authors[1];
        auth2etaland = obj.authors[0] + " and " + obj.authors[1];
    } else if (nAuth > 2) {
        auth2etal = obj.authors[0] + " et al";
        auth2etaland = auth2etal;
    }
    // [authors] Last names of all authors without "and"
    authors = obj.authors.join(" ");
    // [authorsand]: Last names of all authors with "and" between the last two if there are more than one.
    let authors2 = obj.authors.slice();
    authorsand = obj.authors.join(" ");
    if (nAuth > 1) {
        authors2.splice(-1, 0, "and");
    }
    authorsand = authors2.join(" ");
    // [authinit1]: The first letters of the last names of all authors combined and capitalized, e.g. "BY" for Bansal and Yaron.
    for (let s of obj.authors) {
        authinit1 += s[0].toUpperCase();
    }

    return {
        auth: auth,
        auth1etal: auth1etal,
        auth2etal: auth2etal,
        auth2etaland: auth2etaland,
        authors: authors,
        authorsand: authorsand,
        authinit1: authinit1,
    }
}


// Get year-related variables
function getYearVar(obj) {
    // [issueyear]: Year of the published issue. It can be missing for forthcoming articles. If missing, use [onlineyear] defined below.
    let issueyear = obj.issueYear;
    // [onlineyear]: Year of first available online in the publisher, which may not be equal to the year of the published issue.
    let onlineyear = obj.onlineYear;

    return {
        issueyear: issueyear,
        onlineyear: onlineyear
    }
}

// Get title-related variables
function getTitleVar(obj, N) {
    let shorttitleN = "";
    let shorttitleinitN = "";
    let camel = "";
    let fulltitleN = "";
    let fulltitleinitN = "";
    let fulltitle = "";
    let N2 = 0;
    // Function words by JabRef
    let funcWords = ["a", "an", "the", "above", "about", "across", "against", "along", "among", "around", "at", "before", "behind", "below", "beneath", "beside", "between", "beyond", "by", "down", "during", "except", "for", "from", "in", "inside", "into", "like", "near", "of", "off", "on", "onto", "since", "to", "toward", "through", "under", "until", "up", "upon", "with", "within", "without", "and", "but", "for", "nor", "or", "so", "yet"];
    // If N is NaN, set as the length
    if (isNaN(N)) {
        N2 = obj.fullTitle.split(" ").length;
    } else {
        N2 = N;
    }
    // Full title related variables
    let fullTitleListN = obj.fullTitle.split(" ").slice(0, N2);
    // Short title related variables (excluding function words)
    let shortTitleList = obj.fullTitle.split(" ");
    for (let i = 0; i < shortTitleList.length; ++i) {
        if (funcWords.indexOf(shortTitleList[i].toLowerCase()) >= 0) {
            shortTitleList[i] = "";
        }
    }
    let shortTitle = removeExtraSpace(shortTitleList.join(" "));
    let shortTitleListN = shortTitle.split(" ").slice(0, N2);
    // [shorttitleN]: The first N words of the title, ignoring any function words.
    shorttitleN = shortTitleListN.join(" ");
    // [shorttitleinitN]: The first letters of [shorttitleN] combined and capitalized, ignoring any function words (see below)
    for (let s of shortTitleListN) {
        shorttitleinitN += s[0].toUpperCase();
    }
    // [camel]: Capitalize the first letter of all words in the title and concatenate them without space. 
    for (let s of obj.fullTitle.split(" ")) {
        camel += upcaseFirstLetter(s);
    }
    // [fulltitle]: Full title unchanged.
    fulltitle = obj.fullTitle;
    // [fulltitleN]: The first N words of the title.
    fulltitleN = fullTitleListN.join(" ");
    // [fulltitleInitN]: The first letters of [fulltitleN] combined and capitalized.
    for (let s of fullTitleListN) {
        fulltitleinitN += s[0].toUpperCase();
    }

    if (isNaN(N)) {
        return {
            [`shorttitle`]: shorttitleN,
            [`shorttitleinit`]: shorttitleinitN,
            camel: camel,
            fulltitle: fulltitle,
            [`fulltitle`]: fulltitleN,
            [`fulltitleinit`]: fulltitleinitN,
        }
    } else {
        return {
            [`shorttitle${N}`]: shorttitleN,
            [`shorttitleinit${N}`]: shorttitleinitN,
            camel: camel,
            fulltitle: fulltitle,
            [`fulltitle${N}`]: fulltitleN,
            [`fulltitleinit${N}`]: fulltitleinitN,
        }
    }

}


// Get journal-related variables
function getJournalVar(obj) {
    let fulljournal = obj.fullJournal;
    let shortjournal = "";
    // Overwrite automatically generated abbreviations
    let overwriteMap = new Map(
        [
            ["econometrica", "ECTA"],
            ["review of economic studies", "ReStud"],
            ["review of economics and statistics", "ReStat"],
            ["rand journal of economics", "RAND"], 
            ["journal of public economics", "JPub"],
            ["american economic journal macroeconomics", "AEJMa"],
            ["american economic journal microeconomics", "AEJMi"],
            ["ssrn", "SSRN"],
            ["arxiv", "Arxiv"]
        ]
    )
    let tmpAbbrev = overwriteMap.get(fulljournal.toLowerCase());
    if (tmpAbbrev == null) {
        // [shortjournal]: First letter of each word in the journal name excluding "of" and "&", allowing for special treatment.
        // but keep the full journal name if fulljournal contains only uppercase letters without space
        // Remove "of", "&", ":", "and", ".", ",", "the" followed by space
        let fulljournal2 = removeExtraSpace(obj.fullJournal.replace(/(\s|^)(of|and|the|&|:|\.|\,)(\s|$)/gi, " ")).trim();
        if (hasUpcaseOnly(fulljournal2)) {
            shortjournal = fulljournal2;
        } else {
            for (let s of fulljournal2.split(" ")) {
                shortjournal += s[0].toUpperCase();
            }
        }
    } else {
        shortjournal = tmpAbbrev;
    }


    return {
        fulljournal: fulljournal,
        shortjournal: shortjournal
    }
}


// Get character to indicate forthcoming
function getForthcomingVar(obj, string) {
    if (obj.isForthcoming) {
        return {forthcoming: string};
    } else {
        return {forthcoming: ""};
    }
}


// Get character to indicate working paper
function getWPVar(obj, string) {
    if (["SSRN","Arxiv"].includes(obj.fullJournal)) {
        return {workingpaper: string};
    } else {
        return {workingpaper: ""};
    }
}


// =========================================================
// FUNCTIONS TO PARSE DIFFERENT PUBLISHERS' WEBSITES
// =========================================================


// www.sciencedirect.com
function getInfoFromScienceDirect() {
    // Get all data in JSON form
    articleInfo = JSON.parse(document.querySelectorAll('script[data-iso-key]')[0].textContent);
    // Title
    let fullTitle = articleInfo.article.titleString;
    // Online year
    let onlineYear = matchYear(articleInfo.article.dates["Available online"]);
    // Forthcoming or not
    let isForthcoming = !("vol-first" in articleInfo.article);
    // Issue year (it is equal to onlineYear for forthcoming articles)
    let issueYear = matchYear(articleInfo.article.dates["Publication date"]);
    // Authors
    let authors = [];
    for (let obj of findObj(articleInfo.authors.content[0].$$, "#name", "author")) {
        authors.push(findObj(obj.$$, "#name", "surname")[0]._);
    }
    // Journal
    let fullJournal = articleInfo.article.srctitle;

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// onlinelibrary.wiley.com
function getInfoFromWiley() {
    // Get all data in JSON form
    jsonstr = document.getElementById("analyticDigitalData").textContent;
    digitalData = JSON.parse(jsonstr.slice(jsonstr.match(/{/).index));
    let articleInfo = digitalData;
    // Title
    let fullTitle = articleInfo.publication.item.title;
    // Online year
    let onlineYear = matchYear(articleInfo.publication.item.earliestDate);
    // Forthcoming or not
    let isForthcoming = (articleInfo.publication.group.coverDate == null);
    // Issue year
    let issueYear = isForthcoming ? onlineYear : matchYear(articleInfo.publication.group.coverDate);
    // Authors
    let authors = [];
    // NOTE: Wiley changed (at least as of 2022-01-18) their website format so 
    // the following code does not work anymore.
    // for (let auth of document.getElementById("sb-1").getElementsByClassName("author-name")) {
    //     let authSurnames = auth.href.match(/ContribAuthor(?:Stored|Raw)=(.*)%2C/)[1].split("+");
    //     for (let i = 0; i < authSurnames.length; ++i) {
    //         authSurnames[i] = upcaseFirstLetter(decodeURI(authSurnames[i]));
    //     }
    //     authors.push(authSurnames.join(" "));
    // }
    for (let auth of findObj(document.getElementsByTagName("meta"), "name", "citation_author")) {
        authors.push(getLastName(auth.getAttribute("content"), "F L"));
    }

    // Journal
    let fullJournal = cleanJournal(articleInfo.publication.series.title);

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// academic.oup.com
function getInfoFromOup() {
    // Get all data in JSON form
    articleInfo = JSON.parse(document.querySelectorAll("script[type='application/ld+json']")[0].textContent);
    // Title
    let fullTitle = articleInfo.name;
    // Online year
    let onlineYear = matchYear(articleInfo.datePublished);
    // Forthcoming or not
    let isForthcoming = (articleInfo.isPartOf.isPartOf == null);
    // Issue year
    let issueYear = isForthcoming ? onlineYear : matchYear(articleInfo.isPartOf.datePublished);
    // Authors
    let authors = [];
    for (let auth of articleInfo.author) {
        // authors.push(auth.name.match(/^([^,]*),/)[1]);
        authors.push(getLastName(auth.name, "L, F"));
    }
    // Journal
    let fullJournal = cleanJournal(isForthcoming ? articleInfo.isPartOf.name : articleInfo.isPartOf.isPartOf.name);

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// www.cambridge.org
function getInfoFromCambridge() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "citation_title")[0].getAttribute("content");
    // Online year
    let onlineYear = matchYear(findObj(document.getElementsByTagName("meta"), "name", "citation_online_date")[0].getAttribute("content"));
    // Issue year
    let issueYear = matchYear(findObj(document.getElementsByTagName("meta"), "name", "citation_publication_date")[0].getAttribute("content"));
    // Forthcoming or not
    let isForthcoming = (issueYear == null);
    if (issueYear == null) {
        issueYear = onlineYear;
    }
    // Authors
    let authors = [];
    // nobiliaryArticles = ["von", "van", "de", "du", "des", "del", "della", "di"];
    for (let auth of findObj(document.getElementsByTagName("meta"), "name", "citation_author")) {
        // let nameComp = auth.getAttribute("content").trim().split(" ");
        // // Check if the second-last element is von, van, de, du, des, del, della, di
        // if (nameComp.length >= 2 && nobiliaryArticles.includes(nameComp[nameComp.length-2].toLowerCase())) {
        //     authors.push(nameComp.slice(-2).join(" "));
        // } else {
        //     authors.push(nameComp[nameComp.length-1]);
        // }
        authors.push(getLastName(auth.getAttribute("content"), "F L"));
    }
    // Journal
    let fullJournal = cleanJournal(findObj(document.getElementsByTagName("meta"), "name", "citation_journal_title")[0].getAttribute("content"));

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// pubsonline.informs.org
function getInfoFromInforms() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "dc.Title")[0].getAttribute("content");
    // Online year
    let onlineYear = matchYear(findObj(document.getElementsByTagName("meta"), "name", "dc.Date")[0].getAttribute("content"));
    // Issue year and Forthcoming or not
    let isForthcoming = false;
    let issueYear = "";
    let volumeDate = document.getElementsByClassName("volume--date");
    if (volumeDate.length > 0) {
        issueYear = matchYear(volumeDate[0].textContent);
        isForthcoming = false;
    } else {
        issueYear = onlineYear;
        isForthcoming = true;
    }
    // Authors
    let authors = [];
    for (let auth of document.getElementById("sb-1").getElementsByClassName("entryAuthor")) {
        authors.push(decodeURI(auth.href.match(/text1=(.*?)\%2C/)[1]));
    }
    // Journal
    let fullJournal = cleanJournal(findObj(document.getElementsByTagName("meta"), "name", "citation_journal_title")[0].getAttribute("content"));

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// journals.uchicago.edu
function getInfoFromChicago() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "dc.Title")[0].getAttribute("content");
    // Online year
    let onlineYear = matchYear(findObj(document.getElementsByTagName("meta"), "name", "dc.Date")[0].getAttribute("content"));
    // Issue year and Forthcoming or not
    let isForthcoming = false;
    let issueYear = "";
    let volumeDate = document.getElementsByClassName("current-issue__date");
    if (volumeDate.length > 0) {
        issueYear = matchYear(volumeDate[0].textContent);
        isForthcoming = false;
    } else {
        issueYear = onlineYear;
        isForthcoming = true;
    }
    // Authors
    let authors = [];
    for (let auth of document.getElementById("sb-1").getElementsByClassName("bottom-info")) {
        let authSurnames = auth.getElementsByTagName("a")[0].href.match(/ContribAuthorRaw=(.*)%2C/)[1].split("+");
        for (let i = 0; i < authSurnames.length; ++i) {
            authSurnames[i]= upcaseFirstLetter(decodeURI(authSurnames[i]));
        }
        authors.push(authSurnames.join(" "));
    }
    // Journal
    let fullJournal = cleanJournal(document.getElementsByClassName("metadata_title")[0].textContent.trim());

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// ssrn.com
function getInfoFromSSRN() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "citation_title")[0].getAttribute("content");
    // Online year & Issue year
    let dateInfo = document.querySelector("p.note-list").children
    let onlineYear = matchYear(dateInfo[dateInfo.length-1].textContent);
    let issueYear = onlineYear;
    // Forthcoming or not
    let isForthcoming = false;
    // Authors
    let authors = [];
    for (let auth of findObj(document.getElementsByTagName("meta"), "name", "citation_author")) {
        // authors.push(auth.getAttribute("content").match(/^([^,]*),/)[1]);
        authors.push(getLastName(auth.getAttribute("content"), "L, F"));
    }
    // Journal
    let fullJournal = "SSRN";

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// The Accounting Review (meridian.allenpress.com)
function getInfoFromTAR() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "citation_title")[0].getAttribute("content");
    // Online year
    let onlineYear = matchYear(document.querySelector("span.article-date").textContent);
    // Forthcoming or not
    let dateInfo = findObj(document.getElementsByTagName("meta"), "name", "citation_publication_date")
    let isForthcoming = (dateInfo.length == 0);
    // Issue year
    let issueYear = isForthcoming ? onlineYear : matchYear(dateInfo[0].getAttribute("content"));
    // Authors
    let authors = [];
    for (let auth of findObj(document.getElementsByTagName("meta"), "name", "citation_author")) {
        // authors.push(auth.getAttribute("content").match(/^([^,]*),/)[1]);
        authors.push(getLastName(auth.getAttribute("content"), "L, F"));
    }
    // Journal
    let fullJournal = cleanJournal(findObj(document.getElementsByTagName("meta"), "name", "citation_journal_title")[0].getAttribute("content"));

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}

// AEA
function getInfoFromAEA() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "citation_title")[0].getAttribute("content");
    // Online year
    let onlineYear = "";
    // Forthcoming or not
    let dateInfo = findObj(document.getElementsByTagName("meta"), "name", "citation_publication_date")
    let isForthcoming = (dateInfo.length == 0);
    // Issue year
    let issueYear = isForthcoming ? onlineYear : matchYear(dateInfo[0].getAttribute("content"));
    // Authors
    let authors = [];
    for (let auth of findObj(document.getElementsByTagName("meta"), "name", "citation_author")) {
        // authors.push(auth.getAttribute("content").match(/^([^,]*),/)[1]);
        authors.push(getLastName(auth.getAttribute("content"), "L, F"));
    }
    // Journal
    let fullJournal = cleanJournal(findObj(document.getElementsByTagName("meta"), "name", "citation_journal_title")[0].getAttribute("content"));

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// MIT Press (RES)
// The same as TAR


// Taylor and Francis
function getInfoFromTandF() {
    // Title
    let fullTitle = findObj(document.getElementsByTagName("meta"), "name", "dc.Title")[0].getAttribute("content");
    // Online year
    let onlineYear = matchYear(findObj(document.getElementsByTagName("meta"), "name", "dc.Date")[0].getAttribute("content"));
    // Issue year and Forthcoming or not
    let isForthcoming = false;
    let issueYear = matchYear(document.querySelectorAll("span.issue-heading")[0].textContent);
    if (issueYear == null) {
        issueYear = onlineYear;
        isForthcoming = true;
    } else {
        isForthcoming = false;
    }
    // Authors
    let authors = [];
    for (let auth of document.querySelectorAll("span.NLM_contrib-group")[0].children) {
        let authSurnames = auth.getElementsByTagName("a")[0].href.match(/\/author\/(.*)%2C/)[1].split("+");
        for (let i = 0; i < authSurnames.length; ++i) {
            authSurnames[i]= upcaseFirstLetter(decodeURI(authSurnames[i]));
        }
        authors.push(authSurnames.join(" "));
    }
    // Journal
    let fullJournal = cleanJournal(findObj(document.getElementsByTagName("meta"), "name", "citation_journal_title")[0].getAttribute("content"));

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// Arxiv.org
function getInfoFromArxiv() {
    // Title
    let fullTitle = document.getElementsByName('citation_title')[0].getAttribute('content');
    // Online year & Issue year
    let onlineYear = document.getElementsByName('citation_online_date')[0].getAttribute('content').match(/(\d*)\//)[1];
    let issueYear = onlineYear;
    // Forthcoming or not
    let isForthcoming = false;
    // Authors
    let authors = [];
    for (let auth of document.getElementsByName('citation_author')) {
        // let authSurname = auth.getAttribute('content').match(/([^,]*),/)[1]
        // authors.push(authSurname);
        authors.push(getLastName(auth.getAttribute("content"), "L, F"));
    }
    // Journal
    let fullJournal = 'Arxiv';

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// ACM
function getInfoFromACM() {
    // Title
    let fullTitle = document.getElementsByClassName("citation__title")[0].textContent;
    // Online year & Issue year
    let onlineYear = document.getElementsByClassName("CitationCoverDate")[0].textContent.match(/(\d{4})/)[1];
    let issueYear = document.getElementsByClassName("epub-section__date")[0].textContent.match(/(\d{4})/)[1];
    // Forthcoming or not
    let isForthcoming = false;
    // Authors
    let authors = [];
    for (let auth of document.getElementsByClassName('loa__author-name')) {
        authors.push(getLastName(auth.textContent, "F L"));
    }
    // Journal
    let fullJournal = document.getElementsByClassName("article__tocHeading")[2].textContent

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// IEEE
function getInfoFromIEEE() {
    // Get metadata
    for (let elem of document.querySelectorAll("script[type='text/javascript']:not([src])")) {
        tmpmatched = elem.textContent.match("xplGlobal.document.metadata=")
        if (tmpmatched != null) {
            break;
        }
    }
    let istart = tmpmatched.index + 28;
    let iend = tmpmatched.input.slice(istart).match("};").index;
    let tmptext = tmpmatched.input.slice(istart, istart+iend+1);
    ieeemetadata = JSON.parse(tmptext);
    // Title
    let fullTitle = ieeemetadata["title"];
    // Online year & Issue year
    let oymatched = ieeemetadata["onlineDate"].match(/(\d{4})/)
    let issueYear = ieeemetadata["publicationDate"].match(/(\d{4})/)[1];
    if (oymatched == null) {
        onlineYear = issueYear;
    } else {
        onlineYear = oymatched[1];
    }
    // Forthcoming or not
    let isForthcoming = false;
    // Authors
    let authors = [];
    for (let auth of ieeemetadata["authors"]) {
        authors.push(auth.lastName);
    }
    // Journal
    // let fullJournal = ieeemetadata["publicationTitle"];
    let fullJournal = ieeemetadata["publisher"];

    return {
        authors: authors,
        fullTitle: fullTitle,
        onlineYear: onlineYear,
        issueYear: issueYear,
        isForthcoming: isForthcoming,
        fullJournal: fullJournal
    };
}


// =========================================================
// UTILITY FUNCTIONS
// =========================================================

// Get last name
function getLastName(string, nameFormat) {
    let lastName = "";
    if (nameFormat == "L, F") {
        // The format is "LastName, FirstName": match by ','
        lastName = removeExtraSpace(string).trim().match(/^([^,]*),/)[1].trim();
    } else if (nameFormat == "F L") {
        // The format is "FirstName LastName": split by ' ' and select the last
        // taking into account nobiliary articles
        let nameComp = removeExtraSpace(string).trim().split(" ");
        // Check if the second-last element is von, van, de, du, des, del, della, di
        nobiliaryArticles = ["von", "van", "de", "du", "des", "del", "della", "di"];
        if (nameComp.length >= 2 && nobiliaryArticles.includes(nameComp[nameComp.length-2].toLowerCase())) {
            lastName = nameComp.slice(-2).join(" ");
        } else {
            lastName = nameComp[nameComp.length-1];
        }
    }
    return formatLastName(lastName);
}

// Format author last name
function formatLastName(string) {
    let outstr = string;
    if (getPctUpcase(string) > 0.5) {
        // Change first letter of any word into uppercase
        if (outstr.match(/\s/) == null) {
            outstr = outstr.charAt(0).toUpperCase() + outstr.toLowerCase().slice(1);
        } else {
            outstr = outstr.split(' ').map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)).join(' ');
        }
    }
    return outstr;
}

// Percentage of uppercase letters
function getPctUpcase(string) {
    let result = 0;
    for (let i = 0; i < string.length; i += 1) {
        if (string.charCodeAt(i) > 64 && string.charCodeAt(i) < 91 ) {
            result += 1;
        }
    }
    return result / string.length;
}

// Function to remove special characters in title
function cleanTitle(string) {
    return string.trim().replace(/[:,\?\/\*\!"`&\(\)\.“”]/g, "").replace(/\s+/g, " ").trim();
}

// Function to keep the first letter upcase and other lower case
function upcaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Function to match a year between 1900 and 2100 in a string
function matchYear(string) {
    matched = string.match(/[0129]{2}\d{2}/);
    if (matched == null) {
        return null;
    } else {
        return matched[0];
    }
}

// Function to clean letters
function cleanLetters(string) {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("ø", "o");
}

// Function to clean journal name
function cleanJournal(string) {
    // Remove the first "the" if it is not The Accounting Review
    if (removeExtraSpace(string.trim()).toLowerCase() != "the accounting review") {
        return string.replace(/^the/i, "").replace(/:/, "").trim();
    } else {
        return string;
    }
}

// Function to check if the string contains only uppercase letters
function hasUpcaseOnly(string) {
    let out = true;
    for (let s of string) {
        if (s < 'A' || s > 'Z') {
            out = false;
            break;
        }
    }
    return out;
}

// Function to return a list of objects with specific property values
function findObj(objList, prop, value) {
    let out = [];
    for (let obj of objList) {
        if (obj[prop] == value) {
            out.push(obj);
        }
    }
    return out;
}

// Function to remove extra spaces
function removeExtraSpace(string) {
    return string.replace(/\s{2,}/g, " ").trim();
}
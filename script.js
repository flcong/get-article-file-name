getArticleInfo();


function getArticleInfo() {
    let hostname = window.location.host;
    let fileName = "";
    if (hostname.indexOf(".sciencedirect.") >= 0) {
        fileName = getInfoFromScienceDirect();
    } else if (hostname.indexOf(".wiley.") >= 0) {
        fileName = getInfoFromWiley();
    } else if (hostname.indexOf(".oup.") >= 0) {
        fileName = getInfoFromOup();
    } else if (hostname.indexOf(".cambridge.") >= 0) {
        fileName = getInfoFromCambridge();
    } else if (hostname.indexOf(".informs.") >= 0) {
        fileName = getInfoFromInforms();
    } else if (hostname.indexOf(".uchicago.") >= 0) {
        fileName = getInfoFromChicago();
    } else {
        fileName = "Invalid";
    }
    window.prompt("FileName", cleanFileName(fileName));
}

// www.sciencedirect.com
function getInfoFromScienceDirect() {
    // Title
    let articleTitle = document.getElementsByClassName("title-text")[0].textContent;
    // Year
    let pubText = document.getElementById("publication").textContent;
    let articleYear = matchYear(pubText);
    // Authors
    let authors = [];
    for (let auth of document.getElementById("author-group").children) {
        let authSurname = auth.getElementsByClassName("surname")[0];
        if (authSurname != null) {
            authors.push(cleanLetters(authSurname.textContent));
        }
    }
    // Forthcoming or not
    let fcText = "";
    if (pubText.match(/In Press/) != null) {
        fcText = "FC ";
    }
    return fcText + articleYear + " " + addAnd(authors).join(" ") + " " + articleTitle;
}

// onlinelibrary.wiley.com
function getInfoFromWiley() {
    // Title
    let articleTitle = document.getElementsByClassName("citation__title")[0].textContent;
    // Year and Forthcoming or not
    let fcText = "";
    let articleYear = "";
    let matched = matchMonthYear(document.getElementsByClassName("extra-info-wrapper")[0].textContent);
    if (matched == null) {
        fcText = "FC ";
        articleYear = matchYear(document.getElementsByClassName("epub-date")[0].textContent);
    } else {
        articleYear = matched[2];
    }
    // Authors
    let authors = [];
    for (let auth of document.getElementById("sb-1").getElementsByClassName("author-name")) {
        let authSurnames = auth.href.match(/ContribAuthorStored=(.*)%2C/)[1].split("+");
        for (let i = 0; i < authSurnames.length; ++i) {
            authSurnames[i] = upcaseFirstLetter(decodeURI(authSurnames[i]));
        }
        authors.push(cleanLetters(authSurnames.join(" ")));
    }
    return fcText + articleYear + " " + addAnd(authors).join(" ") + " " + articleTitle;
}

// academic.oup.com
function getInfoFromOup() {
    // Title
    let articleTitle = document.getElementsByClassName("article-title-main")[0].textContent.trim();
    // Year and Forthcoming or not
    let fcText = "";
    let articleYear = "";
    let pubText = document.getElementsByClassName("ww-citation-primary")[0].textContent;
    if (pubText.match("Volume") == null) {
        fcText = "FC ";
        articleYear = matchYear(document.getElementsByClassName("citation-date")[0].textContent);
    } else {
        articleYear = matchYear(pubText);
    }
    // Authors
    let authors = [];
    for (let auth of document.getElementsByClassName("al-authors-list")[0].getElementsByClassName("al-author-name-more")) {
        let fullName = decodeURI(auth.getElementsByClassName("linked-name")[0].textContent);
        let surnameFirst = decodeURI(auth.getElementsByClassName("info-card-search-google")[0].children[0].href.match(/\%22(.*?)\%2/)[1])
        authors.push(cleanLetters(fullName.slice(fullName.lastIndexOf(surnameFirst))))
    }
    return fcText + articleYear + " " + addAnd(authors).join(" ") + " " + articleTitle;
}

// www.cambridge.org
function getInfoFromCambridge() {
    let headInfo = document.getElementById("maincontent")
    let citationText = document.getElementsByClassName("content__journal")[0].textContent
    // Title
    let articleTitle = headInfo.children[0].textContent
    // Year and Forthcoming or not
    let fcText = "";
    let articleYear = "";
    let matched = matchMonthYear(citationText);
    if (matched == null) {
        fcText = "FC ";
        articleYear = matchYear(headInfo.getElementsByClassName("published-date")[0].textContent);
    } else {
        articleYear = matched[2];
    }
    // Authors
    let authors = [];
    nobiliaryArticles = ["von", "van", "de", "du", "des", "del", "della", "di"];
    for (let auth of document.getElementsByClassName("authors")[0].children) {
        let nameComp = auth.getElementsByClassName("text")[0].textContent.trim().split(" ");
        // Check if the second-last element is von, van, de, du, des, del, della, di
        if (nameComp.length >= 2 && nobiliaryArticles.includes(nameComp[nameComp.length-2].toLowerCase())) {
            authors.push(cleanLetters(nameComp.slice(-2).join(" ")));
        } else {
            authors.push(cleanLetters(nameComp[nameComp.length-1]));
        }
    }
    return fcText + articleYear + " " + addAnd(authors).join(" ") + " " + articleTitle;
}

// pubsonline.informs.org
function getInfoFromInforms() {
    // Title
    let articleTitle = document.getElementsByClassName("citation__title")[0].textContent;
    // Year and Forthcoming or not
    let fcText = "";
    let articleYear = "";
    let volumeDate = document.getElementsByClassName("volume--date");
    if (volumeDate.length > 0) {
        articleYear = matchYear(volumeDate[0].textContent);
    } else {
        fcText = "FC ";
        articleYear = matchYear(document.getElementsByClassName("epub-section__date")[0].textContent);
    }
    // Authors
    let authors = [];
    for (let auth of document.getElementById("sb-1").getElementsByClassName("entryAuthor")) {
        authors.push(cleanLetters(decodeURI(auth.href.match(/text1=(.*?)\%2C/)[1])));
    }
    return fcText + articleYear + " " + addAnd(authors).join(" ") + " " + articleTitle;
}

// journals.uchicago.edu
function getInfoFromChicago() {
    // Title
    let articleTitle = document.getElementsByClassName("citation__title")[0].textContent;
    // Year and Forthcoming or not
    let fcText = "";
    let articleYear = "";
    let volumeDate = document.getElementsByClassName("current-issue__date");
    if (volumeDate.length > 0) {
        articleYear = matchYear(volumeDate[0].textContent);
    } else {
        fcText = "FC ";
        articleYear = matchYear(document.getElementsByClassName("article-chapter-history-list")[0].textContent);
    }
    // Authors
    let authors = [];
    for (let auth of document.getElementById("sb-1").getElementsByClassName("bottom-info")) {
        let authSurnames = auth.getElementsByTagName("a")[0].href.match(/ContribAuthorRaw=(.*)%2C/)[1].split("+");
        for (let i = 0; i < authSurnames.length; ++i) {
            authSurnames[i]= upcaseFirstLetter(decodeURI(authSurnames[i]));
        }
        authors.push(cleanLetters(authSurnames.join(" ")));
    }
    return fcText + articleYear + " " + addAnd(authors).join(" ") + " " + articleTitle;
}

// Function to remove symbols that cannot be in file name
function cleanFileName(string) {
    return string.trim().replace(/[:,\?\/]/g, "").replace(/\s+/g, " ");
}

// Function to keep the first letter upcase and other lower case
function upcaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Function to add "and" between the last and second-last authors
function addAnd(strarr) {
    if (strarr.length > 1) {
        strarr.splice(-1, 0, "and");
    }
    return strarr;
}

// Function to match a year between 1900 and 2100 in a string
function matchYear(string) {
    return string.match(/[0129]{2}\d{2}/)[0];
}

// Function to match a Month and Year
function matchMonthYear(string) {
    return string.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s([0129]{2}\d{2})/);
}

// Function to clean letters
function cleanLetters(string) {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("%C3%B8", "o");
}
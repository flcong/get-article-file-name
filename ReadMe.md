# Generate Article File Name
Current Version: 1.0

## Motivation

Downloading academic articles is a routine in a researcher's life. Different people have different conventions to rename these pdf-format articles. I have adopted a more detailed approach with the year, last names of the authors, and the title showing up in the pdf file name. However, it is tedious and time-consuming to type such information every time when I download an article. Therefore, I develop this extension to facilitate this procedure.

## Introduction

This extension parse the article website to get information about the article and generate a file name for the article in the following form: `"[FC] {Year} {Authors' last names} {Title}"`. If the article is published, the `{Year}` variable is the year of the issue. If the article is an advanced article, `"FC"` is added and the `{Year}` variable is the year when the article is available online. Examples are:

* "2016 Berk and van Binsbergen Assessing asset pricing models using revealed preference"
* "FC 2021 Favara Gao and Giannetti Uncertainty access to debt and firm precautionary behavior"

Note that the extension `".pdf"` is not automatically added to the generated file name.

## Usage

Go to the website of an article and simply click on the extension icon. A prompt will show up with the generated article file name that is already in selection (see the following screenshot). Then, you can simply use `Ctrl+C` to copy the name and rename the pdf-file of the article downloaded.

<img src="get-article-file-name-screenshot.jpg" style="zoom:33%;" />

Access to the content of the article is not required since only free citation info is parsed.

NOTE: Here "the website of an article" represents the webpage with the HTML-format of the article, not the pdf-file of the article. An example is this [link](https://www.sciencedirect.com/science/article/pii/S0304405X1500149X).

## Publishers currently supported

Currently, the following publishers are supported. More will be added at request:

* Elsevier: Journal of Financial Economics, Journal of Monetary Economics, Journal of Banking & Finance, etc.
* Wiley: Journal of Finance, Econometrica, etc.
* Oxford: Review of Financial Studies, etc.
* Cambridge: Journal of Financial and Quantitative Analysis, etc.
* INFORMS: Management Science, etc.
* UChicago: Journal of Political Economy, etc.

## Future plan

In the current 1.x version, the generated file name is not customizable. In the next version (2.x), some pre-defined variables will be available and users are allowed to customize the format of the file name.
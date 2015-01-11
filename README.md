capstone2014-firefoxOS
======================

[![Build Status](https://travis-ci.org/askore/capstone2014-firefoxOS.svg?branch=master)](https://travis-ci.org/askore/capstone2014-firefoxOS)

Javascript APIs for offline communications in Firefox OS. PSU CS Capstone 2014

Framework Setup / Development Practices
======================

Currently, we are using nodeJs (JavaScript on the command line) along  
with grunt (a node task runner). These combined with bower (a  
dependency manager) and Karma (unit testing) allow for a pretty good  
combination for testing and developing code.  

#####Git for Windows
It is necessary to have git in Windows' PATH else you won't be able to install bower later. If you already have git in Windows' PATH or else aren't using Windows, you may skip until the Node.js section.

1. Download Git (http://git-scm.com/download/win) 
2. Begin installing Git and during the install process select "Use Git from the Windows Command Prompts" which will put git in Windows' PATH

#####Node.js 
Download nodeJS (http://nodejs.org/)  
Open up the Node.js Command Prompt  
Navigate to your local firefox-OS repo  

Run the following commands  

`npm install`

`npm install -g grunt-cli`  

`npm install -g bower`  

`bower install`

`grunt build`

The build task will recompile the library and run the tests. If you've updated the test and only need to rerun them:
`grunt test`  

You'll see a bunch of tests get run and pass.  

**NetBeans**  
Download NetBeans from https://netbeans.org/downloads/  
Open NetBeans, create a "New Project", then select "HTML5 Application with Existing Sources"  
The "lib" folder will hold our API prototypes  
The "test/spec" folder will hold our tests files  


API Usage
======================

All functionality is exposed through a global object called "AL" (for AJAX Library).

#### AJAX Requests
To make an AJAX request use the AL.ajax() method.

```AL.ajax(url [, data] [, success])```

An XMLHttpRequest object will be created using `url` as the endpoint. <br>
`data`, if provided, will be JSON-encoded and passed to the endpoint.<br>
`success` will be called when the request has completed successfully<br>

The API will use a GET request if there is no data, otherwise it will be a POST.

If the data argument is a function, it will be used as the success function. 

The success function is passed 3 arguments:<br>
`success(Object responseBody, String status, XMLHttpRequest xhr)`

`responseBody` will be the data that is received back from the endpoint.<br>
`status` is the status code of the request (200, 404, etc)<br>
`xhr` is the actual XMLHttpRequest object that was used to make the request<br>

#### Latency Recording and Analysis
When the library is used for an AJAX request, information about the request is recorded
for later analysis.

##### Latest Access Timestamp
Retrieve the timestamp of the last time a request was completed.

`AL.getLatestAccessTimeStamp(callback)`

`callback` will be called with the latest access timestamp or null.

##### Request History
Retrieve the entire history of requests.

`AL.getHistory(callback)`

`callback` will be called with an array of objects representing all requests sent.<br>
Each history object is of the form:

```javascript
{
    begin: Timestamp,
    end: Timestamp,
    size: integer
}
```

`begin` is the timestamp of when the request was made.<br>
`end` is the timestamp of when the request was finished.<br>
`size` is the size of the request data (if any, if none, size is 0)

Entries are in chronological order (newest ones are last).

`AL.getLatestAccessTimeStamp` is the same as calling `AL.getHistory`,
getting the last entry and reading the `end` timestamp. 

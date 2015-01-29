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

#####NetBeans
######Downloading NetBeans and Loading Project  
Download NetBeans from https://netbeans.org/downloads/  
Open NetBeans, create a "New Project", then select "HTML5 Application with Existing Sources"  
The "lib" folder will hold our API prototypes  
The "test/spec" folder will hold our tests files

######Setting Up Tabbing Standards
1. Within NetBeans, select 'Tools' and then 'Options'
2. Select the 'Editor' icon at the top followed by the 'Formatting' tab
3. Set the 'Language:' tab to 'All Languages'
4. Make sure 'Expand Tabs to Spaces' is unchecked
5. Set 'Tab Size:' to 4
6. Save settings by clicking 'OK'

![Tabbing Standard](https://cloud.githubusercontent.com/assets/3056597/5869687/cb0882dc-a271-11e4-8464-d817ad645efa.png)





Testing App
======================

A Firefox OS app for testing the battery performance of using the API. Load it into the firefox webIDE, and run it.
Make sure you run "grunt build" before running it, because it relies on dist/firefoxos.js.



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

#### Non-critical AJAX Requests
A non-critical request is added to a queue and waits until conditions are good enough to be fired. 

```AL.addNonCriticalRequest(url, data, callback)```

The parameters are the same as the AL.ajax method.

#### Latency Recording and Analysis
When the library is used for an AJAX request, information about the request is recorded
for later analysis.

##### Latest Access Timestamp
Retrieve the timestamp of the last time a request was completed.

`AL.getLatestAccessTimeStamp(callback)`

`callback` will be called with the latest access timestamp or null.

##### Request History
Retrieve the history of requests.<br>
A maximum of 10,000 requests will be logged. When the 10,001 request would be logged, the oldest entry will be removed first.

`AL.getHistory(callback)`

`callback` will be called with an array of objects representing all requests sent.<br>
Each history object is of the form:

```javascript
{
    begin: Timestamp,
    end: Timestamp,
    size: integer
    origin: string
    id: integer
}
```

`begin` is the timestamp of when the request was made.<br>
`end` is the timestamp of when the request was finished.<br>
`size` is the size of the request data (if any, if none, size is 0)
`origin` is a string containing either "critical" or "non critical"
`id` is a integer that increases every request starting at 1

Entries are in chronological order (newest ones are last).

`AL.getLatestAccessTimeStamp` is the same as calling `AL.getHistory`,
getting the last entry and reading the `end` timestamp. 

`AL.getNextID(callback)` returns an incremented number 1 higher then the id of the 
last request

`callback` will be called with an number one greater than the id of the last
request or 1 if no history exists.

##### Request History Within a Given Timeframe
Retrieve only entries in the history whose `end` falls within a certain range

`AL.trimHistoryByDate(callback, startDate, endDate)`

`callback` will be called with an array of objects representing all requests sent within the specified range.

`startDate` is a Javascript Date object representing the start of the range you are interested in. Any objects in the history with an `end` timestamp equal to the `startDate` object will NOT be included in the returned history.

`endDate` is a Javascript Date object representing the end of the range you are interested in. Any objects in the history with an `end` timestamp equal to the `endDate` object will NOT be included in the returned history.

Setting Up Environment For Battery Harness Testing
======================
1. Install VirtualBox and open it up from here: https://www.virtualbox.org/  
2. Click the "New" button to start the wizard to create a new virtual machine  
3. Enter a name like "FxPowertool" and choose "Linux", "Debian" for the OS  
4. Give it a reasonable amount of RAM for your box, like 1GB if you can  
5. For the start up disk, plug in the USB drive and select the HD.vdi file  
6. Click Create to create the VM for the first time. The VM is now saved.  
7. Click Settings next to the created VM and go to the Serial Ports tab.  
8. Click to "Enable Serial Port" for "Port 1", set "Port Mode" to "Host Device" and for the "Port/File Path" enter in /dev/ttyACM0 if you are on Linux.    

##### Making use of the VM from the USB stick  

1. If the phone seems to be unhappy, I have had to try disconnecting it all.  
2. Once you get it connected to the computer turn the ammeter and it on.  
3. Select the VM that you have created previously and choose the Start option.  
4. When prompted for a login, enter "capstone" with the password as "firefox".  
5. Use Leafpad to create some file like "tests.json" and add the following:  

```javascript
{
  "title": "My Test Cases",
  "tests": [
    "My first test" 
  ]
}
```

6. Open a LXTerminal and run the following to execute your series of test(s):  

```
sudo powertool -d mozilla -p /dev/ttyS0 -u tk -s current -f
Desktop/tests.json -o Desktop/tests.csv
```

7. Click Start to begin testing power. You can also switch to the next test.
Note that the powertool as it was ran above saves collected data to CSV.












capstone2014-firefoxOS
======================

[![Build Status](https://travis-ci.org/askore/capstone2014-firefoxOS.svg?branch=master)](https://travis-ci.org/askore/capstone2014-firefoxOS)

Javascript APIs for optimizing battery life through optimizing network communications. PSU CS Capstone 2014.
Licensed under the Mozilla Public License, version 2.0.

**Note to contributors: When making a pull request that includes code changes to the library, make sure to include the re-compiled library (all the files in /dist) reflecting the changes. Failure to do so will result in pull requests not being merged.

Table of Contents
======================
- [Overview](#overview)
- [Installing the Library](#installing-the-library)
  - [Downloading the Library](#downloading-the-library)
  - [Including the Library](#including-the-library)
    - [Firefox OS Application](#firefox-os-application)
    - [Other](#other)
- [General Usage](#general-usage)
  - [Concepts](#concepts)
  - [General Examples](#general-examples)
    - [Firefox OS](#firefox-os)
      - [Make a critical request](#make-a-critical-request)
      - [Make a non-critical request](#make-a-non-critical-request)
      - [Add a Timeout to the Non-Critical Request] (#add-a-timeout-to-the-non-critical-request)
      - [Grab the most recent requests and display the begin/end difference](#grab-the-most-recent-requests-and-display-the-beginend-difference)
    - [Other](#other-1)
  - [Tips to Consider for Further Minimizing Battery Drain](#tips-to-consider-for-further-minimizing-battery-drain)
- [API Usage](#api-usage)
  - [AJAX Requests](#ajax-requests)
  - [Non-critical AJAX Requests](#non-critical-ajax-requests)
  - [Latency Recording and Analysis](#latency-recording-and-analysis)
    - [Latest Access Timestamp](#latest-access-timestamp)
    - [Request History](#request-history)
    - [Request History Within a Given Timeframe](#request-history-within-a-given-timeframe)
- [Framework Setup / Development Practices](#framework-setup--development-practices)
  - [Git for Windows](#git-for-windows)
  - [Node.js](#nodejs)
  - [Nightwatch](#nightwatch)
  - [NetBeans](#netbeans)
    - [Downloading NetBeans and Loading Project](#downloading-netbeans-and-loading-project)
    - [Setting Up Tabbing Standards](#setting-up-tabbing-standards)
    - [Tabbing Standards](#tabbing-standards)
- [Deploying and Testing BatTest Demo App](#deploying-and-testing-battest-demo-app)
  - [Deployment](#deployment)
    - [Virtual Phone](#virtual-phone)
    - [Physical Phone](#physical-phone)
  - [Testing](#testing)
    - [Setting up Crapify](#setting-up-crapify)
      - [Using Crapify with a Phone](#using-crapify-with-a-phone)
    - [Setting Up Environment For Battery Harness Testing](#setting-up-environment-for-battery-harness-testing)
      - [If you are on a Linux Host](#if-you-are-on-a-linux-host)
      - [If you are on a Windows Host](#if-you-are-on-a-windows-host)
      - [Making use of the VM from the USB stick](#making-use-of-the-vm-from-the-usb-stick)

Overview
======================

This set of APIs is geared towards optimizing device battery life by optimizing when network requests are sent in order to reduce system resource usage (battery, network chipset) through a variety of API functionality. When making a XMLHttpRequest (XHR), you can flag it as either critical to have it fired off immediately, or as non-critical where the XHR is added to the queue that will be fired off at a determined ideal time. The ideal time is determined to be when the device has a battery level of at least 10%, and a critical XHR was just fired or the device is currently charging. The library also automatically saves up to 10,000 XHR's upon callback into a local database for developers to analyze and utilize. For example, a developer might use the database by writing a method that performs daily analysis to see when the user tends to be making successful XHRs (e.g. circa 8AM).

An example Firefox OS application [is included](#deploying-and-testing-battest-demo-app) to demonstrate a working example of all the API functionality.

Installing the Library
======================

#### Downloading the Library
The latest compiled library can be found in the root directory's "dist" folder as **firefoxos.js** or **firefoxos.nolocalforage.js**

#### Including the Library

##### Firefox OS Application
To include the library, put it in the same directory as your own Javascript file and HTML file(s) and reference the library in the `<HEAD>` the same way you would reference other Javascript files with `<script src="firefoxos.js" defer></script>`

For example, in our demo application [included in this repository](#deploying-and-testing-battest-demo-app), a full `<HEAD>` in the index.html file where "app.js" is the Javascript file used for the Javascript of the HTML page looks like:

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1">

  <title>Hello World</title>

  <style>
    body {
      border: 1px solid black;
    }
  </style>

  <!-- Inline scripts are forbidden in Firefox OS apps (CSP restrictions),
     so we use a script file. -->
  <script src="firefoxos.js" defer></script>
  <script src="app.js" defer></script>

</head>
```

##### Other
Certain functionality the API uses such as is the device charging and our "battest" demo app have been tested within PC OS browsers and confirmed to work, but the library as a whole has not been exhaustively tested on platforms outside of Firefox OS. As such while the library is planned to support all manner of platforms, installation documentation outside of Firefox OS can not be provided at this time.

General Usage
======================

#### Concepts
There are several key concepts within the library that are critical to know to effectively use the library:
* **Critical requests**
 * A critical request is a request for something that you need right now, regardless of whether it is a good time or not (e.g. shoddy Wi-Fi connection).
 * Since critical requests are fired without respect to good conditions, critical requests can not be guaranteed to be successful.
* **Non-critical requests**
 * A non-critical request is a request for something that you need, but you don't need it right now. It gets added to a queue for non-critical requests.
 * The queue gets fired when "now is good" to fire them.
 * Since "now is good" includes battery heuristics (i.e. device is charging), non-critical requests can not be guaranteed to be successful, only that they will optimally use the battery of the device.
* **"Now is good"**
 * "Now is good" is a background process wherein the non-critical request queue will be fired when the API believes it to be a good time.
 * A good time is considered to be `if ((isCharging || criticalRequestFired) && batteryLevel > .10)`
   * In other words, _the battery level of the device must be more than 10%_ and a critical request just fired or the device is charging.
* **Latency Recording**
 * Latency recording is the automatic background process the API does wherein critical and non-critical requests are recorded (when the request was made, when it finished, the request size, and a unique id for each request) for later use by the developer.

#### General Examples

##### Firefox OS
A basic Firefox OS application using our capstone library consists of a manifest, an HTML index, a Javascript file for the index, our capstone library, and an icons directory. However, for the sake of simplicity we will highlight some basic examples that can be found within our sample Firefox OS app [which can easily be installed and ran](#virtual-phone).

These examples contain snippets for the Index.html file and for the Javascript file for the Index to illustrate core concepts of the library and thus are not comprehensive as they don't cover all API functions. For all API function usage, [see the "API Usage" section below](#api-usage).

###### Make a critical request
You might have a case where you make a request that needs to be made immediately using a URL in a textbox element when a user presses a button.

Index.html code:
```html
<input type="text" id="requestURL" size=45 value="https://rocky-lake-3451.herokuapp.com?q=cats"><br /><br />

<button id="fireCriticalReq">Fire critical requests</button>
```
Javascript:
```javascript
window.addEventListener('load', function () {
  document.getElementById('fireCriticalReq').addEventListener('click', fireCriticalRequest);
});

function fireCriticalRequest() {
  var urlString = document.getElementById('requestURL');
  AL.ajax(urlString.value, null, function () {
  });
}
```

By using `AL.ajax(urlString.value, null, function () {});` we are passing in the desired URL as the first argument. Since we have no extra data we need to pass in, the second parameter is `null`. As a result, this request will be a GET. Were we need to put data in our request we would put it in this argument and instead of a GET request, a POST request would be made. For the third argument since we aren't interested in doing anything upon the request being completed we leave the callback blank.

###### Make a non-critical request
You might have a case where you make a request for something that the user wants and requests via a URL in a textbox element when a user presses a button, but doesn't need right now.

Index.html code:
```html
<input type="text" id="requestURL" size=45 value="https://rocky-lake-3451.herokuapp.com?q=cats"><br /><br />

<button id="addNonCriticalReq">Add non-critical request(s)</button>
```
Javascript:
```javascript
window.addEventListener('load', function () {
  document.getElementById('addNonCriticalReq').addEventListener('click', addNonCriticalRequest);
});

function addNonCriticalRequest() {
  var urlString = document.getElementById('requestURL');
  AL.addNonCriticalRequest(urlString.value, null, function () {
  });
}
```

By using `AL.addNonCriticalRequest(urlString.value, null, function () {});` we are passing in the desired URL as the first argument. Since we have no extra data we need to pass in, the second parameter is `null`. As a result, and because we did not specify a fourth (`method`) argument, this request will be a GET. Were we need to put data in our request we would put it in this argument and instead of a GET request, a POST request would be made. For the third argument since we aren't interested in doing anything upon the request being completed we leave the callback blank.

###### Add a Timeout to the Non-Critical Request
You might have a case where you make a request for something that the user wants and requests via a URL in a textbox element when a user presses a button, but doesn't need right now. However, the user will need it by a certain time. In this case, we can provide a `timeout` (in milliseconds) to the `addNonCriticalRequest` method.

Index.html code:
```html
<input type="text" id="requestURL" size=45 value="https://rocky-lake-3451.herokuapp.com?q=cats"><br /><br />

<button id="addNonCriticalReq">Add non-critical request(s)</button>
```
Javascript:
```javascript
window.addEventListener('load', function () {
  document.getElementById('addNonCriticalReq').addEventListener('click', addNonCriticalRequest);
});

function addNonCriticalRequest() {
  var urlString = document.getElementById('requestURL');
  AL.addNonCriticalRequest(urlString.value, null, function () {
  }, null, 5000);
}
```

By using `AL.addNonCriticalRequest(urlString.value, null, function () {}, null, 5000);` we are adding an optional timeout to the request. If 5 seconds (5000 milliseconds) pass and the request has yet to fire, it will force itself to fire. 

###### Grab the most recent requests and display the begin/end difference
As a developer you might want to check to see if the most recent requests have a long time between when they start and when they end and visually display it. The following code grabs the most recent 5 records, calculates the difference between each request's begin and end, and then displays it as text.

Index.html code:
```html
<div>
  Last 5 records: <span id="recordsList"></span><br />
  <button id="displayRecords">Display</button>
</div>
```
Javascript:
```javascript
window.addEventListener('load', function () {
  document.getElementById('displayRecords').addEventListener('click', getRecords);
});

function getRecords() {
  var elem = document.getElementById('recordsList');
  AL.getHistory(function (records) {
    if (records) {
      var counter = 0;
      var string = [];
      for (var i = Math.max(records.length - 5, 0); i < Math.max(records.length, 0); ++i) {
        string[counter] = records[i].end - records[i].begin;
        ++counter;
      }
      elem.innerHTML = string.toString();
    }
    else {
      console.log("Records is null");
    }
  });
}
```

##### Other
Certain functionality the API uses such as is the device charging and our "battest" demo app have been tested within PC OS browsers and confirmed to work, but the library as a whole has not been exhaustively tested on platforms outside of Firefox OS. As such while the library is planned to support all manner of platforms, example documentation outside of Firefox OS can not be provided at this time. However, usage for platforms outside of Firefox OS will be the same.

#### Tips to Consider for Further Minimizing Battery Drain

* Use GET requests for AJAX, when possible
 * GET can be cached whereas POST can not
* Minimize the resources needed to load pages
 * Utilize caching and compressing where possible, especially when dealing with large resources like pictures and video
* Avoid unnecessary data processing on the client
 * If data processing can happen on the server side, process it there to minimize CPU (and consequently battery) usage
* Avoid excessive polling of the server
 * The API works best in when requests are concentrated at certain time points and the time points are spread out; excessive polling reduces the spread between time points and increases the number of points, consequently using up more battery

API Usage
======================

All functionality is exposed through a global object called "AL" (for AJAX Library).

#### AJAX Requests
To make an AJAX request use the AL.ajax() method.

`AL.ajax(url [, data] [, success] [, method])`

An XMLHttpRequest object will be created using `url` as the endpoint. <br>
`data`, if provided, will be JSON-encoded and passed to the endpoint.<br>
`success` will be called when the request has completed successfully<br>
`method` will set the HTTP method to use (ie, 'Patch', 'Put', etc). If not set, 'Get' will be used if the data argument is null, otherwise defaults to 'Post'

The API will use a GET request if there is no data, otherwise it will be a POST.

If the data argument is a function, it will be used as the success function.

The success function is passed 3 arguments:<br>
`success(Object responseBody, String status, XMLHttpRequest xhr)`

`responseBody` will be the data that is received back from the endpoint.<br>
`status` is the status code of the request (200, 404, etc)<br>
`xhr` is the actual XMLHttpRequest object that was used to make the request<br>

Example
```javascript
AL.ajax('http://rocky-lake-3451.herokuapp.com/', {cats: 20}, function(response, status, xhr) {
  console.log('Response: ', response);
  console.log('Status: ', status);
  console.log('Xhr: ', xhr);
});
```
Gives a result like
```javascript
Response: {"request_method":"POST","request_parameters":[]}
Status: 200
Xhr: XMLHttpRequest { readyState=4, timeout=0, withCredentials=false, ...}
```

Example
```javascript
AL.ajax('http://rocky-lake-3451.herokuapp.com/', {cats: 20}, function(response, status, xhr) {
  console.log('Response: ', response);
  console.log('Status: ', status);
  console.log('Xhr: ', xhr);
}, 'put');
```
Gives a result like
```javascript
Response: {"request_method":"PUT","request_parameters":[]}
Status: 200
Xhr: XMLHttpRequest { readyState=4, timeout=0, withCredentials=false, ...}
```

#### Non-critical AJAX Requests
A non-critical request is added to a queue and waits until conditions are good enough to be fired.

`AL.addNonCriticalRequest(url [, data] [, success] [, method] [, timeout])`

The parameters are the same as the AL.ajax method, with the exception of the optional `timeout` parameter. If given, the non-critical request will wait `timeout` milliseconds to fire. If `timeout` milliseconds has passed and the event has not yet fired, it will fire off automatically.<br>
Note that the way the request is fired is by firing off the entire non-critical request queue. Therefore care should taken in ensuring that only events that <i>must</i> fire within a certain time frame be given this parameter.

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

Framework Setup / Development Practices
======================

Currently, we are using nodeJs (JavaScript on the command line) along  
with grunt (a node task runner). These combined with bower (a  
dependency manager) and Karma (unit testing) allow for a pretty good  
combination for testing and developing code.  

#### Git for Windows
It is necessary to have git in Windows' PATH else you won't be able to install bower later. If you already have git in Windows' PATH or else aren't using Windows, you may skip until the Node.js section.

1. Download Git (http://git-scm.com/download/win)
2. Begin installing Git and during the install process select "Use Git from the Windows Command Prompts" which will put git in Windows' PATH

#### Node.js
1. Download nodeJS (http://nodejs.org/)  
2. Open up the Node.js Command Prompt  
3. Navigate to your local firefox-OS repo  
4. Run the following commands:  
  1. `npm install`
  2. `npm install -g grunt-cli`  
  3. `npm install -g bower`  
  4. `bower install`
  5. `grunt build`

The build task will recompile the library and run the tests. If you've updated the test and only need to rerun them:
`grunt test`  

You'll see a bunch of tests get run and pass.  

#### Nightwatch
Nightwatch (http://nightwatchjs.org/) is used as the E2E testing solution for the example application provided with the library. To install Nightwatch:

`npm install -g nightwatch`

Selenium is also needed to run the Nightwatch tests. Grunt will automatically download Selenium (if it does not already exist in the directory) whenever `grunt-build` is executed. Should you want to download Selenium manually, you may do so from: https://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar

The included configuration file will automatically start Selenium when the tests are run.

On `grunt build` the `examples/tests/test.js` folder is edited to the change the path to the battest app's `index.html` file to be the absolute path to the copy on your local machine. Therefore it is required to run `grunt-build` at least once prior to trying to executing the Nightwatch tests (or else manually edit the file yourself).

You can use `nightwatch -t examples/tests/test.js` to run the tests.

#### NetBeans
##### Downloading NetBeans and Loading Project  
Download NetBeans from https://netbeans.org/downloads/  
Open NetBeans, create a "New Project", then select "HTML5 Application with Existing Sources"  
The "lib" folder will hold our API prototypes  
The "test/spec" folder will hold our tests files

##### Setting Up Tabbing Standards
1. Within NetBeans, select 'Tools' and then 'Options'
2. Select the 'Editor' icon at the top followed by the 'Formatting' tab
3. Set the 'Language:' tab to 'All Languages'
4. Make sure 'Expand Tabs to Spaces' is unchecked
5. Set 'Tab Size:' to 4
6. Save settings by clicking 'OK'

![Tabbing Standard](https://cloud.githubusercontent.com/assets/3056597/5869687/cb0882dc-a271-11e4-8464-d817ad645efa.png)

##### Tabbing Standards
Use single tabbing for indentation of code (e.g. body of a loop or function) inside files contained both in the "lib" and "test/spec" directories.

Deploying and Testing BatTest Demo App
======================

#### Deployment
##### Virtual Phone
1. If you haven't already, due to reliance on dist/firefoxos.js, run `grunt build` following the [Node.js instructions above](#nodejs)
2. Open up the Firefox browser
3. Open up WebIDE by pressing Shift + F8 (or the WebIDE button in the toolbar if you've used webIDE before)
4. Go to "Project" -> "Open Packaged App", navigate to and select the "battest" folder located in the "examples" folder, and click "Select Folder"
5. Click on "Select Runtime" then "Install Simulator"
6. Install the most recent stable version of the Firefox OS Simulator (at time of writing, 2.0)
7. Click on "Select Runtime", then click the most recent stable version of the Firefox OS Simulator under "SIMULATORS"
8. Click the "Install and Run" button or CRTL+R to push the app to the phone

##### Physical Phone
1. Make sure the battery harness is not connected. Connect the phone to your computer via USB.
2. Power the phone on. It should ask "An incoming request to permit remote debugging connection was detected. Allow connection?". Select "OK".
3. Go to "Project" -> "Open Packaged App" and select the folder of the BatTest App.
4. Click on "Select Runtime" then "Firefox OS" under "USB Devices"
5. Go to "Project" -> "Install and Run" or CRTL+R to push the app to the phone.

#### Testing
##### Setting up Crapify
1. Set up and build the library using the [Node.js instructions above](#nodejs)
2. Open up the Node.js Command Prompt  
3. Navigate to your local firefox-OS repo  
4. Run the following commands:  
  1. `npm install crapify -g`
  2. `npm config set proxy http://127.0.0.1:5000`  
  3. Run crapify with desired configurations such as `crapify start --port=5000 --speed=3000 --concurrency=2` where
    * `port` is the port crapify should start on
	* `speed` is the connection speed in bytes/second
	* `concurrency` is the number of concurrent outbound connections allowed
	* `drop-frequency` is how often should bytes be dropped (`byte count` % `drop frequency`)
	  * Due to the definition of `drop-frequency` not being clear, an issue has been created on [crapify's GitHub repo](https://github.com/bcoe/crapify/issues/7)

###### Using Crapify with a Phone
If you wish to use Crapify to degrade a phone's network connection, you need to install and run crapify on a server and then redirect all the phone's traffic through that server. This requires both having adb (android debugger) installed as well as a phone that is adb compatible (ie Android or Firefox OS):

1. Install and run crapify on the server as described above.
2. Connect the phone via microUSB to the computer with adb installed.
3. Run the following command:
  * `adb shell iptables -t nat -A OUTPUT -p tcp --dport 80 -j DNAT --to-destination x.x.x.x:5000`
  * Where `x.x.x.x` is your server's IP address
4. As long as the phone remains connected, all traffic on the phone should be degraded in accordance with the Crapify settings on the server.

##### Setting Up Environment For Battery Harness Testing
1. Install VirtualBox and open it up from here: https://www.virtualbox.org/  
2. Click the "New" button to start the wizard to create a new virtual machine  
3. Enter a name like "FxPowertool" and choose "Linux", "Debian" for the OS  
4. Give it a reasonable amount of RAM for your box, like 1GB if you can  
5. For the start up disk, plug in the USB drive and select the HD.vdi file  
6. Click Create to create the VM for the first time. The VM is now saved.  
7. Click Settings next to the created VM and go to the Serial Ports tab.  

###### If you are on a Linux Host
Click to "Enable Serial Port" for "Port 1", set "Port Mode" to "Host Device" and for the "Port/File Path" enter in /dev/ttyACM0.

###### If you are on a Windows Host
1. Uncheck the "Enable Serial Port" option.
2. Select the USB tab check both "Enable USB Controller" and "Enable USB 2.0 (EHCI) Controller". It may prompt you to install the VirtualBox Extension Pack. If so download it here: https://www.virtualbox.org/wiki/Downloads

###### Making use of the VM from the USB stick  

1. If VirtualBox cannot detect the battery harness, unplug the USB and plug it back in.
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

*If you want to run multiple tests and save them to one CSV file, the JSON will look like this*

```javascript
{
  "title": "My Test Cases",
  "tests": [
    "My first test",
	"My second test",
	"My third test"
  ]
}
```

*If you are on windows, you will need to do a USB pass-through, otherwise skip these steps*  
+ In VirtualBox, select "Devices" then "USB Devices"
+ Select "Dean Camera LUFA USB-RS232 Adapter[0001]". If you do not see this option, unplug the USB and plug it back in.  

Open a LXTerminal and run the following to execute your series of test(s):  

```
sudo powertool -d mozilla -p /dev/ttyS0 -u tk -s current -f
Desktop/tests.json -o Desktop/tests.csv
```

*If you are on windows, replace ttyS0 with ttyACM0 in the command above*

**Make sure the screen is off before testing! Having the screen on will cause the battery usage to increase, throwing off the data.**

1. Click Start to begin testing power. You can also switch to the next test.
2. Click Stop to finish collecting the data.
3. Exit out of the fxPowertool program.
4. Open up "LibreOffice" from the desktop and navigate to the folder where your CSV files were saved.

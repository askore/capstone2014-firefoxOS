capstone2014-firefoxOS
======================

Javascript APIs for offline communications in Firefox OS. PSU CS Capstone 2014

Development Practices
=====================

Currently, we are using nodeJs (JavaScript on the command line) along
with grunt (a node task runner). These combined with bower (a
dependency manager) and Karma (unit testing) allow for a pretty good
combination for testing and developing code.

Clone the repo and cd to it, then run (preface any install commands with sudo if running on linux):

````npm install````

````npm install -g grunt-cli````

````grunt build````

The build task will recompile the library and run the tests. If you've updated the test and only need to rerun them:
````grunt test````

You'll see a bunch of tests get run and pass.

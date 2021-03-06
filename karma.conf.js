// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: '',

		reporters: [
			'progress'
//			'coverage'
		],

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine'],

		// list of files / patterns to load in the browser
		files: [
			'dist/firefoxos.js',
			'test/spec/*.js'
		],

//		preprocessors: {
//			'src/*.js': ['coverage']
//		},
//
//		coverageReporter: {
//			type: 'html',
//			dir: 'coverage/'
//		},

		// list of files / patterns to exclude
		exclude: [],

		// web server port
		port: 9898,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_ERROR,

		// enable / disable watching file and executing tests whenever any file changes
//		autoWatch: false,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['Firefox'],
		
		browserNoActivityTimeout: 100000

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
//		singleRun: true
	});
};

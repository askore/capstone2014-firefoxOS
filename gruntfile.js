/**
 * @file
 *
 * ### Responsibilities
 * - automate common tasks using grunt
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author Nathan Kerr <>
 */
'use strict';

module.exports = function (grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-downloadfile');
	var config = {
		app: 'lib',
		dist: 'dist'
	};
	
	grunt.initConfig({
		config: config,
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'gruntfile.js',
				'lib/**/*.js',
				'test/spec/{,*/}*.js'
			]
		},
		clean: {
			all: ['dist/*', 'dist/**/*']
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			},
			nolocalforage: {
				configFile: 'karma.nolocalforage.conf.js',
				singleRun: true
			}
		},
		uglify: {
			app: {
				options: {
					mangle: {
					}
				},
				files: {
					'dist/firefoxos.min.js': 'dist/firefoxos.js',
					'dist/firefoxos.nolocalforage.min.js': 'dist/firefoxos.nolocalforage.js'
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			app: {
				files: {
					'dist/firefoxos.js': [
						'bower_components/localforage/dist/localforage.js',
						'lib/**/*.js'
					],
					'dist/firefoxos.nolocalforage.js':[
						'lib/**/*.js'
					]
				}
			}
		},
		copy: {
			main: {
				src: 'dist/firefoxos.js',
				dest: 'examples/battest/firefoxos.js'
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [{
						match: /url.*/,
						replacement: 'url\(\'file://' + process.cwd() + '/examples/battest/index.html\'\)'
					}]
				},
				files: [{
					expand:true, flatten:true, src: ['examples/tests/test.js'], dest: 'examples/tests/'
				}]
			}
		},
		downloadfile: {
			files: [
				'https://selenium-release.storage.googleapis.com/2.44/selenium-server-standalone-2.44.0.jar'
			]
		}
	});
	
	grunt.registerTask('test', [
		'karma:unit',
		'karma:nolocalforage',
	]);
	
	grunt.registerTask('build', [
		'clean',
		'concat',
		'uglify',
		'karma:unit',
		'karma:nolocalforage',
		'copy:main',
		'replace',
		'downloadfile'
	]);

	grunt.registerTask('default', [
		'jshint',
		'build'
	]);
};

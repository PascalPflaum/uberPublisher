module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks("grunt-jscoverage");
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.initConfig({
		mochaTest : {
			build : {
				src : ['test/unit/**/*.js'],
				options : {
					reporter : 'spec',
					checkLeaks : true,
					ignoreLeaks : false,
					require : 'test/unitSetup.js'
				}
			},
			coverage : {
				src : ['test/unit/**/*.js'],
				options : {
					reporter : 'html-cov',
					captureFile : 'coverage.html',
					quiet : true,
					require : 'test/coverageSetup.js'
				}
			}
		},
		jscoverage : {
			build : {
				expand : true,
				cwd : 'lib/',
				src : ['**/*.js'],
				dest : 'js-cov/',
				ext : '.js'
			}
		},
		clean : ['js-cov'],
		jshint : {
			build : ['Gruntfile.js', 'lib/**/*.js'],
			options : {
				funcscope : true
			}
		}
	});


	grunt.registerTask('unit', ['mochaTest:build']);
	grunt.registerTask('hint', ['jshint']);
	grunt.registerTask('coverage', ['jscoverage', 'mochaTest:coverage', 'clean']);
	grunt.registerTask('alltests', ['hint', 'unit']);
	grunt.registerTask('release', ['alltests', 'coverage']);
	grunt.registerTask('default', ['alltests']);
};
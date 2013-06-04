module.exports = function(grunt) {
  // Load grunt-microlib config & tasks
  var emberConfig = require('grunt-microlib').init.bind(this)(grunt);
  grunt.loadNpmTasks('grunt-microlib');

  // Add concat:tests to existing tests task
  grunt.renameTask('tests', 'microlib-tests');
  this.registerTask('tests', "Builds the test package", ['microlib-tests', 'concat:tests']);

  // Custom phantomjs test task
  this.registerTask('test', "Runs tests through the command line using PhantomJS", ['build', 'tests', 'mocha_phantomjs']);
  // Custom Node test task
  this.registerTask('node-test', ['build', 'tests', 'mochaTest']);

  this.registerTask('all-test', ['build', 'tests', 'mocha_phantomjs', 'mochaTest']);

  var config = {
    cfg: {
      // Name of the project
      name: 'rsvp.js',

      // Name of the root module (i.e. 'rsvp' -> 'lib/rsvp.js')
      barename: 'rsvp',

      // Name of the global namespace to export to
      namespace: 'RSVP'
    },

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      tests: {
        src: ['tmp/promises-tests.js', 'tmp/tests.js'],
        dest: 'tmp/all-tests.js'
      },
    },

    browserify: {
      tests: {
        src: ['node_modules/promises-aplus-tests/lib/tests/**/*.js'],
        dest: 'tmp/promises-tests.js'
      }
    },

    mocha_phantomjs: {
      phantom: {
        options: {
          urls: ["test/index.html"],
        }
      }
    },

    mochaTest: {
      test: {
        src: ['test/vendor/assert.js', 'test/test-adapter.js', 'tmp/promises-tests.js', 'tmp/tests.cjs.js'],
        options: {
          reporter: 'spec'
        },
      }
    }
  };

  // Merge config into emberConfig, overwriting existing settings
  grunt.initConfig(grunt.util._.merge(emberConfig, config));

  // Load custom tasks from NPM
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-mocha-test');
};

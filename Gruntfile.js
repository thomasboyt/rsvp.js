module.exports = function(grunt) {
  // Load Ember-Dev config & tasks
  var emberConfig = require('grunt-ember-dev').init.bind(this)(grunt);
  grunt.loadNpmTasks('grunt-ember-dev');

  // Custom tasks
  this.registerTask('test', "Runs tests through the command line using PhantomJS", ['build', 'tests',  'mocha_phantomjs']);

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
      }
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
  };

  // Merge config into emberConfig, overwriting existing settings
  grunt.initConfig(grunt.util._.merge(emberConfig, config));

  // Load custom tasks from NPM
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
};

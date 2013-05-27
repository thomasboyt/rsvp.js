module.exports = function(grunt) {
  // Name of the project
  var name = 'rsvp.js';
  // Name of the root module (i.e. 'rsvp' -> 'lib/rsvp.js')
  var barename = 'rsvp';
  // Name of the global namespace to export to
  var namespace = 'RSVP';

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of " + name, ['clean', 'transpile:amd', 'transpile:commonjs', 'concat:amd', 'concat:browser', 'browser:dist', 'jshint', 'uglify']);

  this.registerTask('tests', "Builds the test package", ['concat:deps', 'browserify:tests', 'transpile:testsAmd', 'transpile:testsCommonjs', 'buildTests:dist', 'concat:tests']);

  this.registerTask('test', "Runs tests through the command line using PhantomJS", ['build', 'tests', 'connect', 'mocha_phantomjs']);

  // Run a server. This is ideal for running the QUnit tests in the browser.
  this.registerTask('server', ['build', 'tests', 'connect', 'watch:server']);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {},

      options: {
        hostname: '0.0.0.0',
        port: 8000,
        base: '.'
      }
    },

    watch: {
      server: {
        files: ['lib/**', 'vendor/*', 'test/**/*'],
        tasks: ['build', 'tests']
      },
    },

    transpile: {
      amd: {
        moduleName: nameFor,
        type: 'amd',
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['**/*.js'],
          dest: 'tmp/',
          ext: '.amd.js'
        }]
      },

      commonjs: {
        moduleName: nameFor,
        type: 'cjs',
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['rsvp/*.js'],
          dest: 'node_modules/',
          ext: '.js'
        },
        {
          src: ['lib/' + barename + '.js'],
          dest: 'main.js'
        }]
      },

      testsAmd: {
        moduleName: nameFor,
        type: 'amd',
        src: ['test/test_helpers.js', 'test/tests.js', 'test/tests/**/*_test.js'],
        dest: 'tmp/tests.amd.js'
      },

      testsCommonjs: {
        moduleName: nameFor,
        type: 'cjs',
        src: ['test/test_helpers.js', 'test/tests.js', 'test/tests/**/*_test.js'],
        dest: 'tmp/tests.cjs.js'
      }
    },

    uglify: {
      browser: {
        options: {
          mangle: true
        },
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js'],
        }
      }
    },
    
    jshint: {
      options: {
        'jshintrc': '.jshintrc'
      },
      output: {
        src: ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
      }
    },

    clean: ["tmp", "dist"],

    concat: {
      amd: {
        src: ['tmp/' + barename + '/**/*.amd.js', 'tmp/' + barename + '.amd.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js'
      },

      deps: {
        src: ['vendor/deps/*.js'],
        dest: 'tmp/deps.amd.js'
      },

      browser: {
        src: ['vendor/loader.js', 'tmp/' + barename + '/**/*.amd.js', 'tmp/' + barename + '.amd.js'],
        dest: 'tmp/' + barename + '.browser1.js'
      },

      tests: {
        src: ['tmp/promises-tests.js', 'tmp/tests.js'],
        dest: 'tmp/all-tests.js'
      }
    },

    browser: {
      dist: {
        src: 'tmp/' + barename + '.browser1.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    buildTests: {
      dist: {
        src: ['vendor/loader.js', 'tmp/tests.amd.js', 'tmp/rsvp/**/*.amd.js', 'tmp/' + barename + '.amd.js'],
        dest: 'tmp/tests.js'
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
          urls: ["http://localhost:8000/test/index.html"],
        }
      }
    },

    mochaTest: {
      node: {
        src: ["tmp/tests.cjs.js", "node_modules/promises-aplus-tests/lib/tests/**/*.js", ]
      }
    }
  });

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-mocha-test');

  this.registerTask('bytes', function() {
    console.log("TODO: Add a bytes-tracking task");
  });

  this.registerMultiTask('browser', "Export the object in " + name + " to the window", function() {
    this.files.forEach(function(f) {
      var output = ["(function(globals) {"];

      output.push.apply(output, f.src.map(grunt.file.read));

      output.push('window.' + namespace + ' = requireModule("' + barename + '");');
      output.push('})(window);');

      grunt.file.write(f.dest, output.join("\n"));
    });
  });

  this.registerMultiTask('buildTests', "Execute the tests", function() {
    var testFiles = grunt.file.expand('test/tests/**/*_test.js');

    this.files.forEach(function(f) {
      var output = ["(function(globals) {"];

      output.push.apply(output, f.src.map(grunt.file.read));

      testFiles.forEach(function(file) {
        var moduleName = nameFor(file);
        output.push('requireModule("' + nameFor(file) + '");');
      });

      output.push('})(window);');

      grunt.file.write(f.dest, output.join("\n"));
    });
  });

  function nameFor(path) {
    var match;
    if (match = path.match(/^(?:lib|test|test\/tests)\/(.*?)(?:\.js)?$/)) {
      return match[1];
    }
    else {
      return path;
    }
  }
};

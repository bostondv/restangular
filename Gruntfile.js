module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: [
                '/**',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>' +
                ' * @link <%= pkg.homepage %>',
                ' * @author <%= pkg.author %>',
                ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                ' */'
              ].join('\n')
    },
    dirs: {
      dest: 'dist'
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['src/*.js'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
      }
    },
    zip: {
      '<%= dirs.dest %>/restangular.zip': [
        '<%= dirs.dest %>/<%= pkg.name %>.js',
        '<%= dirs.dest %>/<%= pkg.name %>.min.js'
      ]
    },
    bowerInstall: {
        install: {
        }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/*.js'],
      options: {
        jshintrc: true
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      build: {
        singleRun: true,
        autoWatch: false
      },
      debug: {
        singleRun: false,
        autoWatch: true,
        browsers: ['Chrome']
      },
      travis: {
        singleRun: true,
        autoWatch: false,
        browsers: ['Firefox']
      },
      dev: {
        autoWatch: true
      }
    },
    coveralls: {
      // Options relevant to all targets
      options: {
        // When true, grunt-coveralls will only print a warning rather than
        // an error, to prevent CI builds from failing unnecessarily (e.g. if
        // coveralls.io is down). Optional, defaults to false.
        force: false
      },

      restangular: {
        // LCOV coverage file (can be string, glob or array)
        src: 'coverage/**/lcov.info',
        options: {
          // Any options for just this target
        }
      },
    },
    conventionalChangelog: {
      options: {
        changelogOpts: {
          // conventional-changelog options go here
          outputUnreleased: true,
          // preset: 'angular'
        },
        context: {
          // context goes here
        },
        gitRawCommitsOpts: {
          // git-raw-commits options go here
        },
        parserOpts: {
          // conventional-commits-parser options go here
        },
        writerOpts: {
          // conventional-changelog-writer options go here
        }
      },
      release: {
        src: 'CHANGELOG.md'
      }
    }
  });

  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-bower-task');

  grunt.renameTask('bower', 'bowerInstall');

  grunt.loadNpmTasks('grunt-karma');

  grunt.loadNpmTasks('grunt-conventional-changelog');

  grunt.loadNpmTasks('grunt-zip');

  grunt.loadNpmTasks('grunt-coveralls');


  // Default task.
  grunt.registerTask('default', ['build']);

  // Build task.
  grunt.registerTask('build', ['bowerInstall', 'karma:build', 'concat', 'uglify', 'zip']);

  grunt.registerTask('test', ['karma:build']);

  grunt.registerTask('test-debug', ['karma:debug']);

  grunt.registerTask('travis', ['karma:travis', 'coveralls']);

  grunt.registerTask('changelog', ['conventionalChangelog']);

  // Provides the "bump" task.
  grunt.registerTask('bump', 'Increment version number', function() {
    var versionType = grunt.option('type');
    function bumpVersion(version, versionType) {
      var type = {patch: 2, minor: 1, major: 0},
          parts = version.split('.'),
          idx = type[versionType || 'patch'];
      parts[idx] = parseInt(parts[idx], 10) + 1;
      while(++idx < parts.length) { parts[idx] = 0; }
      return parts.join('.');
    }
    var version;
    function updateFile(file) {
      var json = grunt.file.readJSON(file);
      version = json.version = bumpVersion(json.version, versionType || 'patch');
      grunt.file.write(file, JSON.stringify(json, null, '  '));
    }
    updateFile('package.json');
    grunt.log.ok('Version bumped to ' + version);
  });

};

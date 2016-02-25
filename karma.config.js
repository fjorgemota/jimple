// Karma configuration
// Generated on Thu Feb 25 2016 16:35:31 GMT-0300 (BRT)
var fs = require("fs");
module.exports = function(config) {
  var babelrc = JSON.parse(fs.readFileSync("./.babelrc").toString());
  var plugins = babelrc['plugins']||[];
  var index;
  if ((index = plugins.indexOf("transform-es2015-modules-umd")) !== -1) {
    plugins.splice(index, 1); // Will remove umd in babel because we're running on Browserify
  }
  babelrc['plugins'] = plugins;
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/*.js' // Will include Jimple automatically
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.js': ['browserify']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    browserify: {
        transform: [['babelify', babelrc]],
        debug: true,
        require: "babel-polyfill"
    },

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}

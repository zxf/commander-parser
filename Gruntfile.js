/**
 * Gruntfile
 */

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            src: 'index.js'
        },
        mochaTest: {
            src: ['test/*.js']
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', 'mochaTest');

    grunt.registerTask('default', ['jshint', 'test']);

};
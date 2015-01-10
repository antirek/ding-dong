module.exports = function(grunt){
    grunt.initConfig({
        mocha_istanbul: {
            coverage: {
                src: 'test',
                options: {
                    'ui': 'tdd',
                    'recursive': true,
                    'reporter': 'mocha-istanbul'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};
// Configuration for dependencies of the various javascript libraries we use
requirejs.config({

    paths : {
        'hammer' : [
            'bower_components/hammerjs/dist/hammer.min',
            'bower_components/hammerjs/dist/hammer',
        ],
        'hammer-jquery' : [
            'bower_components/jquery-hammerjs/jquery.hammer.min',
            'bower_components/jquery-hammerjs/jquery.hammer',
        ],
        'jquery' : '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
        'lodash' : [
            'bower_components/lodash/dist/lodash.min',
            'bower_components/lodash/dist/lodash',
        ],
    },

    shim : {
        'hammer-jquery' : {
            deps : ['hammer', 'jquery'],
        },
    },
});
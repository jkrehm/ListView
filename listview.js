define(['jquery', 'hammer', 'hammer-jquery'], function($, Hammer) {

    'use strict';

    // Array forEach polyfill
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            var i, len;
            for (i = 0, len = this.length; i < len; ++i) {
                if (i in this) {
                    fn.call(scope, this[i], i, this);
                }
            }
        };
    }

    function BuildActions(breaks, e) {

        breaks.forEach(function(el, index) {
    
            if (!$.isArray(el.distance)) {
                el.distance = [el.distance];
            }

            // Convert any percentages to pixels
            el.distance.forEach(function(startEnd, idx) {

                if (typeof startEnd === 'string' && 
                    startEnd.indexOf('%')
                ) {
                    breaks[index].distance[idx] = e.target.offsetWidth * startEnd.replace('%', '') / 100;
                }
            });

            // Render subitem
            breaks[index].subitem = $('<div/>', {
                'data-role' : 'subitem',
            })
            .css({
                height     : e.target.offsetHeight,
                left       : e.target.offsetLeft,
                position   : 'absolute',
                top        : e.target.offsetTop,
                width      : e.target.offsetWidth,
                'z-index'  : e.target.style.zIndex - 1,
            })
            .appendTo( $(e.target).parent() )
            .html(el.html)
            .addClass(el.class)
            .hide();
        });

        return breaks;
    }

    function ListView(options) {

        var defaults = {
            selector : '',
            left     : [{
                action   : function() {},
                class    : '',
                distance : [10],
                html     : '',
            }],
            right    : [{
                action   : function() {},
                class    : '',
                distance : [10],
                html     : '',
            }],
            current  : {
                action   : function() {},
                class    : '',
            },
        };

        options = $.extend({}, defaults, options);

        this.selector  = options.selector;
        this.left      = options.left;
        this.right     = options.right;

        var breaks, subitem, direction;

        // Instantiate Hammer on the specified selector
        $(this.selector).hammer({
            drag_min_distance     : 2,
            drag_block_horizontal : true,
            drag_lock_to_axis     : true,
        })

        .on('dragstart', $.proxy(function(e) {

            this.left  = BuildActions(this.left, e);
            this.right = BuildActions(this.right, e);

        }, this))

        .on('drag', $.proxy(function(e) {

            // Move the target
            $(e.target).css({
                transform : 'translate3d(' + e.gesture.deltaX + 'px, 0, 0)'
            });

            var distance = Math.abs(e.gesture.distance);

            // Determine which actions should be performed
            this[e.gesture.direction].forEach(function(el, index) {

                if (distance >= el.distance[0] && (typeof el.distance[1] == 'undefined' || distance < el.distance[1])) {

                    $('[data-role="subitem"]:visible').hide();
                    el.subitem.show();
                }

            }, this);

        }, this))

        // Reset elements on release
        .on('dragend', $.proxy(function(e) {

            var currentIndex;

            $(e.target).css({
                transform : 'translate3d(0, 0, 0)'
            });
            $('[data-role="subitem"]').remove();

            var distance = Math.abs(e.gesture.distance);

            // Determine which actions should be performed
            this[e.gesture.direction].forEach(function(el, index) {

                if (distance >= el.distance[0] + 20 && (typeof el.distance[1] == 'undefined' || distance < el.distance[1])) {
                    currentIndex = index;
                }

            }, this);

            if (typeof currentIndex != 'undefined') {
                this[e.gesture.direction][currentIndex].action(e);
            }

        }, this));
    }

    return ListView;
});
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
            drag_min_distance : 2,
        })

        .on('dragstart', $.proxy(function(e) {

            this.left  = BuildActions(this.left, e);
            this.right = BuildActions(this.right, e);

            direction = e.gesture.direction;

        }, this))

        .on('drag', $.proxy(function(e) {

            e.gesture.preventDefault();

            // Move the target
            $(e.target).css({
                transform : 'translate3d(' + e.gesture.deltaX + 'px, 0, 0)'
            });

            // Ignore drags that are not to the left or right
            if ([Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT].indexOf(e.gesture.direction) === -1) {
                return false;
            }

            // User changed direction, so recalculate the breaks
            if (direction !== e.gesture.direction) {
                direction = e.gesture.direction;
            }

            var distance = Math.abs(e.gesture.distance);

            // Determine which actions should be performed
            this[direction].forEach(function(el, index) {

                if (distance >= el.distance[0] && (typeof el.distance[1] == 'undefined' || distance < el.distance[1])) {

                    $('[data-role="subitem"]:visible').hide();
                    el.subitem.show();
                }

            }, this);

        }, this))

        // Reset elements on release
        .on('release', $.proxy(function(e) {

            var current;

            $(e.target).css({
                transform : 'translate3d(0, 0, 0)'
            });
            $('[data-role="subitem"]').remove();

            var distance = Math.abs(e.gesture.distance);

            // Determine which actions should be performed
            this[direction].forEach(function(el, index) {

                if (distance >= el.distance[0] + 20 && (typeof el.distance[1] == 'undefined' || distance < el.distance[1])) {
                    current = index;
                }

            }, this);

            if (typeof current != 'undefined') {
                this[direction][current].action(e);
            }

        }, this));
    }

    return ListView;
});
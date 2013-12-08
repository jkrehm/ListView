define(['jquery', 'lodash', 'hammer', 'hammer-jquery'], function($, _, Hammer) {

    function ListView(options) {

        var listItem = this;

        options = _.assign({
            selector : '',
            left     : [{
                action   : function() {},
                class    : '',
                distance : [10],
            }],
            right    : [{
                action   : function() {},
                class    : '',
                distance : [10],
            }],
            current  : {
                action   : function() {},
                class    : '',
            },
        }, options);

        this.selector  = options.selector;
        this.left      = options.left;
        this.right     = options.right;
        this.current   = options.current;

        this.dragged   = false;
        this.direction = '';
        this.subitem   = '';

        $(this.selector).hammer().on('drag', function(e) {

            if ([Hammer.DIRECTION_LEFT, Hammer.DIRECTION_RIGHT].indexOf(e.gesture.direction) === -1) {
                return false;
            }

            var distance = Math.abs(e.gesture.distance);

            listItem.direction = e.gesture.direction;

            // Make sub item
            if (!listItem.dragged) {

                listItem.subitem = $('<div/>', {
                    'data-role' : 'subitem',
                    class : listItem[listItem.direction][0].class,
                });

                listItem.subitem.css({
                    height   : e.target.offsetHeight,
                    left     : e.target.offsetLeft,
                    position : 'absolute',
                    top      : e.target.offsetTop,
                    width    : e.target.offsetWidth,
                    'z-index' : e.target.style.zIndex - 1,
                });

                $(e.target).parent().append(listItem.subitem);
            }

            // Move the target
            $(e.target).css({
                transform : 'translate3d(' + e.gesture.deltaX + 'px, 0, 0)'
            });

            // Determine which actions should be performed
            listItem[listItem.direction].forEach(function(el, index) {

                if (distance >= el.distance[0] && (typeof el.distance[1] == 'undefined' || distance < el.distance[1])) {

                    listItem.current = el;
                    listItem.subitem.removeClass().addClass(el.class);
                }

            }, this);

            listItem.dragged = true;
        });

        $(this.selector).hammer().on('release', function(e) {

            $(e.target).css({transform : 'translate3d(0, 0, 0)'});
            $('[data-role="subitem"]').remove();

            listItem.current.action({});

            listItem.dragged = false;
        });
    };

    return ListView;
});
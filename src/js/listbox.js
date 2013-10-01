/**
 * Listbox.js is a simple jQuery plugin that provides a more powerful
 * alternative to the standard `<select>` tag.
 *
 * The main problem of <select> tag is that last one isn't flexible for
 * customization with CSS. Listbox.js solves this problem. This component
 * runs on top of <select> tag and creates an alternative to the last one
 * based on <div> tags. It opens up great possibilities for customization.
 *
 * @copyright   (c) 2012, Igor Kalnitsky.
 * @license     BSD, 3-clause
 */

(function ($) {

    /**
     * Creates an instance of Listbox.
     *
     * @constructor
     * @this {Listbox}
     * @param {object} domelement DOM element to be converted to the Listbox
     * @param {object} options an object with Listbox settings
     */
    function Listbox(domelement, options) {
        // CSS classes used by plugin
        this.MAIN_CLASS      = 'lbjs';
        this.LIST_CLASS      = 'lbjs-list';
        this.LIST_ITEM_CLASS = 'lbjs-item';
        this.SEARCHBAR_CLASS = 'lbjs-searchbar';

        // internal state members
        /** @private */ this._parent   = domelement;
        /** @private */ this._settings = options;

        // initialize object
        this._init.call(this);
    }


    /**
     * Initialize the Circle object. Hide a parent DOM element
     * and creates the Listbox alternative.
     *
     * @private
     * @this {Listbox}
     */
    Listbox.prototype._init = function () {
        // create new flexible element
        this._createListbox();
        // hide parent element
        this._parent.css('display', 'none');
        // select first element by default
        this._setItem(this._list.children().first());
    }


    /**
     * Creates a `div`-based listbox.
     *
     * @private
     * @this {Listbox}
     */
    Listbox.prototype._createListbox = function () {
        this._listbox = $('<div>')
            .addClass(this.MAIN_CLASS)
            .insertAfter(this._parent);

        if (this._settings['class'] !== null)
            this._listbox.addClass(this._settings['class']);

        if (this._settings['searchbar'])
            this._createSearchbar();

        this._createList();
    }

    /**
     * Creates a Listbox's searchbar.
     *
     * @private
     * @this {Listbox}
     */
    Listbox.prototype._createSearchbar = function () {

        // searchbar wrapper is needed for properly stretch
        // the seacrhbar over the listbox width
        var searchbarWrapper = $('<div>')
            .addClass(this.SEARCHBAR_CLASS + '-wrapper')
            .appendTo(this._listbox);

        var searchbar = $('<input>')
            .addClass(this.SEARCHBAR_CLASS)
            .appendTo(searchbarWrapper)
            .attr('placeholder', 'search...');

        // set filter handler
        var instance = this;
        searchbar.keyup(function () {
            var searchQuery = $(this).val().toLowerCase();

            if (searchQuery !== '') {
                // hide list items which not matched search query
                instance._list.children().each(function (index) {
                    var text = $(this).text().toLowerCase();

                    if (text.search('^' + searchQuery) != -1) {
                        $(this).css('display', 'block');
                    } else {
                        $(this).css('display', 'none');

                        // remove selection from hidden elements to
                        // protect against implicitly influence
                        instance._unselectItem($(this));
                    }
                });
            } else {
                // make visible all list items
                instance._list.children().each(function () {
                    $(this).css('display', 'block')
                });
            }

            // select first visible element if none select yet
            var isItemSelect = instance._list.children('[selected]').length > 0;
            if (!instance._settings['multiselect'] && !isItemSelect)
                instance._setItem(instance._list.children(':visible').first());
        });

        // save for using in _resizeListToListbox()
        this._searchbarWrapper = searchbarWrapper;
    }


    /**
     * Creates a list. The List is an element with list items.
     *
     * @private
     */
    Listbox.prototype._createList = function () {
        // create container
        this._list = $('<div>')
            .addClass(this.LIST_CLASS)
            .appendTo(this._listbox);

        this._resizeListToListbox();

        // create items
        var instance = this;
        this._parent.children().each(function () {
            var item = $('<div>')
                .addClass(instance.LIST_ITEM_CLASS)
                .appendTo(instance._list)
                .text($(this).text())
                .click(function () {
                    instance._settings['multiselect']
                        ? instance._toggleItem($(this))
                        : instance._setItem($(this));
                });

            if ($(this).attr('disabled'))
                item.attr('disabled', '');
        });
    }


    /**
     * @private
     */
    Listbox.prototype._selectItem = function (item) {
        if (item.attr('disabled'))
            return;

        item.attr('selected', 'selected');

        // make changes in real list
        var selectItem = this._parent.children().get(item.index());
        $(selectItem).attr('selected', 'selected');
    }


    /**
     * @private
     */
    Listbox.prototype._unselectItem = function (item) {
        item.removeAttr('selected');

        // make changes in real list
        var selectItem = this._parent.children().get(item.index());
        $(selectItem).removeAttr('selected');
    }


    /**
     * A callback for SingleSelect Listbox. Reset previously
     * selected item if the new item was selected.
     *
     * @param {object} item a DOM object
     * @private
     */
    Listbox.prototype._setItem = function (item) {
        if (item.attr('disabled'))
            return;

        var options = this._parent.children('[selected]');

        this._list.children('[selected]').each(function (index) {
            $(this).removeAttr('selected');
            $(options.get(index)).removeAttr('selected');
        });

        this._selectItem(item);
    }


    /**
     * A callback for MultiSelect Listbox. Just toggle item selection.
     *
     * @param {object} item a DOM object
     * @private
     */
    Listbox.prototype._toggleItem = function (item) {
        item.attr('selected')
            ? this._unselectItem(item)
            : this._selectItem(item);
    }


    /**
     * Resize list to lisbox. It's a small hack since I can't
     * do it with CSS.
     *
     * @private
     */
    Listbox.prototype._resizeListToListbox = function () {
        var listHeight = this._listbox.height();

        if (this._settings['searchbar'])
            listHeight -= this._searchbarWrapper.outerHeight(true);

        this._list.height(listHeight);
    }


    /**
     * jQuery plugin definition.
     *
     * @param {object} options an object with Listbox settings
     */
    $.fn.listbox = function (options) {
        var settings = $.extend({
            'class':        null,
            'searchbar':    true,
            'multiselect':  false
        }, options);

        return this.each(function () {
            new Listbox($(this), settings)
        });
    }
})(jQuery);
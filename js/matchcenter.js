/**
 * @fileOverview codebase for match center module
 */

/**
 * @requires jQuery
 */


espn.matchcenter = (function($) {

    var api;

    // Cache frequently used selectors
    var $mcr = $('#mcr');

    /**
     * Add all necessary event handlers
     */
    function addEvents() {
        $mcr.on('click', '.mcr-all-player-mugshot a', handlePlayerCard);
        $mcr.on('click', '.mcr-filters a', filterPlayersByCategory);
    }

    /**
     * Handle click on a player mugshot
     */
    function handlePlayerCard() {
        // Cache this jquery object
        var $this = $(this);
        // Get attributes of this player
        var playerType = $this.data('ptype');
        var playerId = $this.data('pid');
        var playerName = $.trim($this.text());

        // Return if necessary data attributes are missing
        if (typeof playerType == 'undefined' ||
            typeof playerId == 'undefined') {
            return false;
        }

        //console.log('handlePlayerCard', playerType, playerId, playerName);

        // Remove previous classes and add desired card type class
        $mcr.removeClass().addClass('mcr-' + playerType);
        // Make player list 18 column to accomodate filters
        $mcr.find('.mcr-playerlist')
            .removeClass('large-20')
            .addClass('large-18');

        // @tod - dummy data, remove later
        var lookup = {
            bat: 'Batsman',
            bowl: 'Bowler'
        };
        var content = '<p class="dummy">' + lookup[playerType] +
            ' Card for ' + playerName + '</p>';

        // Update visualization content
        $mcr.children('.mcr-vis').html(content);

        // Remove striker/non-striker classes from mugshot links
        $mcr.find('.mcr-all-player-mugshot a').removeClass();
        // Remove previously selected player
        $mcr.find('.mcr-all-player-mugshot').removeClass('mcr-selected-player');
        // Add highlighter classes
        $this.parent().addClass('mcr-selected-player');
        return false;
    }


    /**
     * Filter batsman/bowler mugshot list based on the selected filter
     */
    function filterPlayersByCategory() {
        // Cache this jquery object
        var $this = $(this);

        // Lookup divs for batsmen and bowlers
        var lookupDiv = {
            bat: '.mcr-all-batsmen',
            bowl: '.mcr-all-bowlers'
        };

        // List of valid values for a player type
        var validkeys = _.keys(lookupDiv);

        // Get attributes of this player
        var playerType = $this.data('ptype');
        var playerCategory = $this.data('category');

        // Return if necessary data attributes are missing/key is not bat/bowl
        if (typeof playerType == 'undefined' ||
            typeof playerCategory == 'undefined' ||
            _.indexOf(validkeys, playerType) === -1) {
            return false;
        }

        // Target either batsmen or bowlers list based on playerType
        var $members = $mcr.find(lookupDiv[playerType]).children('li');

        // Iterate over the list and filter list items
        $members.hide()
            .filter(function() {
                // return true since for all players need to be shown
                if (playerCategory === 'all') {
                    return true;
                }
                // If category data attribute is missing, exclude player
                if ($(this).data().hasOwnProperty('category') === false) {
                    return false;
                }
                // Get category which this player belongs to
                var categories = $(this).data('category');
                // Return true if selected category exists in player's category
                if (categories.indexOf(playerCategory) > -1) {
                    return true;
                }
                // No match found, hence exclude this player from filtered list
                return false;
            })
            .slideDown(300, 'linear');
        return false;
    }

    // Execute necessary functions
    addEvents();

    // Return api if any
    return api;

}(jQuery));
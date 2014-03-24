/**
 * @fileOverview codebase for match center module
 */

/**
 * @requires jQuery
 */


espn.matchcenter = (function($) {

    console.log('matchcenter init', $.fn.jquery);

    var api;

    // Cache frequently used selectors
    var $mcr = $('#mcr');

    /**
     * Add all necessary event handlers
     */
    function addEvents() {
        $('#mcr').on('click', '.mcr-all-player-mugshot a', handlePlayerCard);
    }

    /**
     * Handle click on a player mugshot
     * @return {Boolean} false value
     */
    function handlePlayerCard() {
        // Cache this jquery object
        var $this = $(this);
        // Get attributes of this player
        var playerType = $this.data('ptype');
        var playerId = $this.data('pid');
        var playerName = $.trim($this.text());
        //console.log('handlePlayerCard', playerType, playerId, playerName);

        // Remove previous classes and add desired card type class
        $mcr.removeClass().addClass('mcr-'+playerType);
        // Make player list 18 column to accomodate filters
        $mcr.find('.mcr-playerlist')
            .removeClass('large-20')
            .addClass('large-18');

        // @tod - dummy data, remove later
        var lookup = {
            bat : 'Batsman',
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
        $this.addClass('selectedPlayer');

        return false;
    }

    // Execute necessary functions
    addEvents();

    // Return api if any
    return api;

}(jQuery));
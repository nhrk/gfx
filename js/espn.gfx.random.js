/**
 * @fileOverview Generate random data for charts
 */

// Init namespaces
var espn = espn || {};
espn.gfx = espn.gfx || {};

/**
 * namespace for generating random data for various charts
 * @return {Object} Object containing data for each chart
 */
espn.gfx.random = (function(){

    var api = {};

    api.wagon = function(){
        var index,
            ar = [
                {runs: Math.round((Math.random() * 100)), zone : 1},
                {runs: Math.round((Math.random() * 100)), zone : 2},
                {runs: Math.round((Math.random() * 100)), zone : 3},
                {runs: Math.round((Math.random() * 100)), zone : 4},
                {runs: Math.round((Math.random() * 100)), zone : 5},
                {runs: Math.round((Math.random() * 100)), zone : 6},
                {runs: Math.round((Math.random() * 100)), zone : 7},
                {runs: Math.round((Math.random() * 100)), zone : 8}
            ],
            c = 0;

        for(var i=0, len = ar.length; i < len; i++){
            if(ar[i].runs > c){
                c = ar[i].runs;
                index = i;
            }
        }

        ar[index].max = true;
        return ar;
    };

    return api;

}());
'use strict';

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
espn.gfx.random = (function() {

    var api = {};

    api.wagon = function() {
        var index,
            ar = [{
                runs: Math.round((Math.random() * 100)),
                zone: 1
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 2
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 3
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 4
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 5
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 6
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 7
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 8
            }],
            c = 0;

        for (var i = 0, len = ar.length; i < len; i++) {
            if (ar[i].runs > c) {
                c = ar[i].runs;
                index = i;
            }
        }

        ar[index].max = true;
        return ar;
    };


    api.bar = function() {
        return Math.floor(Math.random() * 100);
    };

    api.partnerships = function(dataLength, stackLength, title, label) {

        stackLength = stackLength || 3;
        dataLength = dataLength || 7;

        var data = [],
            obj,
            arr;

        for (var i = 0; i < stackLength; i++) {
            arr = [];
            for (var j = 0; j < dataLength; j++) {
                obj = {};
                obj.x = j;
                obj.y = Math.floor(Math.random() * 10);
                obj.title = (i == 0) ? title || Math.floor(Math.random() * 10) + '(' + Math.floor(Math.random() * 100) + ')' : null;
                obj.label = (i == 0) ? label || 'Cook ' + Math.floor(Math.random() * 10) + '(' + Math.floor(Math.random() * 100) + ')' : null;
                obj.stackId = i + '' + j;
                obj.layer = i;
                arr.push(obj);
            }
            data.push(arr);
        }
        return data;
    }

    api.heatmap = function() {

        var index,
            ar = [{
                runs: Math.round((Math.random() * 10)),
                zone: 1
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 2
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 3
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 4
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 5
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 6
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 7
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 8
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 9
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 10
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 11
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 12
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 13
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 14
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 15
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 16
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 17
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 18
            }, {
                runs: Math.round((Math.random() * 100)),
                zone: 19
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 20
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 21
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 22
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 23
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 24
            }, {
                runs: Math.round((Math.random() * 10)),
                zone: 25
            }],
            c = 0;

        for (var i = 0, len = ar.length; i < len; i++) {
            if (ar[i].runs > c) {
                c = ar[i].runs;
                index = i;
            }
        }

        ar[index].max = true;

        var random = Math.floor(Math.random() * 8) + 1;
        ar[random].wickets = 1;
        return ar;
    }

    api.spikes = function(dia, len) {

        len = len || 25;
        dia = dia || 225;

        var ar = [];

        for (var i = 0; i < len; i++) {
            ar.push({
                runs: Math.floor(Math.random() * 6) + 1,
                x: Math.floor(Math.random() * dia) + 1,
                y: Math.floor(Math.random() * dia) + 1,
                comms: 'Hey there! - ' + i
            });
        }

        return ar;
    }

    api.dualAxis = function() {
        function random() {
            return Math.round((Math.random() * 25))
        }
        return [{
            runs: random(),
            balls: random(),
            spell: '1',
            overs: '1-5'
        }, {
            runs: random(),
            balls: random(),
            spell: '2',
            overs: '10-12'
        }, {
            runs: random(),
            balls: random(),
            spell: '3',
            overs: '21-22'
        }, {
            runs: random(),
            balls: random(),
            spell: '4',
            overs: '35-39'
        }, {
            runs: random(),
            balls: random(),
            spell: '5',
            overs: '48-50'
        }];
        return Math.floor(Math.random() * 100);
    }

    api.bars = function(length, randomLength) {

        length = (randomLength ? random() : length) || 15;

        function random() {
            return Math.round((Math.random() * 25))
        }

        var count = 1,
            arr = [];

        while (count <= length) {
            arr.push({
                runs: random(),
                balls: random(),
                powerplay: random() < 10 ? true : false,
                overs: count
            });
            count++;
        }

        return arr;
    }

    api.line = function(start, end) {

        start = start || 1
        end = end || 10

        var arr = [];
        while (start <= end) {
            arr.push({
                over: start,
                runs: Math.round((Math.random() * 100)),
                rate: (Math.random() * 100)
            });
            start++;
        }
        return arr;
    }

    return api;

}());
'use strict';

espn.gfx = espn.gfx || {};

espn.gfx.getBBox = function(node){

    var bbox = {};
    
    if(!node){
        return bbox;
    }

    try{
        bbox = node.getBBox();
    }catch(e){
        bbox = {
            x: node.clientLeft,
            y: node.clientTop,
            width: node.clientWidth,
            height: node.clientHeight
        }
    }
    return bbox;
}
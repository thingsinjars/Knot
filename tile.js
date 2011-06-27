// minilib
function $(id){ if(id.nodeType) {return id;} else {return document.getElementById(id);} }
function html(id,  html){ $(id).innerHTML = html; }
function css(id,  style){ $(id).style.cssText += ';'+style; }
function anim(id,  transform,  opacity,  dur){css(id,  '-webkit-transition:-webkit-transform'+', opacity '+(dur||0.5)+'s, '+(dur||0.5)+'s;-webkit-transform:'+transform+';opacity:'+(1||opacity));}
function dc(tag) { return document.createElement(tag); };
function listen(id,  hook,  listener,  bubble) {$(id).addEventListener(hook,  listener,  bubble);}
function doNothing(e) {e.preventDefault();}
function collect(a,f){var n=[];for(var i=0;i<a.length;i++){var v=f(a[i]);if(v!=null)n.push(v)}return n};
ajax={};
ajax.x=function(){try{return new ActiveXObject('Msxml2.XMLHTTP')}catch(e){try{return new ActiveXObject('Microsoft.XMLHTTP')}catch(e){return new XMLHttpRequest()}}};
ajax.serialize=function(f){var g=function(n){return f.getElementsByTagName(n)};var nv=function(e){if(e.name)return encodeURIComponent(e.name)+'='+encodeURIComponent(e.value);else return ''};var i=collect(g('input'),function(i){if((i.type!='radio'&&i.type!='checkbox')||i.checked)return nv(i)});var s=collect(g('select'),nv);var t=collect(g('textarea'),nv);return i.concat(s).concat(t).join('&');};
ajax.send=function(u,f,m,a){var x=ajax.x();x.open(m,u,true);x.onreadystatechange=function(){if(x.readyState==4)f(x.responseText)};if(m=='POST')x.setRequestHeader('Content-type','application/x-www-form-urlencoded');x.send(a)};
ajax.get=function(url,func){ajax.send(url,func,'GET')};
ajax.gets=function(url){var x=ajax.x();x.open('GET',url,false);x.send(null);return x.responseText};
ajax.post=function(url,func,args){ajax.send(url,func,'POST',args)};
ajax.update=function(url,elm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.get(url,f)};
ajax.submit=function(url,elm,frm){var e=$(elm);var f=function(r){e.innerHTML=r};ajax.post(url,f,ajax.serialize(frm))};

function evXY(e) {
  if(e.pageX) {
    return {
      x:e.pageX,
      y:e.pageY
    }
  } else {
    return {
      x:e.clientX,
      y:e.clientY
    }
  }
}

  var Knot = {
  // This just holds info about drawing the knot, nothing else
    canvas: document.getElementById('k'),
    context: document.getElementById('k').getContext('2d'),
    styles: {
        'elastic':{
            wobble: false,
            strokeStyle: '#9ff',
            shadowColor: '#000',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 10,
            lineCap: 'round',
            lineWidth: 8
            },
        'neon':{
            wobble: true,
            strokeStyle: '#0ff',
            shadowColor: '#fff',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 5,
            lineCap: 'round',
            lineWidth: 6
            }
        },
    style: 'elastic',
    clear: function() {
      Knot.context.fillRect(TileBoard.x, TileBoard.y, TileBoard.numX * TileBoard.tileWidth, TileBoard.numY * TileBoard.tileWidth);
    }
  };
  var TileBoard = {
    x: 0,
    y: 0,
    numX: 3,
    numY: 3,
    tileWidth: 106,
    shouldSnap: true,
    showGrid: false,
    tiles:[],
    tileHolders:[],
    grabBag:[],
    mouseDown: false,
    canvas: document.getElementById('c'),
    context: document.getElementById('c').getContext('2d'),
    patterns: [],
    init: function() {
      TileBoard.tiles.length=0;
      TileBoard.tileHolders.length=0;
      TileBoard.resetTiles();
      TileBoard.instantiatePatterns();
    },
    instantiatePatterns: function() {
      for (var pattern in patternSeeds){
          TileBoard.createHomeomorphisms(pattern, patternSeeds[pattern]);
      };
    },
    clear: function() {
      TileBoard.context.fillRect(TileBoard.x, TileBoard.y, TileBoard.numX * TileBoard.tileWidth, TileBoard.numY * TileBoard.tileWidth);
    },
    overBoard: function(e) {
      /* Is the given event happening over the board? */
      ev = evXY(e);
      ev.x -= TileBoard.x;
      ev.y -= TileBoard.y;
      if( ( ev.x < (TileBoard.numX * TileBoard.tileWidth) && ev.x > TileBoard.x ) && ( ev.y < (TileBoard.numY * TileBoard.tileWidth) && ev.y > TileBoard.y )) {
        return true;
      }
    },
    overTile: function(e) {
      // which tile is the current event over?
      ev = evXY(e);
      ev.x -= TileBoard.x;
      ev.y -= TileBoard.y;

      foundTile = -1;
      var i=0;
      while(foundTile<0 && i<TileBoard.tiles.length) {
        if( ( TileBoard.tiles[i].x <= ev.x && TileBoard.tiles[i].x+TileBoard.tileWidth >= ev.x ) &&
            ( TileBoard.tiles[i].y <= ev.y && TileBoard.tiles[i].y+TileBoard.tileWidth >= ev.y ) ) {
          foundTile = i;
        }
        i++;
      }
      if(foundTile>=0) {
        return foundTile
      } else {
        return false;
      }
    },
    resetTiles: function() {
      for (var i = 0; i < TileBoard.numY; i++ ) {
        for (var j = 0; j < TileBoard.numY; j++ ) {
          TileBoard.tiles[ j + ( TileBoard.numX * i )] = {
                color:'#900',
                strokeColor:'#000',
                text:  j + ( TileBoard.numX * i ),
                grabbed:  false,
                x: j * TileBoard.tileWidth + TileBoard.x,
                y: i * TileBoard.tileWidth + TileBoard.y
            };
        }
      }
      for ( var i = TileBoard.tiles.length - 1; i >= 0; i-- ) {
        TileBoard.tileHolders[i] = i;
      }

    },
    untouchTiles: function() {
      TileBoard.grabBag.length=0;
      for ( var i = TileBoard.tiles.length - 1; i >= 0; i-- ) {
        TileBoard.tiles[i].grabbed = false;
      }
    },
    findLooseTiles: function() {
      /* Tidy up when someone lets go of multiple tiles */
      var looseTiles = [];
      for ( var i = TileBoard.tiles.length - 1; i >= 0; i-- ) {
        if(TileBoard.tileHolderFromTile(i)<0) {
          looseTiles.push(i);
        }
      }
      return looseTiles;
    },
    findTileHolderDistances: function(x, y) {
      /* In order to snap into place, figure out where the nearest empty slot is */
      var distances = [];
      for (var i = TileBoard.tileHolders.length - 1; i >= 0; i--){
        distances.push({tileHolderIndex: i, distance: Math.sqrt( Math.pow(x-TileBoard.tileX(i), 2) + Math.pow(y-TileBoard.tileY(i), 2) ) } );
      };
      //Sort by distance
      distances.sort( function(a, b) {
        return a.distance - b.distance;
      } );

      return distances;
    },
    findNearestTileHolder: function(x, y) {
      var distances = TileBoard.findTileHolderDistances(x, y);
      return distances[0].tileHolderIndex;
    },
    findNearestAvailableTileHolder: function(x, y) {
      var distances = TileBoard.findTileHolderDistances(x, y);
      var i=0;
      while(TileBoard.tileHolders[distances[i].tileHolderIndex] != null){
        i++;
      }
      return distances[i].tileHolderIndex;
    },
    tileHolderFromTile: function(tileIndex) {
      foundTile = -1;
      var i=0;
      while(foundTile<0 && i<TileBoard.tileHolders.length) {
        if(TileBoard.tileHolders[i]==tileIndex) {
          foundTile = i;
        }
        i++;
      }
      return foundTile;
    },
    tileXYtoIndex: function(x, y) {
       return x + ( TileBoard.numX * y );
    },
    tileFromTouch: function(i) {
      foundTile = -1;
      var i=0;
      while(foundTile<0 && i<TileBoard.tiles.length) {
        if(TileBoard.tiles.grab[0]==i) {
          foundTile = i;
        }
        i++;
      }
    },
    tileX: function(tileIndex) {
      return TileBoard.tileXindex(tileIndex) * TileBoard.tileWidth;
    },
    tileY: function(tileIndex) {
      return TileBoard.tileYindex(tileIndex) * TileBoard.tileWidth;
    },
    tileXindex: function(tileIndex) {
      return (tileIndex%TileBoard.numX);
    },
    tileYindex: function(tileIndex) {
      return (~~(tileIndex/TileBoard.numY));
    },
    tileOrder: function() {
      var returnable='';
      for (var i=0; i < TileBoard.tileHolders.length; i++) {
        returnable=returnable+TileBoard.tileHolders[i];
      };
      return returnable;
    },
    patternCycle: function(seed, cycles) {
      /* Probably a better way to do these swaps but it's late and I'm sleepy */
      for(var i=cycles;i>0;i--) {
        seed = seed.replace('5','x');
        seed = seed.replace('7','5');
        seed = seed.replace('3','7');
        seed = seed.replace('1','3');
        seed = seed.replace('x','1');
        seed = seed.replace('8','x');
        seed = seed.replace('6','8');
        seed = seed.replace('0','6');
        seed = seed.replace('2','0');
        seed = seed.replace('x','2');
      }
      return seed;
    },
    anticlockwise: function(seed) {
      seed = seed.replace('3','x');
      seed = seed.replace('5','3');
      seed = seed.replace('x','5');
      seed = seed.replace('2','x');
      seed = seed.replace('0','2');
      seed = seed.replace('x','0');
      seed = seed.replace('6','x');
      seed = seed.replace('8','6');
      seed = seed.replace('x','8');
      return seed;
    },
    createHomeomorphisms: function(patternName, pattern) {
      //rotations
      //mirror
      //cycle x 3
      //   rotations
      //   mirror
      //anticlockwise
      //   rotations
      //   mirror
      //   cycle x 3
      //      rotations
      //      mirror
      var seeds=[];
      seeds.push(pattern.seed); //original
      seeds.push(TileBoard.patternCycle(pattern.seed, 1)); //Three cycle variations
      seeds.push(TileBoard.patternCycle(pattern.seed, 2));
      seeds.push(TileBoard.patternCycle(pattern.seed, 3));

      var antiSeed = TileBoard.anticlockwise(pattern.seed);
      seeds.push(antiSeed); //Anticlockwise
      seeds.push(TileBoard.patternCycle(antiSeed, 1)); //Three cycle variations
      seeds.push(TileBoard.patternCycle(antiSeed, 2));
      seeds.push(TileBoard.patternCycle(antiSeed, 3));

      //Should now have 8 variations on the same knot structure
      //Now we can loop through them adding the seeds, rotations and mirrors to the patterns array
      for (var i = seeds.length - 1; i >= 0; i--){
        TileBoard.patterns[seeds[i]] = patternName; // Add original seed

        var splitSeed = seeds[i].split("");
        var reverseSplitSeed = seeds[i].split("");
        reverseSplitSeed.reverse();
        if(pattern.ninety) {
          //rotated 90°
          var key = ""+splitSeed[6]+splitSeed[3]+splitSeed[0]+splitSeed[7]+splitSeed[4]+splitSeed[1]+splitSeed[8]+splitSeed[5]+splitSeed[2];
          TileBoard.patterns[''+key] = patternName;
        }
        if(pattern.oneeighty) {
          //rotated 180°
          var key = reverseSplitSeed.join('');
          TileBoard.patterns[''+key] = patternName;
        }
        if(pattern.oneeighty && pattern.ninety) {
          //rotated 270°
          var key = ""+reverseSplitSeed[6]+reverseSplitSeed[3]+reverseSplitSeed[0]+reverseSplitSeed[7]+reverseSplitSeed[4]+reverseSplitSeed[1]+reverseSplitSeed[8]+reverseSplitSeed[5]+reverseSplitSeed[2];
          TileBoard.patterns[''+key] = patternName;
        }
        if(pattern.flipvertical) {
          //Flipped Vertical
          var key = ""+splitSeed[6]+splitSeed[7]+splitSeed[8]+splitSeed[3]+splitSeed[4]+splitSeed[5]+splitSeed[0]+splitSeed[1]+splitSeed[2];
          TileBoard.patterns[''+key] = patternName;
          if(pattern.ninety) {
            //Flipped Vertical and rotated 90°
            ninetyKey = ""+splitSeed[0]+splitSeed[3]+splitSeed[6]+splitSeed[1]+splitSeed[4]+splitSeed[7]+splitSeed[2]+splitSeed[5]+splitSeed[8];
            TileBoard.patterns[''+ninetyKey] = patternName;
            if(pattern.oneeighty) {
            //Flipped Vertical and rotated 270°
              key = ninetyKey.split('').reverse().join('');
              TileBoard.patterns[''+ninetyKey] = patternName;
            }
            key = ""+splitSeed[0]+splitSeed[3]+splitSeed[6]+splitSeed[1]+splitSeed[4]+splitSeed[7]+splitSeed[2]+splitSeed[5]+splitSeed[8];
            TileBoard.patterns[''+key] = patternName;
          }
          if(pattern.oneeighty) {
            //Flipped Vertical and rotated 180°
            key = key.split('').reverse().join('');
            TileBoard.patterns[''+key] = patternName;
          }
        }
        if(pattern.fliphorizontal) {
          var key = ""+splitSeed[2]+splitSeed[1]+splitSeed[0]+splitSeed[5]+splitSeed[4]+splitSeed[3]+splitSeed[8]+splitSeed[7]+splitSeed[6];
          TileBoard.patterns[''+key] = patternName;
          if(pattern.ninety) {
            var ninetyKey = ""+splitSeed[8]+splitSeed[5]+splitSeed[2]+splitSeed[7]+splitSeed[4]+splitSeed[1]+splitSeed[6]+splitSeed[3]+splitSeed[0];
            TileBoard.patterns[''+key] = patternName;
            if(pattern.oneeighty) {
              key = ninetyKey.split('').reverse().join('');
              TileBoard.patterns[''+ninetyKey] = patternName;
            }
          }
          if(pattern.oneeighty) {
            key = key.split('').reverse().join('');
            TileBoard.patterns[''+key] = patternName;
          }
        }
      }
    },
    checkPattern: function(orderCode) {
      if(TileBoard.patterns[orderCode] != undefined) {
        notify(TileBoard.patterns[orderCode]);
      }
    }
  };
  notify = function(message) {
    html('notify',message);
    $('notify').className='show';
    setTimeout(function() {$('notify').className='';}, 1000);
  }

  TileBoard.init();
  Knot.canvas.width = TileBoard.canvas.width = TileBoard.numX*TileBoard.tileWidth;
  Knot.canvas.height = TileBoard.canvas.height = TileBoard.numY*TileBoard.tileWidth;

  drawTile = function(tileIndex){
    var tileX = TileBoard.tiles[tileIndex].x;
    var tileY = TileBoard.tiles[tileIndex].y;

    TileBoard.context.moveTo(TileBoard.tiles[tileIndex].x, TileBoard.tiles[tileIndex].y);

    TileBoard.context.fillStyle=TileBoard.tiles[tileIndex].color;
    TileBoard.context.fillRect(tileX, tileY, TileBoard.tileWidth, TileBoard.tileWidth);

    TileBoard.context.strokeStyle=TileBoard.tiles[tileIndex].strokeColor;
    TileBoard.context.strokeRect(tileX, tileY, TileBoard.tileWidth, TileBoard.tileWidth);

    TileBoard.context.fillStyle='#fff';
    TileBoard.context.fillText(TileBoard.tiles[tileIndex].text, tileX+TileBoard.tileWidth/2, tileY+TileBoard.tileWidth/2, TileBoard.tileWidth);
  }

  drawQuadraticCurve = function(context, controlTileIndex, destinationTileIndex) {
    var controlX = TileBoard.tiles[controlTileIndex].x;
    var controlY = TileBoard.tiles[controlTileIndex].y;
    var destinationX = TileBoard.tiles[destinationTileIndex].x;
    var destinationY = TileBoard.tiles[destinationTileIndex].y;

    if(Knot.styles[Knot.style].wobble) {
      controlX += (Math.random()*5-0.5);
    }

    context.quadraticCurveTo( controlX+TileBoard.tileWidth/2, controlY+TileBoard.tileWidth/2, destinationX+TileBoard.tileWidth/2, destinationY+TileBoard.tileWidth/2 );
  }

  draw = function() {
    Knot.clear();
    if(TileBoard.showGrid) {
      TileBoard.clear();
      for (var i = TileBoard.tiles.length - 1; i >= 0; i--){
        drawTile(i)
      };
    }

    //draw curve

    //Load styles from Knot Object
    Knot.context.shadowOffsetX = Knot.styles[Knot.style].shadowOffsetX;
    Knot.context.shadowOffsetY = Knot.styles[Knot.style].shadowOffsetY;
    Knot.context.shadowBlur = Knot.styles[Knot.style].shadowBlur;
    Knot.context.shadowColor = Knot.styles[Knot.style].shadowColor;
    Knot.context.lineCap = Knot.styles[Knot.style].lineCap;
    Knot.context.lineWidth = Knot.styles[Knot.style].lineWidth;
    Knot.context.strokeStyle = Knot.styles[Knot.style].strokeStyle;

    /* Draw the thing */
    Knot.context.beginPath();
    Knot.context.moveTo(TileBoard.tiles[TileBoard.tileXYtoIndex(0,1)].x+TileBoard.tileWidth/2,TileBoard.tiles[TileBoard.tileXYtoIndex(0,1)].y+TileBoard.tileWidth/2);
    drawQuadraticCurve(Knot.context,TileBoard.tileXYtoIndex(0,0),TileBoard.tileXYtoIndex(1,0));
    Knot.context.stroke();
    Knot.context.beginPath();
    Knot.context.moveTo(TileBoard.tiles[TileBoard.tileXYtoIndex(1,0)].x+TileBoard.tileWidth/2,TileBoard.tiles[TileBoard.tileXYtoIndex(1,0)].y+TileBoard.tileWidth/2);
    drawQuadraticCurve(Knot.context,TileBoard.tileXYtoIndex(2,0),TileBoard.tileXYtoIndex(2,1));
    Knot.context.stroke();
    Knot.context.beginPath();
    Knot.context.moveTo(TileBoard.tiles[TileBoard.tileXYtoIndex(2,1)].x+TileBoard.tileWidth/2,TileBoard.tiles[TileBoard.tileXYtoIndex(2,1)].y+TileBoard.tileWidth/2);
    drawQuadraticCurve(Knot.context,TileBoard.tileXYtoIndex(2,2),TileBoard.tileXYtoIndex(1,2));
    Knot.context.stroke();
    Knot.context.beginPath();
    Knot.context.moveTo(TileBoard.tiles[TileBoard.tileXYtoIndex(1,2)].x+TileBoard.tileWidth/2,TileBoard.tiles[TileBoard.tileXYtoIndex(1,2)].y+TileBoard.tileWidth/2);
    drawQuadraticCurve(Knot.context,TileBoard.tileXYtoIndex(0,2),TileBoard.tileXYtoIndex(0,1));
    Knot.context.stroke();
  }
  setInterval(draw,100);

  highlightTile = function(e) {
    if(TileBoard.overBoard(e)) {
      TileBoard.resetTiles();
      TileBoard.tiles[TileBoard.overTile(e)].color='#f99';
    }
  };
  showOrder = function(e) {
    if(e.touches) {
      if(e.touches.length==5) {
        alert(TileBoard.tileOrder());
      }
    }
  };

  grabTile = function(e) {
    if(e.touches) {
      if(e.touches.length==5) {
        // handy when designing new patterns, touch with 5 fingers to see the current code.
        notify(TileBoard.tileOrder());
      }
      for (var i = 0; i < e.touches.length; i++) {
        if(TileBoard.overBoard(e.touches[i])) {
          var tileIndex =TileBoard.overTile(e.touches[i]);
          TileBoard.tiles[tileIndex].startX=e.touches[i].pageX;
          TileBoard.tiles[tileIndex].startY=e.touches[i].pageY;
          TileBoard.tiles[tileIndex].grabbed=true;
          TileBoard.tiles[tileIndex].color='#f99';
          TileBoard.grabBag[i] = tileIndex;

          //If this tile was previously snapped in place
          tileHolderIndex = TileBoard.tileHolderFromTile(tileIndex);
          if(tileHolderIndex>-1) {
            //Remove it from holders list
            TileBoard.tileHolders[tileHolderIndex] = null;
          }

        }
      }
    } else {
      TileBoard.mouseDown = true;
      // console.log('grabbed with mouse');
      if(TileBoard.overBoard(e)) {
        var tileIndex =TileBoard.overTile(e);
        TileBoard.tiles[tileIndex].startX=e.clientX;
        TileBoard.tiles[tileIndex].startY=e.clientY;
        TileBoard.tiles[tileIndex].grabbed=true;
        TileBoard.tiles[tileIndex].color='#f99';
        TileBoard.grabBag[0] = tileIndex;

        //If this tile was previously snapped in place
        tileHolderIndex = TileBoard.tileHolderFromTile(tileIndex);
        if(tileHolderIndex>-1) {
          //Remove it from holders list
          TileBoard.tileHolders[tileHolderIndex] = null;
        }

      }
    }
  };
  moveTile = function(e) {
    if(e.touches) {
      for (var i = 0; i < e.touches.length; i++) {
        if(TileBoard.overBoard(e.touches[i])) {

          //Find out which tile it is based on the Touch Index
          tileIndex = TileBoard.grabBag[i];

          //Figure out how much the touch has moved
          var deltaX = e.touches[i].pageX-TileBoard.tiles[tileIndex].startX;
          var deltaY = e.touches[i].pageY-TileBoard.tiles[tileIndex].startY;

          //Move the tile bby that amount
          TileBoard.tiles[tileIndex].x+=deltaX;
          TileBoard.tiles[tileIndex].y+=deltaY;

          //Update the tile position for the next move
          TileBoard.tiles[tileIndex].startX=e.touches[i].pageX;
          TileBoard.tiles[tileIndex].startY=e.touches[i].pageY;

        }
      }
    } else {
      if(TileBoard.mouseDown) {
        if(TileBoard.overBoard(e)) {

          //Find out which tile it is based on the Touch Index
          tileIndex = TileBoard.grabBag[0];

          //Figure out how much the touch has moved
          var deltaX = e.clientX-TileBoard.tiles[tileIndex].startX;
          var deltaY = e.clientY-TileBoard.tiles[tileIndex].startY;

          //Move the tile bby that amount
          TileBoard.tiles[tileIndex].x+=deltaX;
          TileBoard.tiles[tileIndex].y+=deltaY;

          //Update the tile position for the next move
          TileBoard.tiles[tileIndex].startX=e.clientX;
          TileBoard.tiles[tileIndex].startY=e.clientY;


        }
      }
    }
  };
  snapPosition = function(e) {
    TileBoard.untouchTiles();
    grabTile(e);
    if(e.touches) {
    } else {
      TileBoard.mouseDown = false;
    }

    if(TileBoard.shouldSnap) {
      //Get indices of tiles which aren't in a TileHolder and haven't got a touch
      var looseTiles = TileBoard.findLooseTiles();
      for (var i = looseTiles.length - 1; i >= 0; i--){
        var snapTo = TileBoard.findNearestTileHolder(TileBoard.tiles[looseTiles[i]].x, TileBoard.tiles[looseTiles[i]].y);
        tileToMove = TileBoard.tileHolders[snapTo];
        if(tileToMove == null) {
          // it's empty
          TileBoard.tileHolders[snapTo] =  looseTiles[i];
          TileBoard.tiles[looseTiles[i]].x = TileBoard.tileX(snapTo);
          TileBoard.tiles[looseTiles[i]].y = TileBoard.tileY(snapTo);
          TileBoard.tiles[looseTiles[i]].color = '#900';
        } else {
          // Snap into this tileholder, removing anything in it.
          TileBoard.tileHolders[snapTo] = looseTiles[i];
          TileBoard.tiles[looseTiles[i]].x = TileBoard.tileX(snapTo);
          TileBoard.tiles[looseTiles[i]].y = TileBoard.tileY(snapTo);
          TileBoard.tiles[looseTiles[i]].color = '#900';

          // Place this displaced tile into the nearest available tileHolder
          snapTo = TileBoard.findNearestAvailableTileHolder(TileBoard.tiles[tileToMove].x, TileBoard.tiles[tileToMove].y);
          TileBoard.tileHolders[snapTo] = tileToMove;
          TileBoard.tiles[tileToMove].x = TileBoard.tileX(snapTo);
          TileBoard.tiles[tileToMove].y = TileBoard.tileY(snapTo);

        }
      }
      TileBoard.checkPattern(TileBoard.tileOrder());
    }
  };
  draw();
  // listen(document, 'mousemove', highlightTile, false);

  listen(c, 'mousedown', grabTile, false);
  listen(c, 'touchstart', grabTile, false);

//  listen(document, 'touchstart', showOrder, false);

  listen(c, 'mousemove', moveTile, false);
  listen($('c'), 'touchmove', moveTile, false);

  listen(c, 'mouseup', snapPosition, false);
  listen(c, 'touchend', snapPosition, false);

  listen(c, 'touchmove', doNothing, false);
  // listen(body, 'touchmove', doNothing, false);

  notify('ready');
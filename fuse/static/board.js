// Parameters:

dragdist = 3; // Number of pixels to move to start a drag

// General purpose functions.

// Get the mouse position from a mouse click event.
function getMousePosition(e)
{
    var posx = 0, posy = 0;
    if (e.pageX || e.pageY) {
	posx = e.pageX;
	posy = e.pageY;
    } else if (e.clientX || e.clientY) {
	posx = e.clientX + document.body.scrollLeft
		+ document.documentElement.scrollLeft;
	posy = e.clientY + document.body.scrollTop
		+ document.documentElement.scrollTop;
    }
    return {x: posx, y: posy};
}

// Get information about an event
function getEventInfo(e)
{
    var targ, pos, targpos;
    if (!e) var e = window.event;

    // Get the target of the event.
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) targ = targ.parentNode;

    // Get the position clicked.
    pos = getMousePosition(e);
    targpos = calcOffset(targ);
    pos.x = pos.x - targpos.x;
    pos.y = pos.y - targpos.y;

    return {e: e, targ: targ, pos: pos};
}

// Get a list of colour values from a hex description of the colour.
function colfromhex(hex)
{
    result = [parseInt(hex.substr(0, 2), 16),
	      parseInt(hex.substr(2, 2), 16),
	      parseInt(hex.substr(4, 2), 16)]
    if (hex.length > 6) {
	result.push(parseInt(hex.substr(6, 2), 16) / 255);
    }
    return result;
}

// Convert an integer from 0 to 255 to 2 hex digits.
function toHex(val)
{
    var res = val.toString(16);
    if (res.length == 1) return "0" + res;
    return res;
}

// Construct a Colour object.
function Colour(name, day, night, outline)
{
    this.name = name;
    this.day = colfromhex(day);
    this.night = colfromhex(night);
    if (outline == null) {
        this.outline = null;
    } else {
        this.outline = colfromhex(outline);
    }
}

// Construct a Palette object.
function Palette()
{
    this.cols = [];

    this.cols[null] = new Colour('', 'f0f0f0', '000000');
    this.cols[-2] = new Colour('highlight', '2971ed80', '2971ed80');
    this.cols[-1] = new Colour('empty', '808080', '202020');
    this.colours = 0;
    this.AddColour('01 white', 'ffffff', '000000', '808080');
    this.AddColour('02 cream', 'f9f6c1', '000000', '808080');
    this.AddColour('03 yellow', 'f3d127', '000000');
    this.AddColour('04 orange', 'ed6911', '000000');
    this.AddColour('05 red', 'c40316', '000000');
    this.AddColour('06 pink', 'ed9bbc', '000000');
    this.AddColour('07 purple', '67295c', '000000');
    this.AddColour('08 dark blue', '102e64', '000000');
    this.AddColour('09 light blue', '156ebe', '000000');
    this.AddColour('10 green', '1b5d16', '000000');
    this.AddColour('11 light green', '07d262', '000000');
    this.AddColour('12 dark brown', '4a3b26', '000000');

    this.AddColour('17 grey', '8f9f94', '000000');
    this.AddColour('18 black', '000000', '000000');
    this.AddColour('19 clear', 'ffffff50', '000000', '808080');
    this.AddColour('20 reddish brown', 'b92e01', '000000');
    this.AddColour('21 light brown', 'c47f34', '000000');
    this.AddColour('22 dark red', 'ac010d', '000000');

    this.AddColour('26 flesh', 'f0bc95', '000000');
    this.AddColour('27 beige', 'cfab6e', '000000');

    this.AddColour('32 fuchsia', 'ad003f', '000000');

    this.AddColour('36 neon blue', '0f6ec2', '000000');

    this.AddColour('40 fluorescent orange', 'd44f0d', '000000');

    this.AddColour('42 fluorescent green', '7fdc11', '000000');
    this.AddColour('43 pastel yellow', 'fbe86f', '000000');

    this.AddColour('45 pastel purple', 'a98fb4', '000000');
    this.AddColour('46 pastel blue', 'a1cdff', '000000');
    this.AddColour('47 pastel green', 'b8dba1', '000000');
    this.AddColour('48 pastel pink', 'e89dad', '000000');

    this.AddColour('55 glow white', 'd3f1aa', 'ffffff', '808080');
    this.AddColour('56 glow red', 'eec2cf', 'ff002a');
    this.AddColour('57 glow blue', 'b6f6fb', '05e9fd');
}

Palette.prototype.AddColour = function(name, day, night, outline)
{
    this.cols[this.colours] = new Colour(name, day, night, outline);
    this.colours += 1;
}

Palette.prototype.CanvasColour = function(colvals)
{
    if (colvals.length == 3) {
	return("rgb(" + colvals[0] + "," + colvals[1] +
	       "," + colvals[2] + ")");
    } else {
	return("rgba(" + colvals[0] + "," + colvals[1] +
	       "," + colvals[2] + "," + colvals[3] + ")");
    }
}

Palette.prototype.Colour = function(col, day)
{
    var colvals = this.cols[col];
    if (day) colvals = colvals.day
    else colvals = colvals.night;
    return this.CanvasColour(colvals);
}

Palette.prototype.ColourOutline = function(col, day)
{
    var colvals = this.cols[col];
    colvals = colvals.outline;
    if (colvals == null) return null;
    return this.CanvasColour(colvals);
}

Palette.prototype.ColourNameHTML = function(col)
{
    var colcss = this.Colour(col, true);
    return("<span style=\"background: " + colcss
	   + "; color: " + colcss
	   + "\">__</span> " + this.cols[col].name.replace(/ /g, '&nbsp;'));
}

Palette.prototype.Colours = function()
{
    return this.colours;
}

Palette.prototype.Render = function()
{
    var columns = 2;
    var rows = Math.ceil((this.colours + 1) / columns);
    var palelem = document.getElementById("palette_area");
    var html = "<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\"><tbody>\n";
    for (var col = -1; col < this.colours; ++col) {
	if ((col - 1) % columns == 0) {
	    html += "<tr>";
	}
	html += "<td id=\"palette" + col + "\" class=\"unselected\" onclick=\"setCurrentColour(" + col
		+ ")\">" + this.ColourNameHTML(col)
		+ "</td>\n";
	if ((col) % columns == 0) {
	    html += "</tr>";
	}
    }
    html += "</tbody></table>";
    palelem.innerHTML = html;
}

function Point(board, x, y)
{
    this.board = board;
    this.x = x;
    this.y = y;
    this.col = -1;
}

Point.prototype.Draw = function(ctx, palette)
{
    if (this.col == -1) {
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.board.pegradius / 4,
		0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fillStyle = palette.Colour(this.col, board.day);
	ctx.fill();
    } else {
	var inner_radius = this.board.pegradius / 4 + 0.5;
	var outer_radius = this.board.pegradius - 0.5;

	ctx.beginPath();
	ctx.lineWidth = this.board.pegradius * 3 / 4;
	ctx.arc(this.x, this.y, this.board.pegradius * 5 / 8,
		0, Math.PI * 2, false);
	ctx.closePath();
	ctx.strokeStyle = palette.Colour(this.col, board.day);
	ctx.stroke();

	if (board.day) {
	    // Only do outlines in day mode.
	    var outcol = palette.ColourOutline(this.col, board.day);
	    if (outcol != null) {
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(this.x, this.y, outer_radius, 0, Math.PI * 2, false);
		ctx.moveTo(this.x + inner_radius, this.y);
		ctx.arc(this.x, this.y, inner_radius, 0, Math.PI * 2, false);
		ctx.closePath();

		ctx.strokeStyle = outcol;
		ctx.stroke();
	    }
	}
    }
}

Point.prototype.GetColour = function()
{
    return this.col;
}

Point.prototype.SetColour = function(col)
{
    if (this.col != col) {
	this.board.SetModified(true);
        this.board.ChangeTally(this.col, -1);
        this.board.ChangeTally(col, 1);
	this.col = col;
	var bb = this.GetBB();
	this.board.Draw(bb.minx - 1, bb.miny - 1, bb.maxx + 1, bb.maxy + 1);
    }
}

Point.prototype.GetBB = function()
{
    var pegradius = this.board.pegradius;
    return {
        minx: this.x - pegradius,
	maxx: this.x + pegradius,
	miny: this.y - pegradius,
	maxy: this.y + pegradius
    };
}


is_canvas_area = function(targ) {
    var canvas = document.getElementById("board_area");
    if (targ == canvas) return true;

    return false;
}

function Board()
{
    this.points = [];
    this.moves = {};
    this.movedirs = new Array;
    this.palette = null;
    this.day = true;
    this.modified = false;
    this.pegradius = 8;
    this.tally = [];
    this.frozen = false;
    this.mult = 1;
    document.getElementById("boardcount").value = this.mult;
}

Board.prototype.Freeze = function()
{
    if (!this.frozen) {
	this.frozen = true;
	this.needredraw_left = null;
	this.needredraw_right = null;
	this.needredraw_top = null;
	this.needredraw_bottom = null;
    }
}

Board.prototype.Unfreeze = function()
{
    if (this.frozen) {
	this.frozen = false;
	this.Draw(this.needredraw_left, this.needredraw_top,
		  this.needredraw_right, this.needredraw_bottom);
    }
}

Board.prototype.SetModified = function(modified)
{
    if (modified != this.modified) {
	this.modified = modified;
	var modtag = document.getElementById("modtag");
	if (modified) {
	    modtag.innerHTML = "Modified";
	} else {
	    modtag.innerHTML = "Not Modified";
	}
    }
}

Board.prototype.SetTallyMult = function(mult)
{
    mult = parseInt(mult);
    if (mult <= 0 || mult == NaN) return;
    if (this.mult == mult) return;
    this.mult = mult;
    this.ChangeTally(0, 0);
}

Board.prototype.ChangeTally = function(col, change)
{
    if (col >= 0) {
        var val = this.tally[col];
        if (!val) val = 0;
        this.tally[col] = val + change;
    }
    var tallyhtml = "";
    for (var i in this.tally) {
	var count = this.tally[i];
	if (count != 0) {
	    tallyhtml += '<tr><td class="count">' + (count * this.mult) + '</td><td>x</td><td class="paletteitem"' + this.palette.ColourNameHTML(i) + '</td></tr>\n';
	}
    }
    var tally_elt = document.getElementById("tally");
    tally_elt.innerHTML = "<TBODY>" + tallyhtml + "</TBODY>";
}

Board.prototype.RecalcTally = function()
{
    this.tally= [];
    for (var i = 0; i < this.points.length; ++i) {
        var pt = this.points[i];
        var col = pt.GetColour();
	if (col < 0) continue;
        var val = this.tally[col];
        if (!val) val = 0;
        this.tally[col] = val + 1;
    }
}

// SetBB sets maxx and maxy to be the maximum x and y values required to
// display the board, and adjusts all the points (if neccessary) such that the
// minimum x and y values required are 0.
Board.prototype.SetBB = function()
{
    var padding = 3;
    if (this.points.length == 0) {
	this.maxx = 0;
	this.maxy = 0;
	return;
    }
    var pt = this.points[0];
    var bb = pt.GetBB();
    for (var i = 1; i < this.points.length; ++i)
    {
	pt = this.points[i];
	var bb2 = pt.GetBB();
	if (bb2.minx < bb.minx) bb.minx = bb2.minx;
	if (bb2.maxx > bb.maxx) bb.maxx = bb2.maxx;
	if (bb2.miny < bb.miny) bb.miny = bb2.miny;
	if (bb2.maxy > bb.maxy) bb.maxy = bb2.maxy;
    }
    bb.minx -= padding;
    bb.miny -= padding;
    bb.maxx += padding - bb.minx;
    bb.maxy += padding - bb.miny;
    for (var i = 0; i < this.points.length; ++i)
    {
	pt = this.points[i];
	pt.x -= bb.minx;
	pt.y -= bb.miny;
    }
    this.maxx = bb.maxx;
    this.maxy = bb.maxy;

    setupCanvas();
}

Board.prototype.Clear = function()
{
    this.points = new Array;
    this.moves = {};
    this.movedirs = new Array;
}

Board.prototype.AddMoveDir = function(dir, dx, dy)
{
    this.movedirs.push([dir, dx, dy]);
}

Board.prototype.CalcMoves = function()
{
    for (var i = 0; i < this.movedirs.length; ++i) {
        this.CalcMoveDir(this.movedirs[i][0],
			this.movedirs[i][1], this.movedirs[i][2]);
    }
}

Board.prototype.CalcMoveDir = function(dir, dx, dy)
{
    var moves = new Array;
    for (var i = 0; i < this.points.length; ++i) {
        var point = this.points[i];
	var tmppos = {x: point.x + dx, y: point.y + dy};
        var num = this.GetPegNumAt(tmppos, true);
        if (num != null) {
            moves[i] = num;
        }
    }
    this.moves[dir] = moves;
}

Board.prototype.GetPegsInRegion = function(left, top, right, bottom)
{
    left = Math.floor(left / this.gridspace);
    right = Math.floor(right / this.gridspace);
    if (left > right) {
	var tmp = left;
	left = right;
	right = tmp;
    }

    top = Math.floor(top / this.gridspace);
    bottom = Math.floor(bottom / this.gridspace);
    if (top > bottom) {
	var tmp = top;
	top = bottom;
	bottom = tmp;
    }

    result = {}
    for (var x = left; x <= right; ++x)
        for (var y = top; y <= bottom; ++y) {
            if (!this.grid[x]) continue;
            var pegs = this.grid[x][y];
            if (!pegs) continue;
            for (var peg in pegs) {
                result[pegs[peg]] = true;
            }
        }
    var pegs = []
    for (var peg in result) {
        pegs.push(peg);
    }
    pegs.sort();
    return pegs;
}

Board.prototype.CalcGrid = function()
{
    this.gridspace = this.pegradius * 2;
    this.grid = []
    for (var i = 0; i < this.points.length; ++i) {
        var pt = this.points[i];
	var bb = pt.GetBB();
        var left = Math.floor(bb.minx / this.gridspace);
        var right = Math.floor(bb.maxx / this.gridspace);
        var top = Math.floor(bb.miny / this.gridspace);
        var bottom = Math.floor(bb.maxy / this.gridspace);
        for (var x = left; x <= right; ++x) {
            if (!this.grid[x]) {
                this.grid[x] = [];
            }
            for (var y = top; y <= bottom; ++y) {
                if (!this.grid[x][y]) {
                    this.grid[x][y] = [i];
                } else {
                    this.grid[x][y].push(i);
                }
            }
        }
    }

    return;
}

Board.prototype.AddPeg = function(x, y)
{
    this.points[this.points.length] = new Point(this, x, y);
}

// Set the board to use a rectangular layout, with specified width and height
// (in number of pieces).
Board.prototype.SetRectLayout = function(wid, hgt)
{
    for (var y = 0; y < hgt; ++y)
        for (var x = 0; x < wid; ++x)
	{
	    var num = this.points.length;
	    this.AddPeg(x * this.pegradius * 2 + this.pegradius,
                        y * this.pegradius * 2 + this.pegradius);
	}

    this.AddMoveDir('up', 0, 2 * this.pegradius);
    this.AddMoveDir('down', 0, -2 * this.pegradius);
    this.AddMoveDir('left', 2 * this.pegradius, 0);
    this.AddMoveDir('right', -2 * this.pegradius, 0);
}

Board.prototype.LayoutAddTriangle = function(ox, oy, size, up)
{
    var right = size * this.pegradius * 2;
    var vspace = this.pegradius * Math.sqrt(3);
    for (var y = 0; y < size; ++y) {
	var rowlen = y + 1;
	if (!up) rowlen = size - y;
	var row_ox = ox + (size - rowlen) * this.pegradius;
	for (var x = 0; x < rowlen; ++x)
	{
	    this.AddPeg(row_ox + x * this.pegradius * 2,
			oy + y * vspace);
	}
    }
}

// Set the board to use a star layout, with specified width and height
// (in number of pieces).
Board.prototype.SetStarLayout = function(wid)
{
    var size = Math.ceil((wid - 1) / 4) * 4 + 1;
    var vspace = this.pegradius * Math.sqrt(3);
    var bigtrilen = ((size - 1) * 3 / 4) + 1;
    var smalltrilen = ((size - 1) / 4);
    this.LayoutAddTriangle(0, 0, bigtrilen, true);
    this.LayoutAddTriangle((bigtrilen - smalltrilen) * this.pegradius,
			   bigtrilen * vspace,
			   smalltrilen, false);
    this.LayoutAddTriangle(0,
			   smalltrilen * vspace,
			   smalltrilen, false);
    this.LayoutAddTriangle((bigtrilen - smalltrilen) * 2 * this.pegradius,
			   smalltrilen * vspace,
			   smalltrilen, false);

    this.AddMoveDir('upleft', this.pegradius, vspace);
    this.AddMoveDir('upright', -this.pegradius, vspace);
    this.AddMoveDir('downleft', this.pegradius, -vspace);
    this.AddMoveDir('downright', -this.pegradius, -vspace);
    this.AddMoveDir('left', 2 * this.pegradius, 0);
    this.AddMoveDir('right', -2 * this.pegradius, 0);
}

Board.prototype.SetHexagonLayout = function(wid)
{
    var vspace = this.pegradius * Math.sqrt(3);
    var size = Math.ceil((wid + 1) / 2);
    for (var y = 0; y < wid; ++y) {
    	if (y > wid / 2) {
	    var rowlen = wid * 3 / 2 - 1 - y;
	} else {
	    var rowlen = wid / 2 + y;
	}
	var row_ox = (size - rowlen) * this.pegradius;
	for (var x = 0; x < rowlen; ++x) {
	    this.AddPeg(row_ox + (x * 2 + 1) * this.pegradius,
			vspace * y);
	
	}
    }

    this.AddMoveDir('upleft', this.pegradius, vspace);
    this.AddMoveDir('upright', -this.pegradius, vspace);
    this.AddMoveDir('downleft', this.pegradius, -vspace);
    this.AddMoveDir('downright', -this.pegradius, -vspace);
    this.AddMoveDir('left', 2 * this.pegradius, 0);
    this.AddMoveDir('right', -2 * this.pegradius, 0);
}

Board.prototype.SetCircleLayout = function(wid)
{
    var radius = Math.ceil((wid - 1) / 2) + 1;
    var cx = (radius * 2 - 1) * this.pegradius;
    var cy = cx;
    this.AddPeg(cx, cy);
    for (var r = 1; r < radius; ++r) {
	var dist = this.pegradius * 2 * r;
    	var pegs = r * 6;
	var sep = Math.PI * 2 / pegs;
	for (var peg = 0; peg < pegs; ++peg) {
	    var angle = peg * sep;
	    this.AddPeg(cx + dist * Math.cos(angle),
			cy + dist * Math.sin(angle));
	}
    }
}

Board.prototype.SetHeartLayout = function(radius, extension)
{
    // Radius must be >= 3, and also odd.
    if (radius < 3) radius = 3;
    radius = Math.ceil((radius + 1) / 2) * 2 - 1;
    // Extension must be > 0, and <= radius;
    if (extension <= 0) extension = 1;
    if (extension > radius) extension = radius;
    var space = this.pegradius * Math.sqrt(2);
    var hgt = radius * 2 - 1 + extension;
    for (var i = 0; i < hgt; ++i) {
	if (i < extension) {
	    var left_ox = (radius - i - 1) * space;
	    var right_ox = (radius + extension * 2 - i - 1) * space;
	    for (var x = 0; x <= i; ++x) {
		this.AddPeg(left_ox + space * (x * 2 + 1), 
			    space * i
			   );
		this.AddPeg(right_ox + space * (x * 2 + 1), 
			    space * i
			   );
	    }
	} else {
	    if (i < radius) {
		var rowlen = i + extension + 1;
	    } else {
		var rowlen = radius * 2 + extension - i - 1;
	    }
	    var row_ox = (radius + extension - rowlen) * space;
	    for (var x = 0; x < rowlen; ++x) {
		this.AddPeg(row_ox + space * (x * 2 + 1), 
			    space * i);
	    }
	}
    }

    // Find the row with the centre of the semicircle.
    var cy = space * ((radius - 1) / 2 - 1);
    var cx_left = space * (Math.floor(radius / 2));
    var cx_right = space * (i + extension + 1 - Math.floor(radius / 2));
    var rowlen = i + extension + 1;
    this.AddPeg(cx_left, cy);
    this.AddPeg(cx_right, cy);

    for (var r = 1; r < Math.ceil(radius / 2); ++r) {
	var dist = this.pegradius * 2 * r;
    	var pegs = r * 3;
	var sep = Math.PI / pegs;
	for (var peg = 0; peg <= pegs; ++peg) {
	    var angle = peg * sep + Math.PI * 3 / 4;
	    this.AddPeg(cx_left + dist * Math.cos(angle),
			cy + dist * Math.sin(angle));
	    this.AddPeg(cx_right + dist * Math.cos(angle + Math.PI / 2),
			cy + dist * Math.sin(angle + Math.PI / 2));
	}
    }
}

Board.prototype.SetLayout = function(layout, wid, hgt)
{
    this.Clear();
    if (layout == 'Rect') {
	this.SetRectLayout(wid, hgt);
    } else if (layout == 'Star') {
	this.SetStarLayout(wid);
    } else if (layout == 'Hexagon') {
	this.SetHexagonLayout(wid);
    } else if (layout == 'Circle') {
	this.SetCircleLayout(wid);
    } else if (layout == 'Heart') {
	this.SetHeartLayout(wid, hgt);
    } else {
	this.SetRectLayout(wid, hgt);
    }
    this.SetBB();
    this.CalcGrid();

    this.CalcMoves()
}

Board.prototype.SetPalette = function(palette)
{
    this.palette = palette;
}

Board.prototype.SetToolbox = function(toolbox)
{
    this.toolbox = toolbox;
    toolbox.SetBoard(this);
}

Board.prototype.DoAction = function(action)
{
    var newcols = new Array;
    var actionmoves = this.moves[action];
    if (actionmoves == null) {
    	alert("Can't do move " + action + " on this layout");
	return;
    }

    for (var i = 0; i < this.points.length; ++i) {
        var oldloc = actionmoves[i];
	if (oldloc != undefined) {
	    var oldpoint = this.points[oldloc];
	    if (oldpoint != undefined) {
		newcols[i] = oldpoint.col;
	    }
	} else {
	    newcols[i] = -1;
	}
    }
    for (var i = 0; i < this.points.length; ++i) {
    	var newcol = newcols[i];
	if (newcol != undefined) {
	    this.points[i].col = newcol;
	}
    }

    this.RecalcTally();
    this.ChangeTally(0, 0);
    this.DrawAll();
}

Board.prototype.Draw = function(left, top, right, bottom)
{
    if (this.frozen) {
	if (this.needredraw_left == null || left < this.needredraw_left)
	    this.needredraw_left = left;
	if (this.needredraw_top == null || top < this.needredraw_top)
	    this.needredraw_top = top;
	if (this.needredraw_right == null || right > this.needredraw_right)
	    this.needredraw_right = right;
	if (this.needredraw_bottom == null || bottom > this.needredraw_bottom)
	    this.needredraw_bottom = bottom;
    } else {
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.rect(left, top, right - left, bottom - top);
	this.ctx.clip();

	this.ctx.beginPath();
	this.ctx.fillStyle = this.palette.Colour(null, board.day);
	this.ctx.fillRect(left, top, right - left, bottom - top);
	var candidates = this.GetPegsInRegion(left, top, right, bottom);
	for (var i in candidates)
	{
	    this.points[candidates[i]].Draw(this.ctx, this.palette);
	}
	this.ctx.restore();
    }
}

Board.prototype.DrawAll = function(ctx)
{
    this.Draw(0, 0, this.maxx, this.maxy);
}

// Get the peg at a location.
// If "precise" is false, allows some fuzziness in the position.
Board.prototype.GetPegNumAt = function(pos, precise)
{
    var mindist = null;
    var closestpeg = null;
    var candidates = this.GetPegsInRegion(pos.x, pos.y, pos.x, pos.y);
    for (var i in candidates)
    {
        var pegnum = candidates[i];
        var pt = this.points[pegnum];
	var d = dist(pt, pos);
	if (mindist == null || mindist > d) {
	    mindist = d;
	    closestpeg = pegnum;
	}
    }
    if (precise) {
	var maxdist = this.pegradius;
    } else {
	var maxdist = this.pegradius * 2;
    }
    if (mindist > maxdist) {
	return null;
    } else {
	return closestpeg;
    }
}

// Get the peg at a location.
// If "precise" is false, allows some fuzziness in the position.
Board.prototype.GetPegAt = function(pos, precise)
{
    closestpeg = this.GetPegNumAt(pos, precise);
    if (closestpeg != null) {
        closestpeg = this.points[closestpeg];
    }
    return closestpeg;
}

Board.prototype.SetDark = function(dark)
{
    var changed = false;
    if (dark) {
    	if (this.day != false) changed = true;
	this.day = false;
    } else {
    	if (this.day != true) changed = true;
	this.day = true;
    }
    if (changed) this.DrawAll();
}

Board.prototype.TakeCopy = function(canvas)
{
    this.boardimg = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
}

Board.prototype.DropCopy = function()
{
    this.boardimg = null;
}

Board.prototype.DrawRect = function(pos1, pos2)
{
    var candidates = this.GetPegsInRegion(pos1.x, pos1.y, pos2.x, pos2.y);
    this.Freeze();
    var bb = {
        minx: pos1.x,
        miny: pos1.y,
        maxx: pos2.x,
        maxy: pos2.y
    }
    if (bb.minx > bb.maxx) {
	var tmp = bb.minx;
	bb.minx = bb.maxx;
	bb.maxx = tmp;
    }
    if (bb.miny > bb.maxy) {
	var tmp = bb.miny;
	bb.miny = bb.maxy;
	bb.maxy = tmp;
    }
    for (var i in candidates)
    {
        var pegnum = candidates[i];
        var peg = this.points[pegnum];
	var pegbb = peg.GetBB();
	if (pegbb.maxx < bb.minx ||
	    pegbb.maxy < bb.miny ||
	    pegbb.minx > bb.maxx ||
	    pegbb.miny > bb.maxy) continue;

	peg.SetColour(current_colour);
    }
    this.Unfreeze();
}

Board.prototype.DrawCircle = function(pos1, pos2)
{
    var radius = dist(pos1, pos2);
    var bb = {
        minx: pos1.x - radius,
        miny: pos1.y - radius,
        maxx: pos1.x + radius,
        maxy: pos1.y + radius
    }

    var candidates = this.GetPegsInRegion(bb.minx, bb.miny, bb.maxx, bb.maxy);
    this.Freeze();
    for (var i in candidates)
    {
        var pegnum = candidates[i];
        var peg = this.points[pegnum];
	if (dist(pos1, peg) < radius + this.pegradius) {
	    peg.SetColour(current_colour);
	}
    }
    this.Unfreeze();
}

Board.prototype.OnMouseUp = function(info)
{
    if (!is_canvas_area(info.targ)) return true;

    switch (this.toolbox.toolstate) {
	case 1:
	    // No drag - find the closest peg, and toggle it.
	    var peg = board.GetPegAt(info.pos, false);
	    if (peg != null) {
		var colour = peg.GetColour();
		if (current_colour == colour) {
		    peg.SetColour(-1);
		} else {
		    peg.SetColour(current_colour);
		}
	    }
	    break;
	case 2:
	    if (this.toolbox.tool == 'rectangle') {
		this.ctx.putImageData(this.boardimg, 0, 0);
		this.DropCopy();
		this.DrawRect(this.toolbox.mousedownpos, info.pos);
	    }
	    if (this.toolbox.tool == 'circle') {
		this.ctx.putImageData(this.boardimg, 0, 0);
		this.DropCopy();
		this.DrawCircle(this.toolbox.mousedownpos, info.pos);
	    }
	    break;
    }

    this.toolbox.toolstate = 0;
}

Board.prototype.OnMouseDown = function(info)
{
    if (!is_canvas_area(info.targ)) return true;

    this.toolbox.toolstate = 1;
    this.toolbox.mousedownpos = info.pos;

    return false;
}

Board.prototype.OnMouseOut = function(info)
{
    if (!is_canvas_area(info.targ)) return true;

    if (this.toolbox.toolstate == 2) {
	if (this.toolbox.tool == 'drawing') {
	    this.toolbox.toolstate = 0;
	}
	if (this.toolbox.tool == 'rectangle') {
	    this.ctx.putImageData(this.boardimg, 0, 0);
	    this.DropCopy();
	    this.toolbox.toolstate = 0;
	}
	if (this.toolbox.tool == 'circle') {
	    this.ctx.putImageData(this.boardimg, 0, 0);
	    this.DropCopy();
	    this.toolbox.toolstate = 0;
	}
    }

    return false;
}

Board.prototype.OnMouseMove = function(info)
{
    if (!is_canvas_area(info.targ)) return true;
    var canvas = document.getElementById("board_area");

    if (this.toolbox.toolstate == 1) {
        if (dist(info.pos, this.toolbox.mousedownpos) > dragdist) {
	    this.toolbox.toolstate = 2; 
	    if (this.toolbox.tool == 'rectangle') {
		this.TakeCopy(canvas);
	    }
	    if (this.toolbox.tool == 'circle') {
		this.TakeCopy(canvas);
	    }
	}
    }

    if (this.toolbox.toolstate == 2) {
	if (this.toolbox.tool == 'drawing') {
	    var oldpos = this.toolbox.mousedownpos;
	    var peg;

	    var len = dist(oldpos, info.pos);
	    if (len > this.pegradius / 2) {
		var dx = (info.pos.x - oldpos.x) / len;
		var dy = (info.pos.y - oldpos.y) / len;

		for (var i = this.pegradius / 2; i < len;
		     i += this.pegradius / 2) {
		     var tmppos = {x: oldpos.x + dx * i, y: oldpos.y + dy * i};

		     peg = board.GetPegAt(tmppos, false);
		     if (peg != null) peg.SetColour(current_colour);
		}
	    }

	    peg = board.GetPegAt(oldpos, true);
	    if (peg != null) peg.SetColour(current_colour);

	    peg = board.GetPegAt(info.pos, true);
	    if (peg != null) peg.SetColour(current_colour);

	    this.toolbox.mousedownpos = info.pos;
	}

	if (this.toolbox.tool == 'rectangle') {
	    var startpos = this.toolbox.mousedownpos;
	    this.ctx.save();
	    this.ctx.rect(startpos.x, startpos.y,
			  info.pos.x - startpos.x, info.pos.y - startpos.y);
	    this.ctx.clip();

	    this.ctx.putImageData(this.boardimg, 0, 0,
				  startpos.x, startpos.y,
				  info.pos.x - startpos.x, info.pos.y - startpos.y);
	    this.ctx.fillStyle = this.palette.Colour(-2, board.day);
	    this.ctx.fillRect(startpos.x, startpos.y,
			  info.pos.x - startpos.x, info.pos.y - startpos.y);
	    this.ctx.restore();
	}

	if (this.toolbox.tool == 'circle') {
	    var startpos = this.toolbox.mousedownpos;
	    var peg = board.GetPegAt(startpos, false);
	    if (peg == null) {
		peg = board.GetPegAt(info.pos, false);
	    }
	    if (peg == null) {
		this.toolbox.toolstate = 1;
	    } else {
		this.toolbox.mousedownpos = {x: peg.x, y: peg.y};

		var radius = dist(startpos, info.pos);
		var bb = {
			  minx: startpos.x - radius,
			  maxx: startpos.x + radius,
			  miny: startpos.y - radius,
			  maxy: startpos.y + radius
		}

		this.ctx.save();
		this.ctx.putImageData(this.boardimg, 0, 0,
				      bb.minx, bb.miny,
				      bb.maxx - bb.minx, bb.maxy - bb.miny);
		this.ctx.fillStyle = this.palette.Colour(-2, board.day);

		this.ctx.beginPath();
		this.ctx.arc(startpos.x, startpos.y, radius, 0, Math.PI * 2, false);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	    }
	}
    }

    return false;
}


// Calculate the offset of an element in pixels from top left of the screen.
function calcOffset(element)
{
    result = {x: 0, y: 0};
    calcOffsetRecurse(element, result);
    result.x += element.clientLeft;
    result.y += element.clientTop;
    return result;
}

// Recursive implementation of calcOffset
function calcOffsetRecurse(element, result)
{
    if (!element) return;
    calcOffsetRecurse(element.offsetParent, result);
    result.x += element.offsetLeft;
    result.y += element.offsetTop;
}

function setupCanvas()
{
    var canvas = document.getElementById("board_area");
    if (canvas.getContext) {
        board.ctx = canvas.getContext("2d");
    }

    if (canvas.width != board.maxx) {
        canvas.width = Math.ceil(board.maxx);
    }
    if (canvas.height != board.maxy) {
        canvas.height = Math.ceil(board.maxy);
    }

    canvas.onmousedown = function(e) { return board.OnMouseDown(getEventInfo(e)); }
    canvas.onmouseup = function(e) { return board.OnMouseUp(getEventInfo(e)); }
    canvas.onmousemove = function(e) { return board.OnMouseMove(getEventInfo(e)); }
    canvas.onmouseout = function(e) { return board.OnMouseOut(getEventInfo(e)); }
}

// Get the (square) of the distance from a to b.
function dist(a, b)
{
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function darktoggleOnClick(e)
{
    var info = getEventInfo(e);
    var darktoggle = document.getElementById("darktoggle");
    if (info.targ != darktoggle) return true;

    board.SetDark(darktoggle.checked);
    return true;
}

function setCurrentColour(col)
{
    if (current_colour != col) {
	var oldcolelt = document.getElementById("palette" + current_colour);
	oldcolelt.className = "unselected";
	current_colour = col;
	var currcolelt = document.getElementById("palette" + col);
	currcolelt.className = "selected";

	var currcolelt = document.getElementById("currcolelt");
	currcolelt.innerHTML = palette.ColourNameHTML(col);
    }
}

// Print the board - FIXME not currently used
function print()
{
    board.RecalcTally();
}

function parse_querystring()
{
    var query_string = document.URL.indexOf('?');
    if (query_string == -1) return {};
    query_string = document.URL.substr(query_string);
    var res = {}
    var pos = 0;
    while(pos != -1) {
	var oldpos = pos + 1;
        pos = query_string.indexOf('&', oldpos);
	if (pos == -1) {
	    var item = query_string.substr(oldpos);
	} else {
	    var item = query_string.substr(oldpos, pos - oldpos);
	}
	var eqpos = item.indexOf('=');
	if (eqpos == -1) continue;
	var key = item.substr(0, eqpos);
	var val = item.substr(eqpos + 1);
	res[key] = val;
    }

    return res;
}

function Toolbox()
{
    this.board = null;

    this.tool = null;
    this.tools = ['drawing', 'rectangle', 'circle'];
    for (var tool in this.tools) {
	tool = this.tools[tool];
	var toolelt = document.getElementById("tool_" + tool);
	toolelt.onclick = function(e) { toolbox.OnClick(getEventInfo(e)); }
    }
    this.toolstate = 0;

    this.actions = ['up', 'down', 'left', 'right', 'upleft', 'upright', 'downleft', 'downright'];
}

Toolbox.prototype.SetMoveActions = function(board)
{
    for (var action in this.actions) {
	action = this.actions[action];
	var actionelt = document.getElementById("action_" + action);
        if (board.moves[action] == null) { 
        } else {
            actionelt.style.display = "inline";
	    actionelt.onclick = function(e) { toolbox.OnAction(getEventInfo(e)); }
	}
    }
}

Toolbox.prototype.OnClick = function(info)
{
    var newtool = info.targ.id.substr(5);
    this.SetTool(newtool);
}

Toolbox.prototype.OnAction = function(info)
{
    var newaction = info.targ.id.substr(7);
    this.board.DoAction(newaction);
}

Toolbox.prototype.SetBoard = function(board)
{
    this.board = board;
}

Toolbox.prototype.SetTool = function(tool)
{
    if (this.tool == tool) return;
    if (this.tool != null) {
	var toolelt = document.getElementById("tool_" + this.tool);
	toolelt.src = "static/" + this.tool + "tool.jpg";
    }
    this.tool = tool;
    if (this.tool != null) {
	var toolelt = document.getElementById("tool_" + this.tool);
	toolelt.src = "static/" + this.tool + "toolselected.jpg";
    }
}

function init()
{
    board = new Board;

    palette = new Palette;
    palette.Render();
    current_colour = -1;
    board.SetPalette(palette);

    toolbox = new Toolbox;
    toolbox.SetTool('drawing');
    board.SetToolbox(toolbox);

    var qs = parse_querystring();

    var layout = qs.layout;
    if (qs.wid == null) {
	var wid = 29;
    } else {
	var wid = parseInt(qs.wid, 10);
    }

    if (qs.hgt == null) {
	var hgt = 29;
    } else {
	var hgt = parseInt(qs.hgt, 10);
    }

    board.SetLayout(layout, wid, hgt);
    board.DrawAll();

    toolbox.SetMoveActions(board);

    setCurrentColour(0);

    var darktoggle = document.getElementById("darktoggle");
    darktoggle.onclick = darktoggleOnClick;
    board.SetDark(darktoggle.checked);

    window.onbeforeunload = closereq;
}

function closereq(e)
{
    if (!e) var e = window.event;
    if (board) {
	if (board.modified) {
            var msg = "You have unsaved changes.";
	    if (e) {
		e.returnValue = msg;
	    }
	    return msg;
	}
    }
}

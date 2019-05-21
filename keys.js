var focused = 1; // default to first tile
var cached = pages["Home"]; // last visited page
var tileCount = 12;
var skipCount = 4;
var disabledTiles = 0;

var pageHistory = [];
var pagePresent = undefined;
var pageFuture = [];

/*
  *************************************************
  Page load functions (in order)
  - generate the tiles
  - pull theme cookie and apply theme
  - log current theme
  - call themes_dropdown() on all lib.themes to generate dropdown menu based on theme names
  - generate index.html page with pages["Home"]
  - focus first tile
  *************************************************
*/
window.onload = function(){
  for(var i=1; i<=tileCount; i++) {
    document.getElementById('grid').appendChild(tile_gen(i));
  }

  reset_tile_count();
  update_tiles(); // in lib.js
  update_skip_count();

  var tmp = decodeURIComponent(document.cookie).split(';'); /* Loads cookie w/ window and splits list of cookies */
  pages["Back"] = pages["Home"] // default to home
  tmp = tmp[0].split("=")[1]; // splits key/value pair
  set_theme(tmp); // sets theme from cookie data
  console.log("\"" + tmp + "\" theme loaded on page load");
  page_gen(1);  // defaults to pages["Home"]
  // TODO : fix search bar stealing focus
};

window.onresize = function() {
  update_skip_count();
};

/*
  *************************************************
  Tile Generator
  - Constructs DOM element for the tile
  *************************************************
*/

function tile_gen(index) {
  // var img = document.createElement("img");
  // img.setAttribute("src", "");
  // img.setAttribute("id", "i" + index);

  var icon = document.createElement('i');
  icon.setAttribute("id", "i" + index);
  icon.setAttribute("class", "fa fa-3x");

  // var btn = document.createElement("div");
  // btn.setAttribute("class", "button");
  // btn.appendChild(icon);

  var h3 = document.createElement("h3");
  h3.setAttribute("id", "t" + index);

  var p = document.createElement("p");
  p.setAttribute("id", "s" + index);

  var anchor = document.createElement("a");
  anchor.setAttribute("href", "#");
  anchor.setAttribute("class", "lBox");
  anchor.setAttribute("id", index);
  anchor.appendChild(icon);
  anchor.appendChild(h3);
  anchor.appendChild(p);

  var tile = document.createElement("div");
  tile.setAttribute("class", "tile");
  tile.appendChild(anchor);

  return tile;
}

/*
  *************************************************
  Page Gen
  - Creates new div#grid based off of a given page

  Notes
  - page : Array[12] of tiles
  - tiles : Array[4] : [URL,ICN,TITLE,SUBTITLE,OPT] (see lib.js)
  - '#...' in tile[0] denotes a page with name '...'
  *************************************************
*/
function set_tile(num, array) {
  n = num.toString();
  document.getElementById(num).href = array[0];
  document.getElementById("i"+n).className = "fa fa-3x fa-" + array[1];
  document.getElementById("t"+n).innerHTML = array[2];
  document.getElementById("s"+n).innerHTML = array[3];

  if (array[2] == "") {
    document.getElementById(num).classList.add("disabled");
    disabledTiles += 1;
  }
  else {
    document.getElementById(num).classList.remove("disabled");
  }
};

function page_gen(id, page, save_to_history = true) { // id for focus element
  reset_tile_count();

  if (page == undefined) { // page_gen() -> defaults to pages["Home"]
    page = pages["Home"];
  }

  // save current page into history before generating new page
  if (pagePresent != undefined && save_to_history) {
    pageHistory.push(pagePresent);
  }
  pagePresent = page;

  if (page != pages["Home"]) {
    // Add a 'back to home' tile
    page = [["<","chevron-left","Back","To the Future","*"]].concat(page);
  }

  cached = page;
  if (page.length > 12) {
    var currentPage = page.slice(0,11);
    currentPage["11"] = [">","chevron-right","Next", " more results","*"];
    pageFuture = page.slice(11, page.length);
    page = currentPage;
  }
  else {
    pageFuture = [];
  }

  try {
    for (var num =1; num<=tileCount; num++) {
        tile = page[num-1];

        if (tile == undefined) { // less than 12 tiles
          tile = blank_tile(); // placeholder blank tile
        }
        else {
          tile = reference(tile); // see reference() below
        }

        n = num.toString();
        url = tile[0];

        if (url == "@w"){ // weather function tile
          update_weather(num);
        }
        else if (url == "@d"){
          dict_tile(num,document.getElementById("search").value.replace(term,"").replace(" ",""));
        }
        else {
          if (url[0] == "#") { // checks for folder urls
            tile[0] = "javascript:page_gen(2,pages[\""+tile[2]+"\"])"; // Opens folder and sets cursor to 2
          }
          else if (url[0] == "$") { // if theme
            tile[0] = "javascript:set_theme(\""+tile[2]+"\",2);";
          }
          else if (url[0] == "<") { // if back button
            tile[0] = "javascript:page_gen(1, pageHistory.pop(), false);";
          }
          else if (url[0] == ">") { // if back button
            tile[0] = "javascript:page_gen(1, pageFuture);";
          }
          else { // for normal url redirects
            tile[0] = url.replace("VAR",encodeURIComponent(document.getElementById("search").value.replace(term,""))); // searches only with correct symbols
          }
          tile[3] = tile[3].replace("VAR",document.getElementById("search").value).replace(term,"");
          set_tile(num, tile);
        };
      };
  } catch (err) {
    console.log("\"" + err + "\" error logged in page_gen of " + tile);
  };
  if (id != "none") {
    document.getElementById(id).focus();
    focused=id;
    result=id;
  };

  tileCount = tileCount - disabledTiles; // Every page has a separate number of tiles
};
/*
  *************************************************
  Reference
  - if a tile == ["~...."] -> check pages["~"] for the full tile
  - if a tile == ["@..."] -> check pages["~"] for function tile
  - else return the original tile
  *************************************************
*/
function reference(tile) {
  if (tile[0][0] == "~" || tile[0][0] == "@") {
    local = Array.from(pages["~"]);
    for (var x=0; x< local.length; x++) {
      if (local[x][2] == tile[0].replace("~","") || local[x][0] == tile[0]) { // If title or url == reference
        return local[x];
      };
    };
  };
  return tile;
};
/*
  *************************************************
  Search Functions
  - rank(string,string) -> finds number of matching charactors between two normalized strings (ignores theme hex data)
  - search_live(string) -> finds best 11 pages for a given search term
  - pages_to_list() -> converts "pages" (in lib.js) from Dict(key:Array[tile]) to Array[tile] (allows for quicker search and optimal algorithms)

  Notes
  - normalized : no spaces and all lower case
  *************************************************
*/
function rank(attempt, known) {
  if (attempt == undefined || known == undefined || Array.isArray(attempt)) {
    return 0;
  };
  attempt = attempt.replace(" ","").toLowerCase(); // converts strings to universal form
  known = known.replace(" ","").toLowerCase();
  var a = 0;
  for (var i = 0; i < Math.min(attempt.length,known.length); i++) {
      if (attempt[i] == known[i]){
        a++; // # of matches
      };
  };
  return a;
};

function search_live(curr) {
  var final = [];
  var page = Array.from(pages_to_list());
  for (var j = 0; j< page.length; j++){
    tile = Array.from(page[j]); // make sure array is values not references (important for live tiles)
    if (tile[0] == "@w" && /^\d{5}(-\d{4})?$/.test(document.getElementById("search").value)) {
      // https://stackoverflow.com/questions/160550/zip-code-us-postal-code-validation
      zip = document.getElementById("search").value;
      final.push({'match': tile,"rank":100}); // puts weather tile first
      break; // only tile
    }
    else if (tile[4] == term && curr.includes(term)) { // if term -> only show external search tiles
      final.push({'match': tile,"rank":10});
    }
    else if (tile[4] != "*" && !curr.includes(term) && tile[4] != term) { // "*" -> Hidden from search term -> ignore search tiles outside of search mode
      value = Math.max(rank(tile[2],curr),rank(tile[4],curr)); // max ranking of name and tag
      if (value > 1.5) {
        if (tile[0].includes("VAR")) {
          tile[3] = tile[3];
        } else if (tile[0][0] == "#") { // "#" -> Folder url
          tile[3] = "Folder (" + String(value) + ")"; // changes subtitle to type of page and rank
        } else if (tile[0][0] == "$") {
          tile[3] = "Theme (" + String(value) + ")"; // changes subtitle to type of page and rank
        } else if (tile[0][0] != "@"){ // don't change function tile descriptions
          tile[3] = "Tile (" + String(value) + ")";
        };
        final.push({'match': tile,"rank":value});
      };
    };
  };
  final = final.sort(function(a, b) {   // Sorting of all results (tiles, folders and livetiles)
    return ((a.rank > b.rank) ? -1 : ((a.rank == b.rank) ? 0 : 1));});
  var ranking = [];
  for (var k = 0; k < Math.min(final.length,20); k++) { // add all matches in ranked order (max of two pages)
    ranking[k] = final[k].match;
  };
  ranking[k] = ["https://www.google.com/search?q=" + curr.replace(term,""),"google","Google","\""+ curr.replace(term,"") +"\"","*"]; // always add google tile last regardless of search mode
  page_gen("none",Array.from(ranking));
  return ranking;
};

function pages_to_list() {
  list = [];
  for (key in pages) {
    if (key != "Back" && key != "Next") { // ignores these search keys
      page = Array.from(pages[key]);
      for (var i = 0; i< page.length; i++){
        if (page[i].length >= 4) { // ignores "~" tiles
          list.push(page[i]);
        };
      };
    };
  };
  return list;
};
/*
  *************************************************
  Themeing
    - setCookie(theme) -> saves current theme to cookie
    - set_theme(name) -> styles the page with a theme array

  Notes
    - set cookie overwrites previous theme cookie : do not change expiration
    - set_theme(name) : searches themes var in lib.js for a theme of matching name
  *************************************************
*/
function set_cookie(theme) {
  document.cookie = "theme=" + theme + "; expires=Thu, 18 Dec 2021 12:00:00 UTC"; // saves the cookie
  console.log("\"" + theme + "\" theme saved to cookie");
};

function set_theme(name) { // 4
  themes = pages["Themes"];
  for(var i = 0;i < themes.length;i++){
    if (themes[i][2] == name) {
      x = themes[i][4];
      if (x[0][0] != "#"){ // background image condition
        document.body.style.backgroundImage = "url("+ x[0] +")";
        document.documentElement.style.setProperty('--background', "#ccccc");
      } else {
        document.body.style.backgroundImage = "none";
        document.documentElement.style.setProperty('--background', x[0]);
      };
      document.documentElement.style.setProperty('--hover-bg', x[1]);
      document.documentElement.style.setProperty('--base-txt', x[2]);
      document.documentElement.style.setProperty('--sub-txt', x[3]);
      set_cookie(name);
      return 0;
    };
  }
  console.log("\"" + name + "\" theme not loaded from lib.js")
  return 1;
};
/*
  *************************************************
  Key up
    - if live search is enabled it searches given the value after each key up

  Key down
    - 1-12 navigation keys for default binding (11 is -) (12 is =)
    - 1-12 theme menu for selecting themes from dropdown
    - left,right,up,down (hjkl) for navigation
    - enter for searching and clicking on links
    - esc for leaving search live and returning to homepage

  *************************************************
*/
window.onclick = function(e){
	if ( document.activeElement.id != "search" ) {
		document.getElementById(focused).focus();
	};
};
document.onkeyup = function(e){
  if ( document.activeElement.id == "search") {
    if (e.keyCode != 13 && e.keyCode != 27){
      current = document.getElementById("search").value;
      search_live(current);
    };
  };
};
document.onkeydown = function(e) {
	var key = e.keyCode;
  var result = null;

	if ( document.activeElement.id == "search") {
		if (key == 27) { // esc
      document.getElementById("search").value = "";
      page_gen(1);
		} else if (key == 13){ // enter
      document.activeElement.blur();
			document.getElementById("2").focus();
      result = 2;
      focused = 2;
      return false; // Having issues without this, on Firefox
    } else if (document.getElementById("search").value.includes("term=")){
      term = document.getElementById("search").value.replace("term=","");
      console.log("term -> "+ term);
    };
		return;
	};

	if ( key == 32 ) { // Key space -> focus search bar but dont log a space in search
    document.getElementById("search").focus();
    return false; // ignore space in search field
	} else if (key == 220) { // "\" key -> theme menu
    page_gen(1,pages["Themes"]);
  }else if (key == 191) { // "/" key -> calls external search
    document.getElementById("search").value = term;
    document.getElementById("search").focus();
    return false;
  } if (key == 27) { // esc -> back to home screen
    page_gen(1);
    document.getElementById("search").value = "";
  } else if ( key == 38 || key == 75) { // Up key, go back 4 blocks (the one above).
		result = parseInt(focused) - skipCount;
		focused = parseInt(focused) - skipCount;
		if (result < 1) {
			result += tileCount;
			focused += tileCount;
		}
		result = !isNaN(document.activeElement.id) ? result : focused;
	} else if ( key == 40 || key == 74) { // Down key, go forward 4 blocks (the one below).
		result = parseInt(focused) + skipCount;
		focused = parseInt(focused) + skipCount;
		if (result > tileCount) {
			result -= tileCount;
			focused -= tileCount;
		}
		result = !isNaN(document.activeElement.id) ? result : focused;
	} else if ( key == 39 || key == 76) { // Right key, go forward 1 block or reset row if end.
		result = focused == tileCount ? 1 : parseInt(focused) + 1;
		focused = focused == tileCount ? 1 : parseInt(focused) + 1;
		if (result > tileCount) {
			result -= tileCount;
			focused -= tileCount;
		}
		result = !isNaN(document.activeElement.id) ? result : focused;
	} else if ( key == 37 || key == 72) { // left key, go back 1 block or reset row if end.
		result = focused == 1 ? tileCount : parseInt(focused) - 1;
		focused = focused == 1 ? tileCount : parseInt(focused) - 1;
		if (result < 1) {
			result += tileCount;
			focused += tileCount;
		}
		result = !isNaN(document.activeElement.id) ? result : focused;
	}
  /*
    Custom key shortcuts
  */
  for (var i = 49; i <= 57; i++) { // 1 to = -> tiles 1-12
    if (key == i) {
      result = i-48;
    };
  };
  if (key == 48) {
    result = 10;
  } else if (key == 189) {
    result = 11;
  } else if (key == 187) {
    result = 12;
  };
  /* Currently doesnt work with hjkl only 1-12
  if (result && page == pages["Themes"]) {
    document.getElementById(String(result)).focus();
    document.getElementById(String(result)).click();
  }
  */
  if (result) {
    if (result != focused && cached == pages["Themes"]) { // changes themes
      document.getElementById(String(result)).click();
      result = focused;
    } else {
      document.getElementById(String(result)).focus();
    };
	};
};

function blank_tile() {
  return ["","","",""];
}

function reset_tile_count() {
  disabledTiles = 0;
  tileCount = 12;
}

function update_skip_count() {
  // skipCount update
  var gridWidth = document.getElementById('grid').offsetWidth;
  gridWidth = parseInt(gridWidth);
  var tileWidth = document.getElementsByClassName('tile')[0].offsetWidth;
  tileWidth = parseInt(tileWidth);
  skipCount = Math.floor(gridWidth/tileWidth);
}

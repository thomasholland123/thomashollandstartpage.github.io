var term = "?";
const time = new Date();
var unixtime = time.getTime();
var pages = {
  /*
    ******** FORMAT ********
    PAGENAME : [
      [URL,ICN,TITLE,SUBTITLE,OPT]
    ]
    ******** OPT ********
    @.  -> keycode i.e. @13 -> enter (not implemented)
    #.  -> local url reference i.e. #KEY -> pages[KEY]
    $. -> theme name -> sets theme on focus
    *  -> hide file from search (useful for back buttons or other repeated tiles)
    '' -> does nothing (still compiles normally)
    ~.  -> reference to known tile

    ******** NOTES ********
    - do not redefine (or use as a key):
      ">" -> currently used for search_live and larger folders
      "<" -> same as next
      "~" -> used for references (also for non local images)
    - if you use a tile in more than one page, put it in reference to prevent duplicate search results
    - "~" is a useful place to put pages that you want searchable even if they arent on a speciic page (i.e. tv shows)
  */
  "Back":[
    // Leave Blank (for search/page overflow only)
  ],
  "Next":[
    // Leave Blank (for search/page overflow only)
  ],
  "~":[ // References -> use exact string of title (mostly for duplicates)
    // utility tiles
    ["@w","weather/01d","Weather","Updating..."],
    ["#","chevron-right","Next"," More Results","*"],
    ["#","chevron-left", "Back","To the Future","*"],
    // links
    ["https://www.linkedin.com","linkedin","Linkedn","Professional"],
    ["https://github.com","github","Github","Repos"],
    ["https://reddit.com/","reddit-alien","Reddit","Home"],
    ["https://www.youtube.com/","youtube-play","Youtube","Daily Tech Fix"],
    // folders
    ["#","folder-open","SubReddits","The Front Page"],
    ["#","folder-open","Themes","Colors"],
    ["#","wrench","Settings","Colors"],
    ["#","folder-open","News","Headlines"],
    ["#","folder-open","Keyboards","Ctrl Alt Del"],
    ["#","folder-open","Media","Stream"],
    ["#","folder-open","Networks","Social Media"],
    ["#","folder-open","Code","~/hack.sh"],
  ],
  "Home":[ // Index page loads at and resets to on end of search or 'esc'
    ["~Github"], // example of reference
    ["https://gmail.com","envelope-o","Gmail","Mails","google"],
    ["https://keep.google.com","list","Keep","Tasks"],
    ["~Youtube"],
    ["~SubReddits"],
    ["~Networks"],
    ["~Code"],
    ["~Media"],
    ["~News"],
    ["~Keyboards"],
    ["~Settings"],
  ],
  "Keyboards":[
    ["https://www.massdrop.com/mechanical-keyboards","lock","Massdrop","GBs"],
    ["https://www.reddit.com/r/MechanicalKeyboards/","lock","r/MK","Reddit"],
    ["https://mitormk.com","lock","MitoMK","Laser SA"],
    ["https://www.jellykey.com","lock","JellyKeys","Artisans"],
    ["https://keyhive.xyz/shop","lock","Key hive","Honeycomb"],
    ["https://keeb.io","lock","Keeb.io","Iris/Split"],
    ["https://discordapp.com","lock","Discord","QMK/PDXKBC"],
    ["https://www.rpi.edu/dept/arc/training/latex/LaTeX_symbols.pdf","lock","Latex","Symbol Dictionary"],
    ["http://www.keyboard-layout-editor.com","lock","Keylayout","QMK Editor"],
    ["https://thomasbaart.nl","lock","QMK Basics","Tutorials"],
    ["https://github.com/qmk/qmk_firmware/blob/master/docs/keycodes.md","lock","QMK Keycodes","hyper(kc)"],
  ],
  "Media":[
    ["~Youtube"],
    ["https://hbogo.com/","play","HBO GO","Westworld"],
    ["https://netflix.com","play-circle","Netflix","US Proxy"],
    ["https://www.hulu.com","play","Hulu","Top Chef !!!"],
    ["https://soundcloud.com","soundcloud","Soundcloud","Mixtape Madness"],
    ["https://twitch.com","twitch","Twitch","Livestream"],
    ["https://vimeo.com","vimeo","Vimeo","Video Platform"],
    ["https://www.fubo.tv/welcome","play","FuboTv","Futbol"],
  ],
  "Code":[
    ["~Github"],
    ["http://stackoverflow.com","stack-overflow","Stack Overflow","Java?"],
    ["https://1password.com","terminal","1Password","Database"],
    ["https://fontawesome.com/icons/","fonticons","Font Awesome 4","Icon Set"],
    ["https://github.com/amix/vimrc","terminal","Vimrc","runtime config"],
    ["https://atom.io","terminal","Atom.io","IDE"],
    ["https://internetingishard.com/html-and-css/","internet-explorer","Interneting is hard","HTML Guide"],
    ["https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet","terminal","Markdown","Cheatsheet"],
    ["https://keycode.info","terminal","Keycodes","Javascript"],
  ],
  "Networks":[
    ["https://web.whatsapp.com","whatsapp","Whatsapp","Messenger"],
    ["https://facebook.com","facebook","Facebook","Delete me"],
    ["https://www.instagram.com","instagram","Instagram","Photos"],
    ["~Reddit"],
    ["~Linkedn"],
    ["https://twitter.com","twitter","Twitter","Internet News"],
    ["https://discordapp.com","users","Discord","Chat Channels"],
  ],
  "News":[
    ["~Weather"], // syntax for referencing functions
    ["bbc-news","newspaper-o","BBC","BBC","news"],
    ["the-new-york-times","globe","New York Times","New York Times","news"],
    ["reuters","newspaper-o","Reuters","Reuters","news"],
    ["ars-technica","newspaper-o","Ars Technica","Ars Technica","news"],
    ["cnn","newspaper-o","CNN","CNN","news"],
    ["ign","newspaper-o","ign","ign","news"],
    ["the-verge","newspaper-o","The Verge","The Verge","news"],
    ["hacker-news","hacker-news","Ycombinator","Ycombinator","news"],
    ["national-geographic","map","Nat Geo","Nat Geo","news"],
    ["https://newsapi.org","newspaper-o","News Api","Headlines"],
  ],
  /*
    Dict of possible live tiles
    - Search -> Search possible source with VAR placeholder for parser to fill
    - Get -> `https://api.darksky.net/forecast/f672ff13193bfcc40427a678ebfdbc71/${lat},${long}` + `?format=jsonp&callback=displayWeather`;
  */
  "Search":[
    ["@d","book","Word","Definition",term],
    ["https://www.reddit.com/r/VAR/","reddit-alien","Reddit","r/VAR",term],
    ["https://stackoverflow.com/search?q=VAR","stack-overflow","Stack Overflow","\"VAR\"",term],
    ["https://en.wikipedia.org/wiki/VAR","wikipedia-w","Wiki","\"VAR\"",term],
    ["https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=VAR","language","Translate","Translate: \"VAR\"",term],
    ["https://www.rottentomatoes.com/search/?search=VAR","search","Rotten Tomatoes","\"VAR\"",term],
    ["https://www.youtube.com/results?search_query=VAR","youtube-play","Youtube","\"VAR\"",term],
    ["https://www.netflix.com/search?q=VAR","search","Netflix","\"VAR\"",term],
    ["https://duckduckgo.com/?q=VAR","search","DuckDuckGo","\"VAR\"",term],
    ["https://www.wolframalpha.com/input/?i=VAR","plus","Wolfram","\"VAR\"",term],
  ],
  "SubReddits":[
    ["~Reddit"],
    ["https://reddit.com/r/startpages","reddit-alien","Reddit","r/startpages"],
    ["https://reddit.com/r/coolgithubprojects","reddit-alien","Reddit","r/coolgithubprojects"],
    ["https://reddit.com/r/github","reddit-alien","Reddit","r/github"],
    ["https://reddit.com/r/WebDev","reddit-alien","Reddit","r/WebDev"],
    ["https://reddit.com/r/Frontend","reddit-alien","Reddit","r/Frontend"],
    ["https://reddit.com/r/JavaScript","reddit-alien","Reddit","r/JavaScript"],
    ["https://reddit.com/r/Haskell","reddit-alien","Reddit","r/Haskell"],
    ["https://reddit.com/r/Jokes","reddit-alien","Reddit","r/Jokes"],
  ],
  "Themes":[ // put tiles for each theme here
    ["$","desktop","Gogh","Blue Green Yellow",["#0F8AA6","#0E7995","#6BE8AE","#F5D45B"]],
    ["$","desktop","Discord","Black Purple Grey",["#23272A","#34383B","#7289DA","#99AAB5"]],
    ["$","desktop","Skeletor","Green Purple Green",  ["#588C5E","#477B4D","#802640","#A3CC99"]],
    ["$","desktop","Terminal","Black Green",["#282828","#393939","#33FF33","#33FF33"]],
    ["$","desktop","Todoist","Grey Yellow Red",["#1f1f1f","#2e2e2e","#fccf1b","#cd5650"]],
    ["$","desktop","Switch","Grey Red Blue",["#414548","#525659","#ff4554","#00c3e3"]],
    ["$","desktop","Lava","Black Red Orange",["#000000","#111111","#DD4132","#FF9D00"]],
    ["$","desktop","Purple","Purple Red Blue",["#635D9D","#524C8C","#FE5858","#63CAB9"]],
    ["$","desktop","Blues","Blue Grey",["#32598C","#21487B","#B0C1D9","#7B92A6"]],
    ["$","desktop","Starry Night","Blue Green Yellow",["src/wall/starry.jpg","rgba(0,0,0,0.4)","#FFFFFF","#FFFFFF"]],
    ["$","heart-o","Emma Watson","White Black",["src/wall/emma.jpg","rgba(0,0,0,0.4)","#000000","#000000"]],
  ],
  "Settings": [
    ["~Themes"]
  ]
};


function update_tiles(){ // for all tiles to load on start or other events
    update_weather();
    for (i = 1; i < pages["News"].length-1; i++){
      update_news(pages["News"][i]);
    };
};

/*
  API Format :

  var name = [@L, "icon", "Title","Loading","Tags"]
  function update_name(null){
    // call api here
    change name varaible based on changes in data
  }
  function name_tile(num){
    set_tile(num, name);
}
*/

var zip = "97202"; // changes when searching valid zips / or when zip is saved
var oldzip = "";
var weather = ["@w","weather/01d","Weather","Updating...","weather"]; // default tile

function update_weather(num){
  var api = "676fed7baf0fa449b76b320a14187224";
  var url = "http://api.openweathermap.org/data/2.5/weather?zip="+ zip + ",us&appid=" + api;

  if (num != undefined){
    // set_tile(num, [url,"50px",images[weather[1]],weather[2],weather[3]]); // placeholder tile
    set_tile(num, [url,"cloud",weather[2],weather[3]]); // placeholder tile
  };

  if (zip != oldzip) {
    wtile = weather; // TODO change to new tile for multiple zips
    var request = new Request(url);
    fetch(request).then(function(request) {
      return request.json();
    }).then(function(json) {
      wtile[0] = "@w";
      if (unixtime - json.sys.sunrise <= 30 * 60) {
        wtile[1] = "sunrise";
      } else if (json.sys.sunset - unixtime >= 30 * 60) {
        wtile[1] = "sunset";
      } else if (Math.round((json.main.temp - 273.15) * 9/5 + 32) < 32) {
        wtile[1] = "cold";
      } else if (Math.round((json.main.temp - 273.15) * 9/5 + 32) > 95){
        wtile[1] = "hot";
      } else {
        wtile[1] = json.weather[0].icon;
      };
      image = new Image();
      image.src = "src/weather/" + wtile[1] + ".png";
      images[wtile[1]] = image.src;
      wtile[2] = json.name;
      wtile[3] = json.weather[0].description + " " + Math.round((json.main.temp - 273.15) * 9/5 + 32) + "F, " + json.main.humidity + "% humidity " + (weather.rain == undefined ? "" : json.rain);
      wtile[4] = zip;
      weather = wtile;
      oldzip = zip;
      if (num != undefined){
        // set_tile(num, [url,"50px",images[weather[1]],weather[2],weather[3]]);
        set_tile(num, [url,"cloud",weather[2],weather[3]]);
      };
      console.log("updated weather for " + zip + " - " + wtile);
    }).catch(function(error){
      console.log("weather update error: " + error);
    });
  };
}


var last = "";

function dict_tile(num,current){
  var url = "https://api.datamuse.com/words?sp=" + current + "&md=d";
  var request = new Request(url);
  if (current == last){
    tile = pages["Search"][0];
    // set_tile(num,["@d","50px",images[tile[1]],tile[2],tile[3]]);
    set_tile(num,["@d","book",tile[2],tile[3]]);
    return null;
  };
  last = current;
  fetch(request).then(function(request) {
    return request.json();
  }).then(function(json) {
    tile = pages["Search"][0];
    if (json != undefined) {
      console.log(json);
      tile[2] = json[0].word;
      tile[3] = json[0].defs[0];
    };
    set_tile(num,["@d","book",tile[2],tile[3]]);
    // set_tile(num,["@d","50px",images[tile[1]],tile[2],tile[3]]);
  }).catch(function(error){
    set_tile(num,["@d","book",tile[2],tile[3]]);
    // set_tile(num,["@d","50px",images["~dictionary"],"Word","Definition"]);
  });
}


function update_news(tile){
  var start = "https://newsapi.org/v2/top-headlines?sources=";
  var api = ""; // need to get an api key to use this feature
  if (api == ""){
    tile[3] = "No Api Key";
    console.log("need api key for this");
    return;
  }
  url = start + tile[0] + api;
  var request = new Request(url);
  fetch(request).then(function(request) {
    return request.json();
  }).then(function(json) {
    tile[0] = json.articles[0].url;
    tile[2] = json.articles[0].title;
  }).catch(function(error){
    console.log(error)
    tile[0] = "No Api Key";
    tile[2] = "https://newsapi.org";
  });
};

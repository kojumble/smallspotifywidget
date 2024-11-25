// this code sux and is entirely backend

// import your own refresh token and client id in a json
import { refreshToken, clientId } from '../data/config.json' with { type: "json" };

// setting up things for use in multiple functions to share the same values
// the desire to rewrite this entire script is very large

let allowedToCount = Boolean;

// makes an int for counting how many times the loop is run
let loopCount = 0;

// set a local storage item for the boolean "allowedToCount"
if (localStorage.getItem('allowedToCount') !== null) {
  allowedToCount = localStorage.getItem('allowedToCount');
} else {
  allowedToCount = false;
}

// this is just a function to parse rgb into hsl values
// im like 99% sure this code is completely incorrect but the way its broken kind of provides a use?
// it outputs a slightly darker color than the rgb value it gets, so i just use it for contrast

// this function is also not entirely my code, but ill try to explain the reasoning as much as i can

function rgbToHsl(r, g, b) {
  // /= is the same as writing "r = r / 255;", its just shorter syntax
  // divides the input r g and b values by 255 to get them to be like "0.156/1" instead of "40/255"
  r /= 255, g /= 255, b /= 255;

  // gets the max and min values of r, g and b
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  // h, s and l are all equal to "(max+min)/2", which is the max and min of r, g and b
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // sets h and s to 0 because its achromatic (monochrome / black and white)
  } else {
    // it makes sense in my head but i just cant say it
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    // if theres a max of r, g or b, do this code
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  // return the hsl value in seperate variables
  return [h, s, l];
}

// the basic idea of these calls is to use the fetch api to get data from spotify
const refreshAccessToken = async () => {
// refresh token that has been previously stored
  try {
    const url = "https://accounts.spotify.com/api/token";
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + clientId,
      },
      body: new URLSearchParams({
        scope:'user-read-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    }
    const refreshaccess = await fetch(url, payload);
    const spotifyresponse = await refreshaccess.json();

    localStorage.removeItem('access_token');
    localStorage.setItem('access_token', spotifyresponse.access_token);

    console.debug("token removed and remade!");

    testToken();
  } catch(err) {
    console.warn("error at refresh access token!");
  }
}

// tests token validity by getting my top artist, if correctly verified call song data, else refresh the token and try again
const testToken = async () => {
  try {
    const url = "https://api.spotify.com/v1/users/31catbpgawdikbparhusjlhvvdbi";
    const payload = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    }
    const tokentest = await fetch(url, payload);
    const spotifyresponse = await tokentest.json();

    var namecheck = "Daniel Elb";
    if (spotifyresponse.display_name == namecheck) {
       // console.log("found me! " + spotifyresponse.display_name)
       getSongData();
    } else {
     console.debug("token failed to verify, deleting null register...");
     localStorage.removeItem('access_token');
     refreshAccessToken();
    }
  }
  catch(err) {
    console.warn("error at test token!");
  }
}

// get song/player data (song name, timestamp, song link, thumbnail etc)
const getSongData = async () => {
  try {
    // the only two nessecary web fetches per loop to check if i need to fetch everything else
    const playerurl = "https://api.spotify.com/v1/me/player?additional_types=track";
      const playerpayload = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
      }
    const playerdata = await fetch(playerurl, playerpayload);
    const playerresponse = await playerdata.json();
    // console.log(playerresponse);

    const currentlyplayingurl = "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track";
    const currentlyplayingpayload = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    }
    const currentlyplayingdata = await fetch(currentlyplayingurl, currentlyplayingpayload);
    const currentlyplayingresponse = await currentlyplayingdata.json();
    // console.log(currentlyplayingresponse);

    // timestamp functions run every time
    // if the last saved integer is the same as the next loaded integer, pause the counter. else let it run
    // parse this first to fix stuck timers
    timestamp = parseInt(document.getElementById("timestamp").innerHTML);
    maxtime = parseInt(document.getElementById("maxtime").innerHTML);

    let parsedLoopback = parseInt(localStorage.getItem("lastLoopbackTimestamp"));
    let parsedFetchTimestamp = parseInt((playerresponse.progress_ms)/1000);

    // if the last saved timestamp is equal to the fetched timestamp, one higher than the fetched timestamp, or null: pause the timestamps count
    if ((parsedLoopback == parsedFetchTimestamp) || (parsedLoopback == (parsedFetchTimestamp+1)) || (parsedLoopback == "NaN")) {
      if (allowedToCount != false) {
          allowedToCount = false;
          localStorage.setItem('allowedToCount', allowedToCount);
          console.info("last saved time the same as new time! timestamp locked");
        }
      }
      else {
        // else allow counting and set a new value to the saved timestamp
        if (allowedToCount != true) {
          allowedToCount = true;
          localStorage.setItem('allowedToCount', allowedToCount)
          console.info("timestamp is getting new data");
        }
      }

    // spotify saves all timings in milliseconds so i gotta turn them to seconds and remove the decimal points
    // tldr, divide ms by 1000 then parse it into an integer
    document.getElementById("timestamp").innerText = parseInt((playerresponse.progress_ms)/1000);
    document.getElementById("maxtime").innerText = parseInt((currentlyplayingresponse.item.duration_ms/1000));
    localStorage.setItem('lastLoopbackTimestamp', parseInt((playerresponse.progress_ms)/1000));

    // if the name of the song has changed or the timestamp is = the max time, call everything else
    // used to cut down on unessecary calls and total data transfers
    if ((document.getElementById("songname").innerText !== playerresponse.item.name)) {
      const nextupurl = "https://api.spotify.com/v1/me/player/queue";
      const nextuppayload = {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
      }
      const nextupdata = await fetch(nextupurl, nextuppayload);
      const nextupresponse = await nextupdata.json();
      // console.debug(nextupresponse);

      // if albumname is the same, dont load a new thumbnail
      // this is incase i am listening to a specific album
      // ran first to catch the element before it refreshes
      if (document.getElementById("albumname").innerText !== playerresponse.item.album.name) {
        document.getElementById("thumbnail").src = playerresponse.item.album.images[0].url;
        // console.debug("refresh image! the thumbnail changed")
      } else {
        // console.debug("dont refresh image! its the same")
      }

      // second songname check, only activates on second full refresh call so the previous stays null until there is a known previous song
      // sets the previous songs data to the current dataset before it loads new song data
      if (document.getElementById("songname").innerText !== "Song Name") {
        document.getElementById("prevsong").innerText = document.getElementById("songname").innerText;
        document.getElementById("prevsong").href = document.getElementById("songname").href;
        document.getElementById("prevsong").title = document.getElementById("songname").title;
  
        document.getElementById("prevartist").innerText = document.getElementById("artistname").innerText;
        document.getElementById("prevartist").href = document.getElementById("curArtist0").href;
        document.getElementById("prevartist").title = `${document.getElementById("curArtist0").innerText} - ${document.getElementById("curArtist0").href}`;
      } else {
        document.getElementById("prevsong").innerText = "null";
        document.getElementById("prevsong").removeAttribute("title");
        document.getElementById("prevsong").removeAttribute("href");
  
        document.getElementById("prevartist").innerText = "null";
        document.getElementById("prevartist").removeAttribute("title");
        document.getElementById("prevartist").removeAttribute("href");
      }
      
      // most of these are pretty self descriptive, but in short
      // gets the names and urls of the data i need (songs, artists, whats next in my queue) and displays it

      // href is the link you go to when you click an object
      // the "title" is the little text that appears when you hover over something

      document.getElementById("progress").style.transitionProperty = "background-color";
      document.getElementById("progress").style.width = "0%";
      
      document.getElementById("songname").innerText = playerresponse.item.name;
      document.getElementById("songname").href = playerresponse.item.external_urls.spotify;
      document.getElementById("songname").title = `${document.getElementById("songname").innerText} - ${document.getElementById("songname").href}`

      document.getElementById("albumname").innerText = playerresponse.item.album.name;
      document.getElementById("albumname").href = playerresponse.item.album.external_urls.spotify;
      document.getElementById("albumname").title = `${document.getElementById("albumname").innerText} - ${document.getElementById("albumname").href}`

      const artistlist = playerresponse.item.artists;
      let artistlistCount = 0;
      
      artistlist.forEach(artist => {
        let curHrefJsonResponse = playerresponse.item.artists[artistlistCount].external_urls.spotify;
        let curArtistJsonResponse = playerresponse.item.artists[artistlistCount].name;

        if (artistlistCount == 0) {
          // removes the previous data then sets the first new one
          document.getElementById("artistPlural").innerText = "artist -";
          document.getElementById("artistname").innerHTML = `<a id="curArtist${artistlistCount}" class="subdatadata" target="_blank" title="${curArtistJsonResponse} - ${curHrefJsonResponse}" href="${curHrefJsonResponse}">${curArtistJsonResponse}</a>`;
          artistlistCount++;
        } else {
          // adds extra data if nessecary
          // comma at start to continue the list
          document.getElementById("artistPlural").innerText = "artist(s) -";
          document.getElementById("artistname").innerHTML += `<span class="subdatadata">, </span>`;
          document.getElementById("artistname").innerHTML += `<a class="subdatadata" target="_blank" title="${curArtistJsonResponse} - ${curHrefJsonResponse}" href="${curHrefJsonResponse}">${curArtistJsonResponse}</a>`;
          artistlistCount++;
        }
      });

      document.getElementById("nextsong").innerText = nextupresponse.queue[0].name;
      document.getElementById("nextsong").href = nextupresponse.queue[0].external_urls.spotify;
      document.getElementById("nextsong").title = `${document.getElementById("nextsong").innerText} - ${document.getElementById("nextsong").href}`
      
      document.getElementById("nextartist").innerText = nextupresponse.queue[0].artists[0].name;
      document.getElementById("nextartist").href = nextupresponse.queue[0].artists[0].external_urls.spotify;
      document.getElementById("nextartist").title = `${document.getElementById("nextartist").innerText} - ${document.getElementById("nextartist").href}`;

      // wow thats a lot of values

      // coloring based on song
      // using the fastaveragecolor library it gets averages from the songs cover/album art and derives colors from there
      // done because spotify (to my knowledge) does not allow access to their database that provides the colors for songs

      // using the fastaveragecolor library to set the colors of the module
      // the mode is set to speed and algorithm is set to simple for the fastest load times
      // it also ignores the colour black and sets the default color to a grey
      const fac = new FastAverageColor();
      fac.getColorAsync(playerresponse.item.album.images[0].url, {mode: 'speed', algorithm: 'simple', ignoredColor: [0, 0, 0, 255], defaultColor: [200, 200, 200, 255]})
      .then(color => {

        const container = document.getElementById('whatImListeningTo');

        // i do not know what i was on when i wrote this code, this is a psychopathic way of doing this
        // i am second guessing my 4 in the morning code but i also dont feel like rewriting it because this makes actually no sense at all

        // parses the rgb values into hsl, multiplies by 100 and removes decimals by converting to integer
        let hsl0 = (parseInt(rgbToHsl(color.r,color.g,color.b)[0] * 100));
        let hsl1 = (parseInt(rgbToHsl(color.r,color.g,color.b)[1] * 100));
        let hsl2 = (parseInt(rgbToHsl(color.r,color.g,color.b)[2] * 100));

        // gets average in terms of HSL
        let hslBasic = "hsl("+(hsl0)+ ", " + (hsl1) + "%" + ", " + (hsl2) + "%"+")";
        let hslLight = "hsl("+(hsl0)+ ", " + (hsl1/2-10) + "%" + ", " + (hsl2-30) + "%"+")";
        let hslDark = "hsl("+(hsl0)+ ", " + (hsl1) + "%" + ", " + (hsl2+40) + "%"+")";

        // gets average in terms of RGB
        let rgbBasic = "rgb("+(color.r)+ ", " + (color.g) + ", " + (color.b) +")";
        let rgbLight = "rgb("+(color.r+40)+ ", " + (color.g+40) + ", " + (color.b+30) +")";
        let rgbDark = "rgb("+(color.r+20)+ ", " + (color.g) + ", " + (color.b+10) +")";
        
        // set the containers background and text colors
        container.style.backgroundColor = color.isDark ? rgbDark : rgbLight;
        container.style.color = color.isDark ? hslDark : hslLight;

        // for each child of songtime change stroke color depending on if the color is light or dark
        // done so no matter what the text is easy to read on the background 

        const songtimeChildren = Array.from(document.getElementById("songtime").querySelectorAll("*"));
        songtimeChildren.forEach(element => {
          element.style.webkitTextStroke = color.isDark ? "3px "+rgbDark : "3px "+rgbLight;
        });

        document.getElementById("progress").style.backgroundColor = color.isLight ? rgbDark : rgbLight;
        document.getElementById("songtime").style.backgroundColor = color.isDark ? hslDark : hslLight;

        document.getElementById("songname").classList.toggle = color.isDark ? "dark" : "";
        document.getElementById("nameline").style.borderColor = color.isDark ? hslDark : hslLight;
        document.getElementById("thumbnailBG").style.backgroundColor = color.isDark ? hslDark : hslLight;
        
        // toggle the class names of these elements
        // done so i can use css things like :hover to animate without using javascript

        const hoverClass = ['albumname', 'artistname'];
        hoverClass.forEach(element => {
          document.getElementById(element).classList.toggle = color.isDark ? "dark" : "";
        });

        const queueClass = ['nextsong', 'nextartist', 'prevsong', 'prevartist'];
        queueClass.forEach(element => {
          document.getElementById(element).classList.toggle = color.isDark ? "dark" : "";
        });

      })
      // catch and log any errors
      .catch(e => {
          console.log(e);
      });
    }

    // call for new song data after 5 seconds
    //
    setTimeout(getSongData, 5000);
    timerCountup();

  } catch(err) {
    // stops the timer from counting if no new song data is gotten
    allowedToCount = false;
    // call for a 10 second timeout instead as i dont want to flood requests if something is wrong
    setTimeout(getSongData, 10000);
    console.warn("error at main content fetch! most likely paused or im not playing a song right now");

    // special cases for replacement
    // basically i wanted the songname to be a special string and the album image to load a backup default
    if (document.getElementById("songname").innerText == "") {
      document.getElementById("songname").innerText = "nothing right now";
    }

    if (document.getElementById("thumbnail").src == "") {
      document.getElementById("thumbnail").src = "/media/nosong.webp";
    }

    // arrays are easier to read and edit so heres a few

    // (for each element) if it is nonexistant, set it as null, else keep previous name
    // if its a special case, run that function instead
    const mainElements = ['albumname', 'artistname', 'nextsong', 'nextartist', 'prevsong', 'prevartist'];
    mainElements.forEach((element) => {
      if (document.getElementById(element).innerText == "") {
        document.getElementById(element).innerText = "null";
      }
    }
    )

    // (for each element) if its integer is nonexistant, set to 0
    // only for error catching, the count is already set to pause when it doesnt recieve data
    const intElements = ['timestamp', 'maxtime'];
    intElements.forEach((element) => {
      if (document.getElementById(element).innerText == "") {
        document.getElementById(element).innerText = 0;
      }
    }
    )

    // (for each element) if it does not exist (null or blank), remove it
    // leaves it alone if href data does exist
    // again, only for error catching as hrefs dont exist by default
    const hrefSubElements = ['songname', 'albumname', 'artistname', 'nextsong', 'nextartist', 'prevsong', 'prevartist'];
    hrefSubElements.forEach((element) => {
      if (document.getElementById(element).href == null||"") {
        document.getElementById(element).removeAttribute("href");
        document.getElementById(element).removeAttribute("title");
      }
    }
  )
  }
}

// fakes the timer by counting up 1 every second for 5 seconds i ask the api again
// done for less api calls (and also for looks as it looks a lot cleaner than getting new decimal data every second)
const timerCountup = async () => {

  timestamp = parseInt(document.getElementById("timestamp").innerHTML);
  maxtime = parseInt(document.getElementById("maxtime").innerHTML);

  // faking that timer!

  // if the loop count is less than 6, auto count timestamp
  // counts to 6 instead of 5 just in case the data call takes an extra second or two
  // else reset the loopcount and end the code loop
  if (loopCount < 6) {
    // adds one to the loop count
    loopCount++;
    // console.debug(`timestamp loop is ${loopCount}`);

    if ((timestamp < maxtime) && (allowedToCount == true)) {
      document.getElementById("timestamp").innerHTML = parseInt(document.getElementById("timestamp").innerHTML) + 1;
      document.getElementById("progress").style.width = (((timestamp/maxtime)*100)+1)+"%";
    } else {
      // caps the timestamp to the size of the maximum
      // there is a nice library for clamping values, but i didnt know about it at the time
      // may add later
      timestamp = maxtime;
    }
  
    if (document.getElementById("progress").style.transitionProperty = "background-color") {
      document.getElementById("progress").style.transitionProperty = "background-color, width";
    }
    
    // loops code with a pause of of 1 second
    setTimeout(timerCountup, 1000);
  } else 
  {
    // reset loop
    loopCount = 0;
    // console.debug(`timestamp loop reset to ${loopCount}`);
  }
}

// when the page is fully loaded, get spotify data
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("access_token") === null) {
    // get a new token and refresh the songs data
    // log runs first for readability
    console.info("new token and song data");
    refreshAccessToken();

  } else if (localStorage.getItem("access_token") !== null) {
    // just refresh the songs data
    // log runs first for readability
    console.info("just the song data is needed");
    testToken();
  }
});
var lastfmData = {
  baseURL:
  "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=",
  user: "theshadowaspect",
  api_key: "439b79296c508b1d0840691296b33ecd",
  additional: "&format=json&limit=1"
};

function getSetLastFM() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET',
    lastfmData.baseURL +
    lastfmData.user +
    "&api_key=" +
    lastfmData.api_key +
    lastfmData.additional
  )
  xhr.responseType = 'json';

  xhr.onload = function() {
    var resp = xhr.response;
    var recentTrack = resp.recenttracks.track[0];

    var formatted =
      "<img src='https://i.imgur.com/EgWjJry.png'>" + recentTrack.name;
    var trackTitleLink = document.querySelector("a#tracktitle")
    trackTitleLink.innerHTML = formatted
    trackTitleLink.setAttribute("href", recentTrack.url);
    trackTitleLink.setAttribute("title", recentTrack.name + " by " + recentTrack.artist["#text"]);
    trackTitleLink.setAttribute("target", "_blank");

    var artistFormatted =
      recentTrack.artist["#text"];
    var artistSelector = document.querySelector("span#trackartist");
    artistSelector.innerHTML = artistFormatted;
    artistSelector.setAttribute("title", "Artist : " + recentTrack.artist["#text"]);

    var imageArtElement = document.querySelector("img#trackart");
    imageArtElement.setAttribute("src", recentTrack.image[2]["#text"]);
  }

  xhr.onerror = function(resp) {
    trackTitleLink = document.querySelector("a#tracktitle")
    trackTitleLink.innerHTML = "<img src='https://i.imgur.com/EgWjJry.png'>" + "Silence!";

    var imageArtElement = document.querySelector("img#trackart");
    imageArtElement.setAttribute("src", "https://i.imgur.com/Q6cCswP.jpg");

    var artistFormatted =
      "<img src='https://i.imgur.com/fae5XZA.png'>Nobody";
    var artistSelector = document.querySelector("a#trackartist");
    artistSelector.innerHTML = artistFormatted;
  }

  xhr.send()
}

// Get the new one.
getSetLastFM();
// Start the countdown.
setInterval(getSetLastFM, 10 * 1000);


async function updateNowPlaying(data){
    const track = data.recenttracks.track[0];

    get = function(obj, key) {
        return key.split(".").reduce(function(o, x) {
            return (typeof o == "undefined" || o === null) ? o : o[x];
        }, obj);
    }

    const trackName = track.name;
    const trackArtist = get(track, "artist.name");
    const trackArtistURL = get(track, "artist.url");
    const trackAlbum = get(track, "album.#text");
    const currentlyPlaying = get(track, "@attr.nowplaying");
    const albumImageURL = track.image[2]["#text"];
    const trackURL = track.url;

    const updateMap = {
        "status": currentlyPlaying,
        "song": trackName,
        "artist": trackArtist,
        "album": "the album " + trackAlbum,
    }

    const wrapper = document.querySelector("#last-fm-now-playing");
    const dests = wrapper.querySelectorAll("span");

    const statusElement = wrapper.querySelector('.status')
        .textContent = currentlyPlaying ? "am currently listening" : "most recently listened to";

    const artistNameElement = wrapper.querySelector('.artist a');
    artistNameElement.setAttribute('href', trackArtistURL);
    artistNameElement.textContent = trackArtist;

    const trackNameElement = wrapper.querySelector('.song').textContent = trackName;
    const albumNameElement = wrapper.querySelector('.album').textContent = trackAlbum;

    const imageElement = wrapper.getElementsByClassName('album-art')[0]
    imageElement.setAttribute('src', albumImageURL);

    wrapper.querySelector('.song-link a').setAttribute('href', trackURL);
    wrapper.querySelector('.song-link').hidden = false;
}

async function fetchNowPlaying() {
    url = "https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=theshadowaspect&api_key=8e5f1023e489ae3c426bf5cd62ff67df&format=json&limit=1&extended=1"
    const request = await fetch(url);
    const data = await request.json();
    return data
}

// Update Last.fm now playing once on page load and then every 5 minutes.
// Lol that anyone's going to be on this site for more than 5 minutes
window.addEventListener('load',() => {
    fetchNowPlaying().then(updateNowPlaying);
});
window.setInterval(() => {
    fetchNowPlaying().then(updateNowPlaying);
}, 5 * 60 * 1000);

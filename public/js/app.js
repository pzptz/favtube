import apiRequest from "./apirequest.js";
import Video from "./video.js";
import GoogleAuth from "./googleauth.js";

const API_KEY = "REPLACE THIS"; // Insert your YouTube Data API v3 key here
const CLIENT_ID = "REPLACE THIS"; // Insert your Google OAuth Client ID here
const YT_URL = "https://youtube.googleapis.com/youtube/v3/search?";
const CHANNEL_LINK = "https://youtube.com/channel/";

export default class App {
  constructor() {
    /* Redirect to YouTube */
    this._handleYT = this._handleYT.bind(this);
    document.querySelector("#redirect").addEventListener("click", this._handleYT);

    /* Dark mode */
    this._isDark = false;
    this._handleDark = this._handleDark.bind(this);
    document.querySelector("#darkMode").addEventListener("click", this._handleDark);

    /* Login with Google */
    this._googleAuth = new GoogleAuth(CLIENT_ID);
    this._googleAuth.render(document.querySelector("#loginForm"), this._onLogin);

    /* YouTube search */
    this._handleSearch = this._handleSearch.bind(this);
    this._search = document.forms.searchForm;
    this._search.searchButton.addEventListener("click", this._handleSearch);

    /* Favorites search */
    this._handleFav = this._handleFav.bind(this);
    this._fav = document.forms.favForm;
    this._fav.favButton.addEventListener("click", this._handleFav);
  }

  /*** Event handlers ***/

  _handleYT() {
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
  }

  _handleDark() {
    let darkMode = document.querySelector("#darkMode");
    if (!this._isDark) {
      darkMode.innerText = "Light Mode";
      document.querySelector("#theme").href = "css/dark.css";
      this._isDark = true;
    } else {
      darkMode.innerText = "Dark Mode";
      document.querySelector("#theme").href = "css/light.css";
      this._isDark = false;
    }
  }

  async _onLogin(idToken) {
    let data = await apiRequest("POST", "/api/google/login", { idToken });
    window.API_KEY = data.apiKey;
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    let allVideos = await apiRequest("GET", "/api/videos");
    for (let videoJSON of allVideos.videos) {
      let video = new Video(videoJSON.title, videoJSON.author, videoJSON.channelId, videoJSON.thumbnail, videoJSON.description);
      video._isLiked = true;
      video._elem.querySelector("#heart").src = "images/red_heart.png";
      document.querySelector("#favVideos").append(video._elem);
    }
  }

  async _handleSearch(event) {
    event.preventDefault();
    let input = document.forms.searchForm.searchInput.value;
    let url = YT_URL + new URLSearchParams({
      part: "snippet",
      q: input,
      key: API_KEY
    });
    let data = await apiRequest("GET", url);
    this._showResults(data);
  }

  async _handleFav(event) {
    event.preventDefault();
    let input = document.forms.favForm.favInput.value;
    let data = await apiRequest("GET", `/api/videos/${input}`);
    if (!input || input === "") {
      alert("Please enter a keyword");
    } else if (!data.videos || data.videos.length === 0) { // no matching video in favorites
      alert("No matches found");
    } else {
      let alertString = `${data.videos.length} matches found with keyword "${input}":`;
      for (let video of data.videos) {
        alertString += `\n${video}`;
      }
      alert(alertString);
    }
  }

  /*** Helper methods ***/

  async _showResults(data) {
    let videos = document.querySelector("#videos");
    while (videos.firstChild) {
      videos.removeChild(videos.firstChild);
    }
    for (let i = 0; i < data.items.length; i++) {
      let snippet = data.items[i].snippet;
      let newVideo = new Video(snippet.title, snippet.channelTitle, CHANNEL_LINK + snippet.channelId, snippet.thumbnails.high.url, snippet.description);
      document.querySelector("#videos").append(newVideo._elem);
    }
  }
}

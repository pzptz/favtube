import apiRequest from "./apirequest.js";

export default class Video {
  // Video object that contains info of one YouTube video
  constructor(title, author, channelId, thumbnail, description) {
    // template duplication
    this._template = document.querySelector(".template");
    this._elem = this._template.cloneNode(true);
    this._elem.classList.remove("template");
    this._elem.querySelector(".title").textContent = title;
    this._elem.querySelector(".youtuber").textContent = author;
    this._elem.querySelector(".youtuber").href = channelId;
    this._elem.querySelector(".thumbnail").src = thumbnail;
    this._elem.querySelector(".description").textContent = description;
    // checks whether video is liked
    this._isLiked = false;
    // handler for like button
    this._handleLike = this._handleLike.bind(this);
    this._elem.querySelector("#heart").addEventListener("click", this._handleLike);
  }

  async _updateFavList(method) {
    let body = {
      title: this._elem.querySelector(".title").textContent,
      author: this._elem.querySelector(".youtuber").textContent,
      channelId: this._elem.querySelector(".youtuber").href,
      thumbnail: this._elem.querySelector(".thumbnail").src,
      description: this._elem.querySelector(".description").textContent
    };
    return await apiRequest(method, "/api/videos", body);
  }

  // Handler that deletes a Card from the page. It also unselects any moving cards, if any.
  async _handleLike(event) {
    let favVideos = document.querySelector("#favVideos");
    if (!this._isLiked) {
      event.currentTarget.src = "images/red_heart.png";
      this._isLiked = true;
      // add video to favorites
      await this._updateFavList("POST");
      favVideos.append(this._elem);
    } else {
      event.currentTarget.src = "images/no_heart.png";
      this._isLiked = false;
      // remove video from favorites
      await this._updateFavList("DELETE");
      favVideos.removeChild(this._elem);
    }
  }
}

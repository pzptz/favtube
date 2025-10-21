## FavTube - YouTube Catalog

Peter Li

## Overview

FavTube is a web app that can be used as a place to search and bookmark YouTube videos. Once the user logs in with their Google account, they can search for YouTube videos in the "Browse Videos" category, which returns 5 results from YouTube at a time. If the user likes a video, they can press the like button (in the shape of a heart) and the video will be moved to the "Favorites" category. The video remains there even after the user logs out, and can be removed by pressing the like button again ("unliking" the video). There is also a dark mode available on the app by pressing the "Dark Mode" button to the left of the login with Google button.

## Running

My project uses the YouTube API, which functions on a specific Client ID and API key tied to my Google account. (This shouldn't be an issue, but just in case!)
There also seems to be a quota of how many YouTube API requests (from using the YouTube search bar), so the YouTube API may return 403 error after an excessive
number of searches.

## Features

1. Login with Google
2. Search for a YouTube video/channel in the "Browse Videos" search bar
3. Like a video from the results from step 2
4. Unlike a video from the "Favorites" category
5. Search for a video in the "Favorites" category. This looks for any video in this category that contain the input keyword
6. Add/remove videos to the "Favorites" category, refresh the page and sign in again
7. Click on the top left icon for a surprise
8. DARK MODE!!!

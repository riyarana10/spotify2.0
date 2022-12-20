require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
var SpotifyWebApi = require("spotify-web-api-node");

const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.clientId1,
  clientSecret: process.env.clientSecret1,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => {
    spotifyApi.setAccessToken(data.body["access_token"]);
  })
  .catch((error) => {
    console.log("Something went wrong when retrieving an access token", error);
  });

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/artists", (req, res, next) => {
  console.log("input is", req.query.input);
  console.log("type is", req.query.type);

  if (req.query.type === "album") {
    spotifyApi.searchAlbums(req.query.input).then(
      function (data) {
        let artist = req.query.input;
        res.render("albums", { albums: data.body.albums.items, name: artist });
      },
      function (err) {
        console.error(err);
      }
    );
  } else if (req.query.type === "track") {
    spotifyApi.searchTracks(req.query.input).then(
      function (data) {
        res.render("tracks", {
          tracks: data.body.tracks.items,
          album: req.query.input,
          artist: req.query.input,
        });
      },
      function (err) {
        console.error(err);
      }
    );
  } else {
    spotifyApi
      .searchArtists(req.query.input)
      .then((data) => {
        res.render("artists", {
          artists: data.body.artists.items,
          artist: req.query.input,
        });
      })
      .catch((err) => {
        console.log("The error while searching artists occurred: ", err);
      });
  }
});

app.get("/albums/:id", (req, res, next) => {
  spotifyApi.getArtistAlbums(req.params.id).then(
    function (data) {
      let artist = req.query.artist;
      res.render("albums", { albums: data.body.items, artist: artist });
    },
    function (err) {
      console.error(err);
    }
  );
});

app.get("/tracks/:id", (req, res, next) => {
  spotifyApi.getAlbumTracks(req.params.id).then(
    function (data) {
      // console.log(data);
      // console.log("tracks data", data.body.items);

      res.render("tracks", {
        tracks: data.body.items,
        album: req.query.album,
        artist: req.query.artist,
      });
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`My Spotify project running!`);
});

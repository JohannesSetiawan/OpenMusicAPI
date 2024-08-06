const mapAlbumDBToModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year: Number(year),
  coverUrl: cover,
});

const mapSongDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumid,
}) => ({
  id,
  title,
  year: Number(year),
  genre,
  performer,
  duration: Number(duration),
  albumId: albumid,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel };

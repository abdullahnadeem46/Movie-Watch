import React from "react";
import "./MovieCard.css";

function MovieCard({
  movie,
  onAddToWatchlist,
  inWatchlist = false,
  onToggleWatched,
  onRate,
  onRemove,
}) {
  // Handle both OMDb format (Title) and database format (title)
  const title = movie.Title || movie.title || "Unknown Title";
  const year = movie.Year || movie.year || "";
  const poster = movie.Poster || movie.poster;
  const imdbID = movie.imdbID || movie.movie_id;

  return (
    <div className={`movie-card ${movie.watched ? "watched" : ""}`}>
   
      <div className="movie-poster-container">
        {poster && poster !== "N/A" ? (
          <img
            src={poster}
            alt={title}
            className="movie-poster"
            onError={(e) => {
              e.target.onerror = null;
              e.target.parentElement.innerHTML =
                '<div class="no-poster">No Poster Available</div>';
            }}
          />
        ) : (
          <div className="no-poster">No Poster Available</div>
        )}
      </div>

      {/* Movie Info */}
      <div className="movie-info">
        <h3 className="movie-title" title={title}>
          {title}
        </h3>
        {year && <p className="movie-year">{year}</p>}

        {!inWatchlist ? (
          // Search page button
          <button
            onClick={() => onAddToWatchlist(movie)}
            className="add-button"
          >
            Add to Watchlist
          </button>
        ) : (
          // Watchlist page controls
          <div className="watchlist-controls">
            <label className="watched-checkbox">
              <input
                type="checkbox"
                checked={movie.watched || false}
                onChange={() => onToggleWatched(movie.id, movie.watched)}
              />
              <span>{movie.watched ? "Watched" : "Mark as watched"}</span>
            </label>

            <select
              className="rating-select"
              value={movie.rating || ""}
              onChange={(e) =>
                onRate(movie.id, e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Rate this movie</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {"⭐".repeat(num)} {num}/5
                </option>
              ))}
            </select>

            <button
              className="remove-button"
              onClick={() => onRemove(movie.id, title)}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;

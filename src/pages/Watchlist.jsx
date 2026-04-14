import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import {
  getWatchlist,
  updateMovieStatus,
  removeFromWatchlist,
} from "../services/watchlistService";
import "./Watchlist.css";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const { user } = useUser();

  // Load watchlist when component mounts
  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getWatchlist(user.id);

      if (result.success) {
        setWatchlist(result.data);
      } else {
        setError(result.error || "Failed to load watchlist");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWatched = async (id, currentStatus) => {
    // Update UI immediately
    setWatchlist(
      watchlist.map((movie) =>
        movie.id === id ? { ...movie, watched: !currentStatus } : movie,
      ),
    );

    const result = await updateMovieStatus(id, { watched: !currentStatus });

    if (result.success) {
      setMessage({
        text: !currentStatus ? "Marked as watched!" : "Marked as unwatched!",
        type: "success",
      });
    } else {
      // Revert on error
      setWatchlist(
        watchlist.map((movie) =>
          movie.id === id ? { ...movie, watched: currentStatus } : movie,
        ),
      );
      setMessage({
        text: "Failed to update status",
        type: "error",
      });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const handleRating = async (id, rating) => {
    // Store original for revert
    const originalMovie = watchlist.find((m) => m.id === id);

    // Update UI immediately
    setWatchlist(
      watchlist.map((movie) =>
        movie.id === id ? { ...movie, rating } : movie,
      ),
    );

    const result = await updateMovieStatus(id, { rating });

    if (!result.success) {
      // Revert on error
      setWatchlist(
        watchlist.map((movie) => (movie.id === id ? originalMovie : movie)),
      );
      setMessage({
        text: "Failed to update rating",
        type: "error",
      });
    } else {
      setMessage({
        text: "Rating updated!",
        type: "success",
      });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove "${title}" from your watchlist?`)) return;

    // Store for potential revert
    const removedMovie = watchlist.find((m) => m.id === id);

    // Update UI immediately
    setWatchlist(watchlist.filter((movie) => movie.id !== id));

    const result = await removeFromWatchlist(id);

    if (result.success) {
      setMessage({
        text: `"${title}" removed from watchlist`,
        type: "success",
      });
    } else {
      // Revert on error
      setWatchlist([...watchlist, removedMovie]);
      setMessage({
        text: "Failed to remove movie",
        type: "error",
      });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  // Calculate statistics
  const watchedCount = watchlist.filter((m) => m.watched).length;
  const totalMovies = watchlist.length;
  const unwatchedCount = totalMovies - watchedCount;
  const ratedMovies = watchlist.filter((m) => m.rating);
  const averageRating =
    ratedMovies.length > 0
      ? (
          ratedMovies.reduce((acc, m) => acc + m.rating, 0) / ratedMovies.length
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={loadWatchlist} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <h1 className="watchlist-title">My Watchlist</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {watchlist.length > 0 ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalMovies}</div>
              <div className="stat-label">Total Movies</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{watchedCount}</div>
              <div className="stat-label">Watched</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{unwatchedCount}</div>
              <div className="stat-label">To Watch</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{averageRating} ⭐</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>

          <div className="movies-grid">
            {watchlist.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                inWatchlist={true}
                onToggleWatched={handleToggleWatched}
                onRate={handleRating}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-watchlist">
          <div className="empty-icon">🎬</div>
          <h2>Your watchlist is empty</h2>
          <p>Start building your collection by searching for movies!</p>
          <Link to="/" className="browse-button">
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
}

export default Watchlist;

import React, { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import MovieCard from "../components/MovieCard";
import Select from "react-select";
import { addToWatchlist } from "../services/watchlistService";
import "./Search.css";

function Search() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // ✅ NEW

  const selectRef = useRef(null);
  const { isSignedIn, user } = useUser();

  // Fetch suggestions
  const fetchSuggestions = async (searchValue) => {
    if (!searchValue || searchValue.length < 2) {
      setOptions([]);
      return [];
    }

    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchValue}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === "True") {
        const newOptions = data.Search.map((movie) => ({
          value: movie.imdbID,
          label: `${movie.Title} (${movie.Year})`,
          movie: movie,
        }));

        // 🔥 Add "Search for..." option at top
        const searchOption = {
          value: "search-all",
          label: `Search for "${searchValue}"`,
          isSearchOption: true,
        };

        setOptions([searchOption, ...newOptions]);
        return newOptions;
      } else {
        setOptions([]);
        return [];
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setOptions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch movies
  const fetchMovies = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchQuery}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === "True") {
        setMovies(data.Search);
      } else {
        setError(data.Error);
        setMovies([]);
      }
    } catch (err) {
      setError("Failed to search movies");
    } finally {
      setLoading(false);
    }
  };

  // Typing handler
  const handleInputChange = (value, actionMeta) => {
    setInputValue(value || "");

    if (actionMeta.action === "input-change" && value?.length >= 2) {
      fetchSuggestions(value);
    } else if (actionMeta.action === "input-change") {
      setOptions([]);
    }
  };

  // Selecting option
  const handleSelect = async (selectedOption) => {
    if (!selectedOption) return;

    // 🔥 If user clicked "Search for..."
    if (selectedOption.isSearchOption) {
      setOptions([]);
      fetchMovies(inputValue);
      return;
    }

    // Normal movie selection
    setInputValue(selectedOption.label);
    setOptions([]);

    if (selectRef.current) {
      selectRef.current.blur();
    }

    await fetchMovies(selectedOption.movie.Title);
  };

  const handleAddToWatchlist = async (movie) => {
    if (!user) {
      setMessage({ text: "Please sign in first!", type: "error" });
      return;
    }

    const result = await addToWatchlist(user.id, movie);

    if (result.success) {
      setMessage({ text: result.message, type: "success" });
    } else {
      setMessage({ text: result.error, type: "error" });
    }

    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Button search
  const handleSearchClick = () => {
    const searchQuery = inputValue.trim();
    if (searchQuery) {
      setOptions([]);
      fetchMovies(searchQuery);
    }
  };

  // ✅ FIXED Enter behavior
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // 🚫 If dropdown open → let react-select handle it
      if (menuOpen) return;

      e.preventDefault();

      const searchQuery = inputValue.trim();
      if (searchQuery) {
        setOptions([]);
        fetchMovies(searchQuery);
      }
    }
  };

  return (
    <div className="search-container">
      <h1 className="search-title">Search Movies</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="search-form">
        <div onKeyDown={handleKeyDown} style={{ flex: 1 }}>
          <Select
            ref={selectRef}
            options={options}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            inputValue={inputValue}
            // ✅ NEW FIXES
            menuIsOpen={options.length > 0}
            onMenuOpen={() => setMenuOpen(true)}
            onMenuClose={() => setMenuOpen(false)}
            filterOption={null}
            placeholder="Search for a movie..."
            noOptionsMessage={({ inputValue }) =>
              inputValue && inputValue.length >= 2
                ? "No movies found"
                : "Type at least 2 characters..."
            }
            isLoading={isLoading}
            blurInputOnSelect={true}
            openMenuOnClick={false}
            openMenuOnFocus={false}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#1f1f1f",
                borderColor: "#333",
                borderRadius: "100px",
                padding: "4px 8px",
                "&:hover": { borderColor: "#e50914" },
              }),
              input: (base) => ({
                ...base,
                color: "white",
                "& input": { color: "white !important" },
              }),
              placeholder: (base) => ({
                ...base,
                color: "#666",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#1f1f1f",
                border: "1px solid #333",
                borderRadius: "12px",
                marginTop: "8px",
                zIndex: 1000,
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected
                  ? "#e50914"
                  : isFocused
                    ? "#2a2a2a"
                    : "#1f1f1f",
                color: "white",
                cursor: "pointer",
              }),
              singleValue: (base) => ({
                ...base,
                color: "white",
              }),
            }}
          />
        </div>

        <button
          type="button"
          className="search-button"
          disabled={loading}
          onClick={handleSearchClick}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {!isSignedIn && (
        <p className="signin-prompt">
          Sign in to add movies to your watchlist!
        </p>
      )}

      {loading && <p className="loading-text">Searching...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            onAddToWatchlist={handleAddToWatchlist}
          />
        ))}
      </div>
    </div>
  );
}

export default Search;

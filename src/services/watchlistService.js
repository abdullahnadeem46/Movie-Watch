import { supabase } from "../lib/supabase"; // ✅ Make sure this path is correct!

export async function addToWatchlist(userId, movie) {
  try {
    const { data: existing, error: checkError } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .eq("movie_id", movie.imdbID)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      return {
        success: false,
        error: "Movie is already in your watchlist!",
      };
    }

    const { data, error } = await supabase
      .from("watchlist")
      .insert([
        {
          user_id: userId,
          movie_id: movie.imdbID,
          title: movie.Title,
          poster: movie.Poster !== "N/A" ? movie.Poster : null,
          genre: movie.Genre  || null,
          watched: false,
          rating: null,
        },
      ])
      .select();

    if (error) throw error;

    return {
      success: true,
      message: `"${movie.Title}" added to watchlist!`,
    };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return {
      success: false,
      error: error.message || "Failed to add movie",
    };
  }
}

export async function getWatchlist(userId) {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMovieStatus(id, updates) {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error updating movie:", error);
    return { success: false, error: error.message };
  }
}

export async function removeFromWatchlist(id) {
  try {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error removing movie:", error);
    return { success: false, error: error.message };
  }
}


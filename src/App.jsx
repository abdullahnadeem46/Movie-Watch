//import router-dom for linking and routing btw pages
import { Routes, Route } from "react-router-dom"; 
import { useUser } from "@clerk/clerk-react";

//All routes
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/navbar"; 
import "./App.css"; 

function App() {
  const { isSignedIn } = useUser();

  return (
    <div className="app">
      {" "}
     
      <Navbar /> 
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

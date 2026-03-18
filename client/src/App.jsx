import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import Register from "./pages/Register";
import Leaderboard from "./pages/Leaderboard";
import Forum from "./pages/Forum";
import Results from "./pages/Results";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game" element={<Game />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
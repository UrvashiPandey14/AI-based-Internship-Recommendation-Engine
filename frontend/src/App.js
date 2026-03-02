import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./pages/ThemeToggle";
import { ProfileProvider } from "./pages/ProfileContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recommend from "./pages/Recommend";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

function App() {
  return (
  <ProfileProvider>
   <ThemeProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
      </Routes>
    </Router>
   </ThemeProvider>
   </ProfileProvider>
  );
}

export default App;

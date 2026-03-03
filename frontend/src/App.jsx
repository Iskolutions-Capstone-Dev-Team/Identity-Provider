import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/pages/Login";
import Callback from "./auth/pages/Callback";
import Unauthorized from "./auth/pages/Unauthorized";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/401" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}
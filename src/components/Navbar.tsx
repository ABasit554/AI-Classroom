import "./Navbar.css";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" aria-label="Class Connect home">
          <img src="/logo.png" alt="Class Connect Logo" />
          <span>Class Connect</span>
        </Link>

        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Calendar
            </NavLink>
          </li>
          <li>
            <NavLink to="/helpwise" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Helpwise
            </NavLink>
          </li>
          <li>
            <NavLink to="/enrolled" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Enrolled
            </NavLink>
          </li>
          <li>
            <NavLink to="/todo" className={({ isActive }) => (isActive ? "active" : undefined)}>
              To-do
            </NavLink>
          </li>
        </ul>

        <div className="nav-buttons">
          {!user ? (
            <>
              <Link to="/login" className="login-btn">Log In</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </>
          ) : (
            <>
              <span className="nav-user" title={user.email}>
                Hi, {user.name.split(" ")[0]}
              </span>
              <button className="login-btn" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

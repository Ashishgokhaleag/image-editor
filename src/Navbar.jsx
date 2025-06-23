import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          MyApp
        </Link>
        <nav className="nav-links">
          <Link to="/">Tool 1</Link>
          <Link to="/tool">Tool 2</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

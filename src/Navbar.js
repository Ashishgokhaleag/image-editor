// src/Navbar.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css"; // Optional, for styling

const Navbar = () => (
  <nav className="navbar">
    <NavLink to="/" className="nav-link" end>Home</NavLink>
    <NavLink to="/druid" className="nav-link">Druid</NavLink>
    <NavLink to="/VideoScreen" className="nav-link">Video Screen</NavLink>
    <NavLink to="/iframe" className="nav-link">Superset Iframe</NavLink>
    <NavLink to="/pivot" className="nav-link">Pivot Table</NavLink>
  </nav>
);

export default Navbar;
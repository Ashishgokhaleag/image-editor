import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ObjectExtractorTensor from "./extractorTensorFlow";
import OpenCVObjectExtractor from "./ExtractorCv.jsx";
import Navigation from "./navigation.jsx";
import UIExtractor from "./UIExtractor.jsx";
import Navbar from "./Navbar.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route excat path="/" element={<UIExtractor />} />
      <Route path="/tool" element={<OpenCVObjectExtractor />} />
      {/* <Route path="/opencv" element={<ObjectExtractorTensor />} /> */}
    </Routes>
  </BrowserRouter>
);

reportWebVitals();

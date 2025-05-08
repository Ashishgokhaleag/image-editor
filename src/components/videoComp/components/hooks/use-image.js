import { useState, useEffect } from "react";

// Custom hook to load images for Konva
const useImage = (src, crossOrigin) => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!src) {
      setStatus("failed");
      return;
    }

    const img = new Image();

    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    } else {
      img.crossOrigin = "anonymous";
    }

    const onLoad = () => {
      setImage(img);
      setStatus("loaded");
    };

    const onError = () => {
      setImage(null);
      setStatus("failed");
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);

    img.src = src;

    return () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [src, crossOrigin]);

  return [image, status];
};

export default useImage;

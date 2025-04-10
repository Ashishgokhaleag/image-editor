import React, { useState } from "react";
import DesktopToMobileToggle from "../components/videoComp/DesktopMobileToggle";
import MobileFrame from "../components/videoComp/MobileFrame";
import VideoEditor from "../components/videoComp/VideoEditio";

const VideoScreen = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200`}
    >
      <DesktopToMobileToggle
        isMobileView={isMobileView}
        toggleView={setIsMobileView}
        isDarkMode={isDarkMode}
        toggleTheme={setIsDarkMode}
      />

      <div
        className={`mt-4 ${
          isMobileView ? "w-full max-w-md" : "w-full max-w-5xl"
        }`}
      >
        {isMobileView ? (
          <MobileFrame isDarkMode={isDarkMode}>
            <VideoEditor isDarkMode={isDarkMode} />
          </MobileFrame>
        ) : (
          <div
            className={`${
              isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"
            }  rounded-lg p-4 shadow-xl h-[80vh] `}
          >
            <VideoEditor isDarkMode={isDarkMode} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoScreen;

// import React, { useState } from "react";
// import DesktopToMobileToggle from "../components/videoComp/DesktopMobileToggle";
// import MobileFrame from "../components/videoComp/MobileFrame";
// import VideoEditor from "../components/videoComp/VideoEditio";

// const VideoScreen = () => {
//   const [isMobileView, setIsMobileView] = useState(false);
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const [media, setMedia] = useState({
//     file: null,
//     url: null,
//     type: null,
//   });

//   const handleUpload = (file) => {
//     const url = URL.createObjectURL(file);
//     const type = file.type.startsWith("image/") ? "image" : "video";

//     setMedia({
//       file,
//       url,
//       type,
//     });
//   };

//   const handleReset = () => {
//     if (media.url) {
//       URL.revokeObjectURL(media.url);
//     }
//     setMedia({
//       file: null,
//       url: null,
//       type: null,
//     });
//   };

//   return (
//     <div
//       className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-200`}
//     >
//       <DesktopToMobileToggle
//         isMobileView={isMobileView}
//         toggleView={setIsMobileView}
//         isDarkMode={isDarkMode}
//         toggleTheme={setIsDarkMode}
//       />

//       <div
//         className={`mt-4 ${
//           isMobileView ? "w-full max-w-md" : "w-full max-w-5xl"
//         }`}
//       >
//         {isMobileView ? (
//           <MobileFrame isDarkMode={isDarkMode}>
//             <VideoEditor isDarkMode={isDarkMode} handleUpload={handleUpload} media={media} handleReset={handleReset} />
//           </MobileFrame>
//         ) : (
//           <div
//             className={`${
//               isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"
//             }  rounded-lg p-4 shadow-xl h-[80vh] `}
//           >
//             <VideoEditor isDarkMode={isDarkMode} handleUpload={handleUpload} media={media}  handleReset={handleReset} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VideoScreen;

import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import UploadCard from "../components/videoComp/UploadCard";
import Editor from "../components/videoComp/components/Editor";
// import Header from "@/components/layout/Header";

const VideoScreen = () => {
  const { toast } = useToast();
  const [media, setMedia] = useState({
    file: null,
    url: null,
    type: null,
  });

  const handleUpload = (file) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/") ? "image" : "video";

    setMedia({
      file,
      url,
      type,
    });
  };

  const handleReset = () => {
    if (media.url) {
      URL.revokeObjectURL(media.url);
    }
    setMedia({
      file: null,
      url: null,
      type: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-editor-dark text-white">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-center">
        {media.url ? (
          <Editor
            mediaUrl={media.url}
            mediaName={media.file?.name || "Untitled"}
            onBack={handleReset}
            mediaType={media.type}
          />
        ) : (
          <div className="w-full max-w-xl mx-auto">
            <UploadCard onUpload={handleUpload} />
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoScreen;

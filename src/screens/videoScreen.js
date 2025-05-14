
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

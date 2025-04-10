import EditorToolbar from "./EditorToolbar";

const VideoEditor = ({ isDarkMode }) => {
  const handleToolSelect = () => {
    console.log("tool clicked");
  };
  return (
    <div
    className={`flex flex-col h-full relative ${
      isDarkMode ? "bg-black text-white" : "bg-white text-black"
    }`}
  >
    <div className="flex flex-col justify-between flex-grow">
      <div className="flex-grow"></div> {/* This will take up all the available space */}
      <EditorToolbar onToolSelect={handleToolSelect} isDarkMode={isDarkMode} />
    </div>
  </div>
  
  );
};

export default VideoEditor;

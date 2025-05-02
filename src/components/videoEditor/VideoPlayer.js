const VideoPlayer = ({ videoUrl }) => {
    return videoUrl ? <video src={videoUrl} controls width="600" /> : <p>No video selected</p>;
  };
  
  export default VideoPlayer;
  
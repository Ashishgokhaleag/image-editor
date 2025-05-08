const VideoExporter = ({ videoUrl }) => {
    const handleDownload = () => {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = "edited-video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  
    return <button onClick={handleDownload}>Download Video</button>;
  };
  
  export default VideoExporter;
  
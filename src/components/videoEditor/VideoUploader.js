import { useState } from 'react';

const VideoUploader = ({ onUpload }) => {
  const [videoUrl, setVideoUrl] = useState(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    setVideoUrl(URL.createObjectURL(file));
    onUpload(file);
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      {videoUrl && <video src={videoUrl} controls width="600" />}
    </div>
  );
};

export default VideoUploader;

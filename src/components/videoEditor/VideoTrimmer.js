import { useState } from 'react';

const VideoTrimmer = ({ video, onTrimmed }) => {
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(10);

  const handleTrim = () => {
    const worker = new Worker(new URL('../../screens/ffmpegWorker', import.meta.url));

    worker.postMessage({ command: "trim", video, start, duration });

    worker.onmessage = (e) => {
      const trimmedBlob = new Blob([e.data.buffer], { type: 'video/mp4' });
      onTrimmed(URL.createObjectURL(trimmedBlob));
    };
  };

  return (
    <div>
      <label>Start Time (s):</label>
      <input type="number" value={start} onChange={(e) => setStart(e.target.value)} />
      
      <label>Duration (s):</label>
      <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
      
      <button onClick={handleTrim}>Trim Video</button>
    </div>
  );
};

export default VideoTrimmer;

import { useState } from 'react';
import VideoUploader from '../components/videoEditor/VideoUploader';
import VideoPlayer from '../components/videoEditor/VideoPlayer';
import VideoTrimmer from '../components/videoEditor/VideoTrimmer';
import VideoExporter from '../components/videoEditor/VideoExporter';

function VideoEditorScreen() {
  const [video, setVideo] = useState(null);
  const [editedVideoUrl, setEditedVideoUrl] = useState(null);

  return (
    <div>
      <h1>React Video Editor</h1>
      <VideoUploader onUpload={setVideo} />
      {video && <VideoTrimmer video={video} onTrimmed={setEditedVideoUrl} />}
      <VideoPlayer videoUrl={editedVideoUrl || (video && URL.createObjectURL(video))} />
      {editedVideoUrl && <VideoExporter videoUrl={editedVideoUrl} />}
    </div>
  );
}

export default VideoEditorScreen;

import React, { useState, useEffect } from 'react';
import Nouislider from 'nouislider-react';
import 'nouislider/distribute/nouislider.css';

let ffmpeg;

const TrimVideo = ({ mediaRef, mediaUrl, onTrimComplete }) => {
  console.log("mediaRef>>>>", mediaRef)
  const [videoDuration, setVideoDuration] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [videoTrimmedUrl, setVideoTrimmedUrl] = useState('');

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((onFulfilled, _) => {
        const script = document.createElement('script');
        let loaded;
        script.async = 'async';
        script.defer = 'defer';
        script.setAttribute('src', src);
        script.onreadystatechange = script.onload = () => {
          if (!loaded) {
            console.log('Script loaded successfully');
            onFulfilled(script);
          }
          loaded = true;
        };
        script.onerror = function () {
          console.log('Script failed to load');
        };
        document.getElementsByTagName('head')[0].appendChild(script);
      });
    };

    loadScript('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js').then(() => {
      if (typeof window !== 'undefined') {
        ffmpeg = window.FFmpeg.createFFmpeg({ log: true });
        ffmpeg.load().then(() => {
          console.log('FFmpeg loaded successfully');
          setIsScriptLoaded(true);
        }).catch((error) => {
          console.error('Error loading FFmpeg:', error);
        });
      }
    });
  }, []);

  const handleTrim = async () => {
    if (!isScriptLoaded) {
      console.log('FFmpeg is not loaded');
      return;
    }

    try {
      const response = await fetch(mediaUrl);
      const videoData = await response.arrayBuffer();
      const videoFileName = 'input.mp4';

      console.log('Writing file to memory:', videoFileName);
      ffmpeg.FS('writeFile', videoFileName, new Uint8Array(videoData));

      console.log('Running FFmpeg command to trim video');
      await ffmpeg.run('-i', videoFileName, '-ss', `${convertToHHMMSS(startTime)}`, '-to', `${convertToHHMMSS(endTime)}`, '-acodec', 'copy', '-vcodec', 'copy', 'out.mp4');

      console.log('Reading trimmed video file');
      const data = ffmpeg.FS('readFile', 'out.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      setVideoTrimmedUrl(url);
      onTrimComplete(url);
    } catch (error) {
      console.error('Error during trimming process:', error);
    }
  };

  const convertToHHMMSS = (val) => {
    const secNum = parseInt(val, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    let time;
    if (hours === '00') {
      time = minutes + ':' + seconds;
    } else {
      time = hours + ':' + minutes + ':' + seconds;
    }
    return time;
  };

  return (
    <div>
      <video src={mediaUrl} controls onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)} />
      <Nouislider
        behaviour="tap-drag"
        step={1}
        margin={3}
        limit={30}
        range={{ min: 0, max: videoDuration || 2 }}
        start={[0, videoDuration || 2]}
        connect
        onUpdate={(values, handle) => {
          let readValue = values[handle] | 0;
          if (handle) {
            setEndTime(readValue);
          } else {
            setStartTime(readValue);
          }
        }}
      />
      <button onClick={handleTrim}>Trim</button>
      {videoTrimmedUrl && (
        <div>
          <h3>Trimmed Video</h3>
          <video controls src={videoTrimmedUrl} />
        </div>
      )}
    </div>
  );
};

export default TrimVideo;
import { FFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg();

onmessage = async (e) => {
  try {
    console.log("We are in trim command");
    if (!ffmpeg.loaded) await ffmpeg.load();
    console.log("We are in trim command1");
    const { command, video, start, duration } = e.data;
    console.log(command, video, start, duration);
    if (command === "trim") {
      // Convert video file to Uint8Array
      const videoData = new Uint8Array(await video.arrayBuffer());
      console.log(videoData);
      await ffmpeg.writeFile('input.mp4', videoData);
      console.log("llll");
      await ffmpeg.exec(['-i', 'input.mp4', '-ss', start.toString(), '-t', duration.toString(), 'output.mp4']);
      console.log("l");
      const trimmedVideo = await ffmpeg.readFile('output.mp4');
      console.log('lllll',trimmedVideo);
      postMessage(trimmedVideo);
 
   
  }
} catch (error) {
  console.log("Error",error);
}
};
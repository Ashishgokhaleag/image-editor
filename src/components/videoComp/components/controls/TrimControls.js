import { useState, useEffect } from "react"
import Nouislider from "nouislider-react"
import "nouislider/distribute/nouislider.css"
import { Button } from "../../../ui/Buttons"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../../../ui/alert"

// Minimum video duration in seconds
const MIN_VIDEO_DURATION = 3

const TrimVideo = ({ mediaRef, mediaUrl, onTrimComplete }) => {
  const [videoDuration, setVideoDuration] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [videoTrimmedUrl, setVideoTrimmedUrl] = useState("")
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTooShortAlert, setShowTooShortAlert] = useState(false)
  const [ffmpeg, setFFmpeg] = useState(null)

  // Load FFmpeg script
  useEffect(() => {
    const loadScript = async (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script")
        script.async = true
        script.defer = true
        script.src = src
        script.onload = () => resolve(script)
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }

    const initFFmpeg = async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js")
        if (window.FFmpeg) {
          console.log("FFmpeg script loaded successfully")
          setIsScriptLoaded(true)

          const ffmpegInstance = window.FFmpeg.createFFmpeg({ log: true })
          try {
            await ffmpegInstance.load()
            setFFmpeg(ffmpegInstance)
            setIsFFmpegLoaded(true)
            console.log("FFmpeg loaded successfully")
          } catch (error) {
            console.error("Error loading FFmpeg:", error)
          }
        } else {
          console.error("FFmpeg not available in window object")
        }
      } catch (error) {
        console.error("Error loading FFmpeg script:", error)
      }
    }

    initFFmpeg()

    return () => {
      // Cleanup if needed
      if (ffmpeg && ffmpeg.isLoaded()) {
        // Clean up any resources if needed
      }
    }
  }, [])

  // Initialize start and end times when video loads
  useEffect(() => {
    if (mediaRef?.current) {
      const loadHandler = () => {
        const duration = mediaRef.current.duration
        setVideoDuration(duration)
        setEndTime(duration)

        // Check if video is too short
        if (duration <= MIN_VIDEO_DURATION) {
          setShowTooShortAlert(true)
        } else {
          setShowTooShortAlert(false)
        }
      }

      mediaRef.current.addEventListener("loadedmetadata", loadHandler)

      // If already loaded
      if (mediaRef.current.readyState >= 2) {
        loadHandler()
      }

      return () => {
        if (mediaRef.current) {
          mediaRef.current.removeEventListener("loadedmetadata", loadHandler)
        }
      }
    }
  }, [mediaRef, mediaUrl])

  const convertToHHMMSS = (val) => {
    const secNum = Number.parseInt(val, 10)
    let hours = Math.floor(secNum / 3600)
    let minutes = Math.floor((secNum - hours * 3600) / 60)
    let seconds = secNum - hours * 3600 - minutes * 60

    if (hours < 10) hours = "0" + hours
    if (minutes < 10) minutes = "0" + minutes
    if (seconds < 10) seconds = "0" + seconds

    return hours === "00" ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`
  }

  const handleTrim = async () => {
    if (!isFFmpegLoaded || !ffmpeg) {
      console.error("FFmpeg is not loaded yet")
      return
    }

    // Validation for selected duration
    const selectedDuration = endTime - startTime
    if (selectedDuration <= MIN_VIDEO_DURATION) {
      setShowTooShortAlert(true)
      return
    }

    try {
      setIsLoading(true)

      // Fetch the video data
      const response = await fetch(mediaUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`)
      }

      const videoData = await response.arrayBuffer()
      const videoFileName = "input.mp4"

      // Write the file to memory
      ffmpeg.FS("writeFile", videoFileName, new Uint8Array(videoData))

      // Run FFmpeg command to trim video
      console.log(`Trimming video from ${convertToHHMMSS(startTime)} to ${convertToHHMMSS(endTime)}`)
      await ffmpeg.run(
        "-i",
        videoFileName,
        "-ss",
        `${convertToHHMMSS(startTime)}`,
        "-to",
        `${convertToHHMMSS(endTime)}`,
        "-c:v",
        "copy",
        "-c:a",
        "copy",
        "out.mp4",
      )

      // Read the trimmed file
      const data = ffmpeg.FS("readFile", "out.mp4")

      // Clean up the previous URL if it exists
      if (videoTrimmedUrl) {
        URL.revokeObjectURL(videoTrimmedUrl)
      }

      // Create a new URL for the trimmed video
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
      setVideoTrimmedUrl(url)
      onTrimComplete(url)

      // Clean up the files from memory
      ffmpeg.FS("unlink", videoFileName)
      ffmpeg.FS("unlink", "out.mp4")
    } catch (error) {
      console.error("Error during trimming process:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format time display for slider
  const formatTimeDisplay = (seconds) => {
    return convertToHHMMSS(seconds)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-medium">Trim Video</h3>

      {showTooShortAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Video Too Short</AlertTitle>
          <AlertDescription>
            {videoDuration <= MIN_VIDEO_DURATION
              ? `This video is only ${videoDuration.toFixed(1)} seconds long. Videos must be longer than ${MIN_VIDEO_DURATION} seconds to trim.`
              : `Selected section is too short. Please select a section longer than ${MIN_VIDEO_DURATION} seconds.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-2">
        <div className="flex justify-between mb-1 text-sm">
          <span>Start: {formatTimeDisplay(startTime)}</span>
          <span>End: {formatTimeDisplay(endTime)}</span>
        </div>

        <Nouislider
          behaviour="tap-drag"
          step={0.1}
          margin={MIN_VIDEO_DURATION} // Set minimum allowed range
          range={{ min: 0, max: videoDuration || 2 }}
          start={[startTime, endTime || videoDuration || 2]}
          connect
          onUpdate={(values, handle) => {
            const readValue = Number.parseFloat(values[handle])
            if (handle === 1) {
              setEndTime(readValue)
            } else {
              setStartTime(readValue)
            }

            // Check if selected range is too short
            const selectedDuration = values[1] - values[0]
            setShowTooShortAlert(selectedDuration < MIN_VIDEO_DURATION)
          }}
          className="mt-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs text-gray-400">Selected duration: {(endTime - startTime).toFixed(1)} seconds</div>

        <Button
          variant="default"
          size="lg"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
          onClick={handleTrim}
          disabled={!isFFmpegLoaded || isLoading || showTooShortAlert}
        >
          {isLoading ? "Processing..." : "Trim Video"}
        </Button>
      </div>

      {videoTrimmedUrl && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Trimmed Preview</h4>
          <video controls src={videoTrimmedUrl} className="w-full rounded-md border border-gray-700" />
        </div>
      )}

      {!isScriptLoaded && <div className="text-amber-500 text-sm mt-2">Loading FFmpeg... Please wait.</div>}
    </div>
  )
}

export default TrimVideo


import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, FilmIcon, XCircle } from "lucide-react";
import { Button } from "../ui/Buttons";
import { useToast } from "../../hooks/use-toast";

const UploadCard = ({ onUpload }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 1,
  });

  const handleClearSelection = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
  };

  const handleConfirmUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="bg-editor-darker rounded-lg border border-gray-800 overflow-hidden shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Upload Media</h2>
        <p className="text-gray-400 mb-6">
          Upload an image or video to start editing
        </p>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 text-center ${
              isDragActive 
                ? "border-primary bg-primary/10" 
                : "border-gray-700 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">
              {isDragActive
                ? "Drop your file here..."
                : "Drag & drop your file here"}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              or click to browse your files
            </p>
            <Button variant="outline" size="sm" className="mx-auto">
              Select File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-black/20">
              <button
                onClick={handleClearSelection}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 z-10 hover:bg-black/80 transition-colors"
              >
                <XCircle className="h-5 w-5 text-white" />
              </button>
              
              {preview && selectedFile?.type.startsWith("image/") && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-60 object-contain"
                />
              )}
              
              {preview && selectedFile?.type.startsWith("video/") && (
                <video
                  src={preview}
                  className="w-full h-60 object-contain"
                  controls
                />
              )}
              
              <div className="p-3 bg-gray-900 flex items-center">
                <div className="mr-3">
                  {selectedFile?.type.startsWith("image/") ? (
                    <File className="h-8 w-8 text-blue-400" />
                  ) : (
                    <FilmIcon className="h-8 w-8 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{selectedFile?.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClearSelection}>
                Cancel
              </Button>
              <Button onClick={handleConfirmUpload}>
                Edit {selectedFile?.type.startsWith("image/") ? "Image" : "Video"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCard;


import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../../ui/Buttons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { EMOJI_CATEGORIES, MARKER_OPTIONS } from "../../../../lib/constants";

const StickerControls = ({
  mediaRef,
  mediaType,
  onClose,
  onAddSticker,
}) => {
  const [selectedTab, setSelectedTab] = useState("emoji");
  const [selectedCategory, setSelectedCategory] = useState("faces");
  const [customText, setCustomText] = useState("");
  const [stickerSize, setStickerSize] = useState(64);
  
  const handleAddEmoji = (emoji) => {
    // Directly add the emoji to the center of the media
    onAddSticker({
      type: "emoji",
      content: emoji,
      position: { x: 50, y: 50 }, // Center of the media
      size: stickerSize
    });
  };
  
  const handleAddMarker = (markerId) => {
    onAddSticker({
      type: "marker",
      content: markerId,
      position: { x: 50, y: 50 },
      size: stickerSize
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onAddSticker({
        type: "image",
        content: reader.result,
        position: { x: 50, y: 50 },
        size: stickerSize
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emoji">Emoji</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          {mediaType === "video" && (
            <TabsTrigger value="markers">Markers</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="emoji" className="space-y-4">
          <div className="flex space-x-1">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_CATEGORIES[selectedCategory].map((emoji) => (
              <Button
                key={emoji}
                variant="outline"
                size="lg"
                onClick={() => handleAddEmoji(emoji)}
                className="text-xl h-10"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sticker-upload">Select image</Label>
            <Label 
              htmlFor="sticker-upload" 
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-700/10"
            >
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-sm text-gray-400">Click to upload</span>
            </Label>
            <Input
              id="sticker-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </TabsContent>
        
        {mediaType === "video" && (
          <TabsContent value="markers" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {MARKER_OPTIONS.map((marker) => (
                <Button
                  key={marker.id}
                  variant="outline"
                  onClick={() => handleAddMarker(marker.id)}
                  className="h-16 flex flex-col"
                >
                  <span className="text-lg mb-1">{marker.icon}</span>
                  <span className="text-xs">{marker.label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default StickerControls;
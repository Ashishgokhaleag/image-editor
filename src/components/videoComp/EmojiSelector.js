const EmojiSelector = ({ onSelect, isDarkMode = true }) => {
    const emojis = ['⭐', '😊', '👍', '👎', '🎨', '⚔️', '☀️', '☁️'];
  
    return (
      <div className={`p-4 ${isDarkMode ? 'bg-black border-t border-gray-800' : 'bg-white border-t border-gray-300'}`}>
        <div className="flex justify-center space-x-4 mb-4">
          {emojis.map((emoji, index) => (
            <button 
              key={index} 
              onClick={() => onSelect(emoji)} 
              className="text-2xl"
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex justify-center space-x-2">
          <button className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded px-4 py-2 text-sm flex items-center`}>
            <span className="mr-2">🖼️</span>
            Select image
          </button>
          <button className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded px-4 py-2 text-sm`}>
            Emoji
          </button>
          <button className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded px-4 py-2 text-sm`}>
            Markers
          </button>
        </div>
      </div>
    );
  };
  
  export default EmojiSelector;
  
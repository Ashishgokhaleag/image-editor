  const AdjustmentSlider = ({ value, onChange, isDarkMode = true }) => {
    const handleChange = (e) => {
      onChange(parseInt(e.target.value));
    };
  
    return (
      <div className="w-full">
        <div className="flex items-center justify-center mb-2">
          <span className="text-lg font-medium">{value}</span>
        </div>
        <div className="relative w-full">
          <input
            type="range"
            min="-100"
            max="100"
            value={value}
            onChange={handleChange}
            className={`w-full h-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg appearance-none cursor-pointer`}
          />
          <div className="w-full flex justify-between text-xs px-2 mt-1">
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className={`h-1 w-1 rounded-full ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></span>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default AdjustmentSlider;
  
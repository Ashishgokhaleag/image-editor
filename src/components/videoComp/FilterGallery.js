const FilterGallery = ({ onSelect, current, isDarkMode = true }) => {
    const filters = [
      { id: 'default', label: 'Default' },
      { id: 'chrome', label: 'Chrome' },
      { id: 'fade', label: 'Fade' },
      { id: 'cold', label: 'Cold' },
      { id: 'warm', label: 'Warm' },
      { id: 'pastel', label: 'Pastel' },
      { id: 'mono', label: 'Mono' },
      { id: 'noir', label: 'Noir' },
      { id: 'stark', label: 'Stark' },
      { id: 'wash', label: 'Wash' }
    ];
  
    return (
      <div className={`p-4 ${isDarkMode ? 'bg-black border-t border-gray-800' : 'bg-white border-t border-gray-300'}`}>
        <div className="flex overflow-x-auto space-x-3 pb-2">
          {filters.map(filter => (
            <div key={filter.id} className="flex-shrink-0">
              <button
                onClick={() => onSelect(filter.id)}
                className={`flex flex-col items-center ${current === filter.id ? 'opacity-100' : 'opacity-70'}`}
              >
                <div className={`w-14 h-14 rounded mb-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} border ${current === filter.id ? 'border-yellow-400' : 'border-transparent'}`}></div>
                <span className="text-xs">{filter.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default FilterGallery;
  

import { useState, RefObject, useEffect } from "react";
import { Button } from "../../../ui/Buttons";
import { Slider } from "../../../ui/slider";
import { Filter as FilterIcon } from "lucide-react";
import { FilterOptions, getFilterStyle } from "../../../../lib/editorUtils";

const FilterControls = ({ 
  mediaRef, 
  mediaType, 
  filterOptions, 
  onFilterChange, 
  onApplyFilter 
}) => {
  const [localFilterOptions, setLocalFilterOptions] = useState(filterOptions);

  // Update local state when prop changes
  useEffect(() => {
    setLocalFilterOptions(filterOptions);
  }, [filterOptions]);

  const filters = [
    { id: "default", name: "Default" },
    { id: "chrome", name: "Chrome" },
    { id: "fade", name: "Fade" },
    { id: "cold", name: "Cold" },
    { id: "warm", name: "Warm" },
    { id: "pastel", name: "Pastel" },
    { id: "mono", name: "Mono" },
    { id: "noir", name: "Noir" },
    { id: "stark", name: "Stark" },
    { id: "wash", name: "Wash" },
  ];

  const handleFilterSelect = (filterId) => {
    // For "default", set to null (no filter)
    const filterName = filterId === "default" ? null : filterId;
    
    const newOptions = {
      ...localFilterOptions,
      name: filterName
    };
    
    setLocalFilterOptions(newOptions);
    onFilterChange(newOptions);
  };

  const handleIntensityChange = (values) => {
    const newOptions = {
      ...localFilterOptions,
      intensity: values[0]
    };
    
    setLocalFilterOptions(newOptions);
    onFilterChange(newOptions);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Filters</h4>
        <div className="grid grid-cols-5 gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => handleFilterSelect(filter.id)}
              className={`aspect-square overflow-hidden rounded-md border transition-all ${
                (localFilterOptions.name === filter.id) || (filter.id === "default" && localFilterOptions.name === null)
                  ? "border-primary" 
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <div 
                className="w-full h-full bg-gray-800 flex items-center justify-center"
                style={{ 
                  filter: getFilterStyle(filter.id),
                }}
              >
                {/* Filter preview - in a real app this would show the actual media with filter applied */}
                <div className="w-full h-full bg-gray-700"></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Filter Intensity</h4>
          <span className="text-xs text-gray-400">{localFilterOptions.intensity}%</span>
        </div>
        <Slider 
          value={[localFilterOptions.intensity]} 
          min={0} 
          max={100} 
          step={1}
          onValueChange={handleIntensityChange}
          className="range-input"
          disabled={!localFilterOptions.name || localFilterOptions.name === "default"}
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2 overflow-x-auto py-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => handleFilterSelect(filter.id)}
            className={`relative group`}
          >
            <div 
              className={`h-16 rounded-md overflow-hidden border-2 transition-all ${
                (localFilterOptions.name === filter.id) || (filter.id === "default" && localFilterOptions.name === null)
                  ? "border-primary" 
                  : "border-transparent group-hover:border-gray-700"
              }`}
              style={{ 
                filter: getFilterStyle(filter.id),
              }}
            >
              {/* Filter thumbnail */}
              <div className="w-full h-full bg-gray-700"></div>
            </div>
            <span className="text-xs text-gray-400 block text-center mt-1">
              {filter.name}
            </span>
          </button>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-800">
        <Button 
          className="w-full"
          onClick={onApplyFilter}
          disabled={!localFilterOptions.name || localFilterOptions.name === "default"}
        >
          <FilterIcon className="h-4 w-4 mr-1" />
          Apply Filter
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;

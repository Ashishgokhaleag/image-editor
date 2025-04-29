export const applyTransformation = (element, options) => {
  let transforms = [];
  let filters = [];

  // Apply crop transformations
  if (options.crop) {
    // Handle rotation
    if (options.crop.rotation !== 0) {
      transforms.push(`rotate(${options.crop.rotation}deg)`);
    }

    // Handle flips
    if (options.crop.flip.horizontal) {
      transforms.push("scaleX(-1)");
    }
    if (options.crop.flip.vertical) {
      transforms.push("scaleY(-1)");
    }
  }

  // Apply filter effects
  if (options.filter && options.filter.name) {
    const filterStyle = getFilterStyle(options.filter.name);
    if (filterStyle !== "none") {
      // Apply intensity
      filters.push(
        adjustFilterIntensity(filterStyle, options.filter.intensity)
      );
    }
  }

 // Apply finetune adjustments if present
 if (options.finetune) {
    const { brightness, contrast, saturation, exposure, gamma, clarity, vignette } = options.finetune;
    let filterString = "";
    
    if (brightness !== 0) {
      filterString += `brightness(${1 + brightness / 100}) `;
    }
    if (contrast !== 0) {
      filterString += `contrast(${1 + contrast / 100}) `;
    }
    if (saturation !== 0) {
      filterString += `saturate(${1 + saturation / 100}) `;
    }
    if (exposure !== 0) {
      filterString += `brightness(${1 + exposure / 100}) `;
    }
    if (gamma !== 0) {
      filterString += `contrast(${1 + gamma / 100}) saturate(${1 + gamma / 200}) `;
    }
    if (clarity !== 0) {
      filterString += `contrast(${1 + clarity / 200}) saturate(${1 + clarity / 100}) `;
    }
    if (vignette !== 0) {
      filterString += `brightness(${1 - Math.abs(vignette) / 200}) `;
    }
    
    element.style.filter = filterString.trim() || "none";
  }

  // Apply resize (this is actually done through width/height properties)
  if (options.resize) {
    element.style.width = `${options.resize.width}px`;
    element.style.height = `${options.resize.height}px`;
    element.style.objectFit = "contain";
  }

  // Combine transforms and filters
  let style = "";
  if (transforms.length > 0) {
    style += `transform: ${transforms.join(" ")};`;
  }
  if (filters.length > 0) {
    style += `filter: ${filters.join(" ")};`;
  }

  // Apply combined style
  element.setAttribute("style", element.getAttribute("style") + style);

  return { transforms, filters };
};

// Get filter CSS based on filter name
export function getFilterStyle(filterId) {
  switch (filterId) {
    case "chrome":
      return "contrast(1.1) saturate(1.1)";
    case "fade":
      return "brightness(1.1) sepia(0.2) contrast(0.9)";
    case "cold":
      return "saturate(0.8) hue-rotate(30deg)";
    case "warm":
      return "sepia(0.3) saturate(1.3)";
    case "pastel":
      return "brightness(1.1) saturate(0.7)";
    case "mono":
      return "grayscale(1)";
    case "noir":
      return "grayscale(1) contrast(1.2) brightness(0.9)";
    case "stark":
      return "contrast(1.5) brightness(0.9)";
    case "wash":
      return "brightness(1.2) saturate(0.7) contrast(0.8)";
    default:
      return "none";
  }
}

// Adjust filter intensity
function adjustFilterIntensity(filterStyle, intensity) {
  // Create a CSS filter parser would be complex, so we'll use a simplified approach
  // This would normally be done with a proper CSS parser
  if (intensity === 100) return filterStyle;

  // For simplicity, we'll just blend the filter with "none" based on intensity
  if (intensity === 0) return "none";

  return filterStyle; // In a real app, you'd apply intensity properly
}

// Calculate new dimensions while maintaining aspect ratio
export function calculateDimensions(
  originalWidth,
  originalHeight,
  targetWidth,
  targetHeight,
  maintainAspectRatio
) {
  if (!maintainAspectRatio) {
    return {
      width: targetWidth || originalWidth,
      height: targetHeight || originalHeight,
    };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  } else if (!targetWidth && targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  } else if (targetWidth && targetHeight) {
    // Maintain aspect ratio based on width
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  }

  return { width: originalWidth, height: originalHeight };
}

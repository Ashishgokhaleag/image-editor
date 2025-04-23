// Check if a value is numeric
const isNumeric = (val) => typeof val === "number" && !isNaN(val);

export const getChartKeys = (data) => {
    if (!data || data.length === 0) return { allKeys: [], xKeys: [], numericKeys: [] };
  
    const keySet = new Set();
    const numericKeyCount = {};
    const totalRows = data.length;
  
    const xKeys = new Set();
  
    for (const row of data) {
      for (const key in row) {
        keySet.add(key);
  
        const value = row[key];
  
        if (isNumeric(value)) {
          numericKeyCount[key] = (numericKeyCount[key] || 0) + 1;
        } else {
          xKeys.add(key);
        }
      }
    }
  
    const numericKeys = Array.from(keySet).filter((key) => {
      return numericKeyCount[key] && numericKeyCount[key] >= totalRows / 2;
    });
  
    return {
      allKeys: Array.from(keySet),     // ✅ All column names
      xKeys: Array.from(xKeys),        // Non-numeric
      numericKeys,                     // Mostly numeric
    };
  };
  
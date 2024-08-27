const uomConversionFactors = {
    // Length UOMs
    "R300_to_M": 300,  // 1 Roll of 300m = 300 Meters
    "R200_to_M": 200,  // 1 Roll of 200m = 200 Meters
    "R150_to_M": 150,  // 1 Roll of 150m = 150 Meters
    "R100_to_M": 100,  // 1 Roll of 100m = 100 Meters
    "R75_to_M": 75,    // 1 Roll of 75m = 75 Meters
    "R25_to_M": 25,    // 1 Roll of 25m = 25 Meters
    "M_to_MM": 1000,   // 1 Meter = 1000 Millimeters
    "M_to_R300": 1 / 300, // 1 Meter = 1/300 Roll of 300m
    "MM_to_M": 1 / 1000, // 1 Millimeter = 0.001 Meter
    "MM_to_R300": 1 / 300000, // 1 Millimeter = 1/300000 Roll of 300m
  
    // Weight UOMs
    "KG1_to_G": 1000,  // 1 KG = 1000 Grams
    "KG0.65_to_G": 650, // 0.65 KG = 650 Grams
    "KG1.5_to_G": 1500, // 1.5 KG = 1500 Grams
    "KG1.8_to_G": 1800, // 1.8 KG = 1800 Grams
    "KG12_to_G": 12000, // 12 KG = 12000 Grams
    "KG15_to_G": 15000, // 15 KG = 15000 Grams
    "KG17_to_G": 17000, // 17 KG = 17000 Grams
    "KG18_to_G": 18000, // 18 KG = 18000 Grams
    "KG2_to_G": 2000,   // 2 KG = 2000 Grams
    "KG20_to_G": 20000, // 20 KG = 20000 Grams
  
    // Volume UOMs
    "L_to_L20": 0.05,  // 1 Litre = 0.05 Roll of 20 Litre
    "L20_to_L": 20,    // 1 Roll of 20 Litre = 20 Litres
    "L_to_L25": 0.04,  // 1 Litre = 0.04 Roll of 25 Litre
    "L25_to_L": 25,    // 1 Roll of 25 Litre = 25 Litres
    "L_to_L30": 0.033, // 1 Litre = 0.033 Roll of 30 Litre
    "L30_to_L": 30,    // 1 Roll of 30 Litre = 30 Litres
    "L20_to_L25": 0.8, // 1 Roll of 20 Litre = 0.8 Roll of 25 Litre
    "L25_to_L30": 0.83 // 1 Roll of 25 Litre = 0.83 Roll of 30 Litre
  };

  const getConversionFactor = (fromUOM, toUOM) => {
    const key = `${fromUOM}_to_${toUOM}`;
    return uomConversionFactors[key] || 1; // Default to 1 if no conversion factor is found
  };
  
  // Function to convert quantity
  export const convertQuantity = (quantity, fromUOM, toUOM) => {
    const conversionFactor = getConversionFactor(fromUOM, toUOM);
    return quantity * conversionFactor;
  };
  
  // Example usage
//   const fromUOM = "R300";
//   const toUOM = "M";
//   const quantity = 2; // 2 Rolls of 300m
  
//   const convertedQuantity = convertQuantity(quantity, fromUOM, toUOM);
//   console.log(`Converted Quantity: ${convertedQuantity} ${toUOM}`); // Output: Converted Quantity: 600 Meters
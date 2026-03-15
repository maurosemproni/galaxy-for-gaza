// src/services/dataService.js

export const fetchKigNames = async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/kig_names.csv`);
    
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    const parsedData = lines.slice(1).map(line => {
      const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      // Indici: 0:id, 1:ar_name, 2:en_name, 3:age, 4:dob, 5:sex, 6:update
      let arName = columns[1] || "";
      let enName = columns[2] || "Unknown";
      let ageRaw = columns[3] || "";

      // Pulizia delle virgolette
      arName = arName.replace(/^"|"$/g, '').trim();
      enName = enName.replace(/^"|"$/g, '').trim();
      
      const ageNum = parseInt(ageRaw.replace(/^"|"$/g, '').trim(), 10);
      
      let displayAge = "N/D";
      if (!isNaN(ageNum)) {
        displayAge = ageNum === 0 ? "less than 1 year" : ageNum.toString();
      }

      return {
        nomeArabo: arName, // <-- Nuovo dato estratto
        nome: enName,
        eta: displayAge
      };
    });

    return parsedData;

  } catch (error) {
    console.error("Si è verificato un errore nel servizio dati:", error);
    return []; 
  }
};
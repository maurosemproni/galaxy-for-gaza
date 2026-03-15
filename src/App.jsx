import { useState, useEffect } from 'react';
import Galaxy from "./components/Galaxy";
import { fetchKigNames } from './services/dataService'; // Assicurati che il percorso sia corretto
import './App.css';

function App() {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    // Creiamo una funzione asincrona interna perché useEffect non può essere direttamente async
    const loadData = async () => {
      const data = await fetchKigNames();
      setCsvData(data);
    };

    loadData();
  }, []);

  return (
    <Galaxy starCount={18457} csvData={csvData} />
  )
}

export default App;
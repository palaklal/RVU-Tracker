import { useState, useEffect } from 'react'
import './App.scss'
import AddForm from './components/add-form.tsx'
import RSVTable from './components/rsv-table.tsx'
import Spinner from './components/spinner.tsx'
import { sortRowsByDate } from './helper-functions/sort.ts'

function App() {
  const [CSVData, setCSVData] = useState<string>('');
  const [CSVObjects, setCSVObjects] = useState<any[]>([]);

/*
TODO: Replace RVU Chips in Add Form with a custom chip that includes number input for Quantity
TODO: Need to revisit how to store and handle user's data because you cannot write to a local file in the browser.
TODO: Need to fix bug where "," in RVU's description causes the CSV to break
TODO: This add form should update/save to the CSV file (add Save button to form)
TODO: Add more analytics, sorting, filtering, color labels for categories to table
TODO: Remove RVU-tracker.csv from git repo so I don't accidentally overwrite a user's data
TODO: Add way to search/type CPT code in dropdown, filtering by date, monthly summaries
?Add menu on side of website to Add CPT codes (this), summarize, display CSV in table (including import and export). Each page will have a different background image.
*/
  
  // Load CSV only on initial page load

  useEffect(() => {
    loadLocalCSV();
  }, []);

  const loadLocalCSV = async () => {
    try {
      console.log('Loading local CSV...');
      const response = await fetch('/src/data/RVU-tracker.csv')
      let localCSV = await response.text();
      if (localCSV.includes('<script')) {
        // If file doesn't exist, create a new one with headers
        const initialCSV = 'id,Date,CPT Code,Description,wRVU,Compensation,Category,Quantity\n';
        setCSVData(initialCSV);
        setCSVObjects([]);
      } else {
        localCSV = sortRowsByDate(localCSV.split('\n').slice(1).filter(Boolean).map((row: string) => row.split(',')));
        localCSV = `ID,Date,CPT Code,Description,wRVU,Compensation,Category,Quantity\n` + localCSV.map((row: any) => row.join(',')).join('\n');
        console.log('Local CSV loaded:', localCSV);
        setCSVData(localCSV);
        const csvRows = localCSV.split('\n').filter(Boolean).map((row: string) => row.split(','));
        const csvObjects = csvRows.slice(1).map((row: string) => {
          return {
            id: row[0],
            Date: row[1],
            'CPT Code': row[2],
            Description: row[3],
            wRVU: parseFloat(row[4]),
            Compensation: parseFloat(row[5]),
            Category: row[6],
            Quantity: parseInt(row[7]) || 1 // Default to 1 if Quantity is not provided
          };
        });
        setCSVObjects(csvObjects);
        console.log('CSVObjects loaded:', csvObjects);
      }
    } catch (error) {
        console.error('Error loading local CSV:', error);
    }
  }

  const updateCSV = (newCSV: any[]) => {
    console.log("Updating CSV with new data:", newCSV);
    setCSVObjects(newCSV);
    // TODO: update/save to local CSV file (and maybe move logic to setCSVData here)
  }

  return (
    <>
      <h1 className="title">RVU Tracker</h1>
      <AddForm CSVData={CSVData} setCSVData={setCSVData} CSVObjects={CSVObjects} setCSVObjects={setCSVObjects} updateCSV={updateCSV}></AddForm>
        {!CSVData && <Spinner />}
        {CSVData && <RSVTable CSVData={CSVData} setCSVData={setCSVData} CSVObjects={CSVObjects} setCSVObjects={setCSVObjects}></RSVTable>}
    </>
  )
}

export default App

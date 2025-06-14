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
TODO: Upon initial load, if there is no local CSV file create a new one
TODO: Need to fix bug where "," in RVU's description causes the CSV to break
TODO: This add form should update/save to the CSV file
TODO: Add more analytics, sorting, filtering, color labels for categories to table
TODO: Remove RVU-tracker.csv from git repo so I don't accidentally overwrite a user's data
TODO: Add way to search/type CPT code in dropdown, ability to add multiple CPTs at the same time, filtering by date, monthly summaries
?Add menu on side of website to Add CPT codes (this), summarize, display CSV in table (including import and export). Each page will have a different background image.
*/
  
  // Load CSV only on initial page load

  useEffect(() => {
    loadLocalCSV();
  }, []);

  const loadLocalCSV = async () => {
    try {
      console.log('Loading local CSV...');
      const response = await fetch('/src/data/RVU-tracker.csv');
      if (!response.ok) {
        // If file doesn't exist, create a new one with headers
        // const initialCSV = 'id,Date,CPT Code,Description,wRVU,Compensation,Category\n';
        // setCSVData(initialCSV);
        // setCSVObjects([]);
      } else {
        let localCSV: any = await response.text()
        localCSV = sortRowsByDate(localCSV.split('\n').slice(1).filter(Boolean).map((row: string) => row.split(',')));
        localCSV = `ID,Date,CPT Code,Description,wRVU,Compensation,Category\n` + localCSV.map((row: any) => row.join(',')).join('\n');
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
            Category: row[6]
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

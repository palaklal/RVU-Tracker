import { useState, useEffect } from 'react'
import './App.scss'
import AddForm from './components/Add Form/add-form.tsx'
import RSVTable from './components/RSV Table/rsv-table.tsx'
import Spinner from './components/Spinner/spinner.tsx'
import { sortRowsByDate } from './helper-functions/sort.ts'

function App() {
  const [CSVData, setCSVData] = useState<string>('');
  const [CSVObjects, setCSVObjects] = useState<any[]>([]);
  const [touched, setTouched] = useState(false); // Track if there are unsaved changes
/*
TODO: Need to fix bug where "," in RVU's description causes the CSV to break
TODO: Fix bug where adding an RVU with the same date and description creates a double entry instead of incrementing quantity
TODO: Add color labels for categories in table and customizable categories, CPTs, etc.
TODO: Add way to filtering by date, monthly summaries, analytics charts/graphs
TODO: Add calendar view for RVUs
TODO: Add pagination to table (and maybe use Material's UI DataGrid, sorting, filtering, etc.)
TODO: Add tooltips
TODO: Add directions (reminding user to save progress & use Chromium browsers) at top
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
        const csvObjects = csvRows.slice(1).map((row: any) => {
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
      <AddForm CSVData={CSVData} setCSVData={setCSVData} CSVObjects={CSVObjects} setCSVObjects={setCSVObjects} updateCSV={updateCSV} touched={touched} setTouched={setTouched}></AddForm>
        {!CSVData && <Spinner />}
        {CSVData && <RSVTable CSVData={CSVData} setCSVData={setCSVData} CSVObjects={CSVObjects} setCSVObjects={setCSVObjects} touched={touched} setTouched={setTouched}></RSVTable>}
    </>
  )
}

export default App

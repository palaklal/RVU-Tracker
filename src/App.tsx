import { useState } from 'react'
import './App.scss'
import AddForm from './components/add-form.tsx'
import RSVTable from './components/rsv-table.tsx';

function App() {
  const [CSVData, setCSVData] = useState<string>('');
  const [CSVObjects, setCSVObjects] = useState<any[]>([]);

/*
TODO: move Form and Table to different components (and Tables to its own box)
TODO: Upon initial load (with loading icon), the should either load the local CSV file or create a new one if it doesn't exist
TODO: This add form should update/save to the CSV file
TODO: Add more analytics, sorting, filtering, delete functionality, color labels for categories to table
?Add menu on side of website to Add CPT codes (this), summarize, display CSV in table (including import and export). Each page will have a different background image.
*/
  

  return (
    <>
      {}
      <h1 className="title">RVU Tracker</h1>
      <AddForm setCSVData={setCSVData} setCSVObjects={setCSVObjects}></AddForm>
        {CSVData && <RSVTable CSVData={CSVData} setCSVData={setCSVData} CSVObjects={CSVObjects} setCSVObjects={setCSVObjects}></RSVTable>}
    </>
  )
}

export default App

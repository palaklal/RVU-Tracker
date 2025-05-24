import { useState } from 'react'
import { FormControl,  InputLabel, NativeSelect } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import CPTs from './data/CPTs'
import './App.scss'

function App() {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [selectedCPT, setSelectedCPT] = useState<any>(null);

/*
Upon initial load, the should either load the local CSV file or create a new one if it doesn't exist
This add form should update/save to the CSV file
Update Add functionality to allow multiple CPT codes to be added per day and multiple days
Add menu on side of website to Add CPT codes (this), summarize, display CSV in table (including import and export). Each page will have a different background image.
*/
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedCPT) return;
    const cptObj = JSON.parse(selectedCPT);
    // Prepare CSV row: Date, CPT Code, Description, wRVU, Compensation, Category
    const row = [
      date.format('YYYY-MM-DD'),
      cptObj['CPT Code'],
      cptObj.Description,
      cptObj.wRVU,
      cptObj.Compensation,
      cptObj.Category
    ];
    const csvContent = `Date,CPT Code,Description,wRVU,Compensation,Category\n${row.map(field => `"${field}"`).join(',')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rvu-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {}
      <h1 className="title">RVU Tracker</h1>
      <form onSubmit={handleSubmit}>
        <FormControl className="form-control" fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker className="date" label="Date of Services Rendered" value={date} onChange={setDate} />
            </LocalizationProvider>        
          </FormControl>
        <FormControl className="form-control" fullWidth>
          <InputLabel variant="standard" htmlFor="CPTCode"> CPT Code </InputLabel>
          <NativeSelect
            value={selectedCPT || ''}
            onChange={e => setSelectedCPT(e.target.value)}
            inputProps={{
              name: 'CPT Code',
              id: 'CPTCode',
            }}
            className="select-input">
            <option value="">Select CPT Code</option>
            {CPTs.map((cpt: any) => (
              <option key={cpt["CPT Code"]} value={JSON.stringify(cpt)}>
                {cpt["CPT Code"]} - {cpt.Description}
              </option>
            ))}
          </NativeSelect>
        </FormControl>
        <button type="submit">ADD</button>
      </form>
      {}
    </>
  )
}

export default App

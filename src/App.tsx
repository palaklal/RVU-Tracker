import { useState } from 'react'
import { FormControl,  InputLabel, NativeSelect, Chip, Table } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Dayjs } from 'dayjs';
import CPTs from './data/CPTs'
import './App.scss'

function App() {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [selectedCPTs, setSelectedCPTs] = useState<any[]>([]);
  const [formStatus, setFormStatus] = useState<any>({text: '', type: ''});
  const [CSVData, setCSVData] = useState<string>('');
  const [CSVObjects, setCSVObjects] = useState<any[]>([]);

  const addSelectedCPTs = (cpt: any) => {
    if (!cpt) return
    else {
      cpt = JSON.parse(cpt)
      cpt.Date = date ? date.format('YYYY-MM-DD') : null
      cpt.id = Math.random();
      if (selectedCPTs.length === 0) setSelectedCPTs([cpt]) 
      else setSelectedCPTs(prev => [...prev, cpt])
    }
  }

/*
TODO: move Form and Table to different components (and Tables to its own box)
TODO: Upon initial load (with loading icon), the should either load the local CSV file or create a new one if it doesn't exist
TODO: This add form should update/save to the CSV file
TODO: Add more analytics, sorting, filtering, delete functionality, color labels for categories to table
?Add menu on side of website to Add CPT codes (this), summarize, display CSV in table (including import and export). Each page will have a different background image.
*/
  const handleSubmit = (e: React.FormEvent) => { // TODO: this doesn't need to do the CSV export, just add the RVUs to the CSVObjects and move CSVContent code to Import/Export button functionality
    e.preventDefault();
    if (!date || !selectedCPTs) return;
    setFormStatus({text: (`Adding ${selectedCPTs.length} RVU` + (selectedCPTs.length > 1 ? 's' : '') + `...`), type: 'loading'});
    try {
      let rows: any[] = [];
      selectedCPTs.forEach((cpt: any) => {
        // Prepare CSV row: ID, Date, CPT Code, Description, wRVU, Compensation, Category
        const row = [
          cpt.id,
          date.format('YYYY-MM-DD'),
          cpt['CPT Code'],
          cpt.Description,
          cpt.wRVU,
          cpt.Compensation,
          cpt.Category
        ];
        rows.push(row);
      });
      const csvContent = `ID,Date,CPT Code,Description,wRVU,Compensation,Category\n`
        + rows.map(row => row.join(',')).join('\n');
      console.log(csvContent);
      setCSVData(csvContent);
      setCSVObjects(selectedCPTs)
      // const blob = new Blob([csvContent], { type: 'text/csv' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'rvu-data.csv';
      // a.click();
      // URL.revokeObjectURL(url);

      setFormStatus({text: (`Added ${selectedCPTs.length} RVU` + (selectedCPTs.length > 1 ? 's' : '') + `! Resetting form...`), type: 'success'});
      setTimeout(() => {
        setFormStatus('')
        setSelectedCPTs([]);
        setDate(null);
      }, 5000);
    } catch (error) {
      console.error("Error adding RVUs", error);
      setFormStatus({text: 'Error adding RVUs. Please try again.', type: 'error'});
    }
  };

  const getCPTChip = (cpt: any) => {
    return cpt.Date + " - " + cpt.Description
  };
  const removeCPTCode = (selectedId: number) => {
    setSelectedCPTs([...selectedCPTs.filter(cpt => cpt.id !== selectedId)]);
    console.log(selectedCPTs)
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
        <FormControl className="form-control" fullWidth disabled={!date}>
          <InputLabel variant="standard" htmlFor="RVU" shrink={true}> RVU </InputLabel>
          <NativeSelect
            value=""
            onChange={e => addSelectedCPTs(e.target.value)}
            inputProps={{
              name: 'RVU',
              id: 'RVU',
            }}>
            <option value=""></option>
            {CPTs.map((cpt: any) => (
              <option key={cpt["CPT Code"]} value={JSON.stringify(cpt)}>
                {cpt["CPT Code"]} - {cpt.Description}
              </option>
            ))}
          </NativeSelect>
        </FormControl>
        <div className="chips-container">
          {selectedCPTs.map((cpt: any) => (
            <Chip key={cpt.id} label={getCPTChip(cpt)} onDelete={() => removeCPTCode(cpt.id)} />
          ))}
        </div>
        <div className="submit-container">
            <button type="submit" disabled={!date || selectedCPTs.length === 0 || (formStatus.type === 'loading' || formStatus.type === 'success')}>
              <AddIcon style={{ marginRight: 4 }} />
              Add RVUs
            </button>
          {formStatus.type && <div className={formStatus.type + " form-status"}>{formStatus.text}</div>}
        </div>
        {CSVData && 
          <div>
            {/* <Divider orientation="horizontal" flexItem /> */}
            <div className="totals">
              <span>
                <Chip className="button" icon={<FileDownloadIcon />} label="Import" variant="outlined" />
                <Chip className="button" icon={<FileUploadIcon />} label="Export" variant="outlined" />
              </span>
              <span><Chip className="info" label={ `Total Compensation: $` + CSVObjects.reduce((acc, cpt) => acc + cpt.Compensation, 0).toFixed(2)} variant="outlined" /></span>
            </div>
          <Table stickyHeader={true} className="cpt-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>CPT Code</th>
                <th>Description</th>
                <th>wRVU</th>
                <th>Compensation</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {CSVObjects.map((cpt: any) => (
                <tr key={cpt.id}>
                  <td>{cpt.Date}</td>
                  <td>{cpt["CPT Code"]}</td>
                  <td>{cpt.Description}</td>
                  <td>{cpt.wRVU.toFixed(2)}</td>
                  <td>${cpt.Compensation.toFixed(2)}</td>
                  <td>{cpt.Category}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>}
      </form>
    </>
  )
}

export default App

import { Chip, Table } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Alert from '@mui/material/Alert';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import InsightsIcon from '@mui/icons-material/Insights';

import { useState } from 'react'

import '../../App.scss'
import './rsv-table.scss'
import { RVU } from "../../types/RVU";

const RSVTable = ({CSVData, setCSVData, CSVObjects, setCSVObjects, touched, setTouched }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => {
      setSuccess(null);
    }, 3000); // Clear message after 3 seconds
  };

  const showErrorMessage = (message: string, error?: any) => {
    console.error(message)
    if (error) console.error(error)
    setError(message);
    setSuccess(null);
  }

  const saveCSV = async () => {
    console.log("Saving CSV data...");
    let fileHandle;
    try {
      if ('showOpenFilePicker' in self) {
        [fileHandle] = await window.showOpenFilePicker();
        const writable = await fileHandle.createWritable();
        await writable.write(CSVData);
        await writable.close();
        if (touched) setTouched(false);
        showSuccessMessage('CSV file saved successfully.');
      } else showErrorMessage('File save not supported in this browser. You can still export the CSV file manually by clicking the Export button and replace the existing file in RVU-Tracker/src/data/RVU-tracker.csv (do not change the name).');
    } catch (error) { showErrorMessage('Error saving CSV file. Please try again.', error) }
  }

  const exportCSV = (): void => {
    try {
      const blob = new Blob([CSVData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rvu-data.csv';
      a.click();
      URL.revokeObjectURL(url);
      showSuccessMessage('CSV file exported successfully.');
    } catch (error) { showErrorMessage('Error exporting CSV file. Please try again.', error) }
  }

  const clickImport = () => {
    const input = document.getElementById('csv-import-input') as HTMLInputElement
    if (input) input.click()   
  }

  const importCSV = (e: any): void => {
      const file = e.target.files[0];
      if (!file) console.error("No file selected for import")
      else if (file.type !== 'text/csv') setError("Selected file is not a CSV file") // TODO: accept other file types, like Excel
      else {
        try {
          const reader = new FileReader();
          reader.onload = (event: any) => {
              const content = event.target.result as string;
              console.log("CSV content loaded:", content);
              // Parse CSV content
              if (!content) console.error("No content in CSV file");
              else { 
                let combinedCSV
                if (CSVData) {
                  // Remove the first line (header) from content before combining the existing CSVData with the new content
                  const contentLines = content.trim().split('\n');
                  const contentWithoutHeader = contentLines.slice(1).join('\n');
                  combinedCSV = `${CSVData.trim()}\n${contentWithoutHeader}`;
                } else combinedCSV = content.trim()
                setCSVData(combinedCSV);
                console.log("CSV data set:", combinedCSV);

                // Convert CSV to objects
                const rows = combinedCSV.split('\n').slice(1).map(row => row.split(','));
                const objects = rows.map((row) => ({
                    id: row[0],
                    Date: row[1],
                    "CPT Code": row[2],
                    Description: row[3],
                    wRVU: parseFloat(row[4]),
                    Compensation: parseFloat(row[5]),
                    Category: row[6],
                    Quantity: parseInt(row[7]) || 1 // Default to 1 if Quantity is not provided
                }));
                setCSVObjects(objects);
                console.log("CSV objects loaded:", objects);
              }
          };
          reader.readAsText(file)
          if (!touched) setTouched(true);
          showSuccessMessage('CSV file imported successfully.');
        } catch (error) { showErrorMessage('Error importing CSV file. Please try again.', error) }
    }
  }

  const [clearModal, setClearModal] = useState(false);
  const setClearModalToTrue = () => {
    console.log("Opening clear table modal")
    setClearModal(true)
  }
  const handleCloseClear = (continueClear: boolean) => {
    if (continueClear) clear()
    setClearModal(false)
  }
  const clear = () => {
    const initialCSV = 'id,Date,CPT Code,Description,wRVU,Compensation,Category,Quantity\n';
    setCSVData(initialCSV);
    setCSVObjects([]);
    if (!touched) setTouched(true);
  }

  const updateQuantity = (id: string | number, value: string | number) => {
    const newQuantity = typeof value === 'string' ? parseInt(value) : value;
    // console.log("Updating quantity for RVU with ID:", id, "to", newQuantity);
    if (isNaN(newQuantity) || newQuantity < 0) return; // Ignore invalid input
    const updatedCSVObjects = CSVObjects.map((cpt: RVU) => 
      cpt.id === id ? { ...cpt, Quantity: newQuantity } : cpt
    );
    setCSVObjects(updatedCSVObjects)
    const updatedCSVData = CSVData
      .split('\n')
      .map(row => {
        const columns = row.split(',');
        if (columns[0] === id) {
          columns[7] = newQuantity.toString(); // Update Quantity column
        }
        return columns.join(',');
      })
      .join('\n');
    if (!touched) setTouched(true);
    setCSVData(updatedCSVData);
    console.log("Updated quantity for RVU with ID:", id, "to", newQuantity);
  }

  const [removeModal, setRemoveModal] = useState(false);
  const [currentRVU, setCurrentRVU] = useState<RVU | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = (value: boolean) => () => {
    setShowSearch(value)
  }

  const handleOpenRemoveModal = (cpt: RVU) => () => {
    cpt = new RVU(cpt.id, cpt.Date, cpt["CPT Code"], cpt.Description, cpt.wRVU, cpt.Compensation, cpt.Category, cpt.Quantity)
    console.log("Opening remove modal for RVU:", cpt.toString());
    setCurrentRVU(cpt);
    setRemoveModal(true);
  };

  const handleClose = (continueRemove: boolean) => () => {
    if (!continueRemove) {
      setCurrentRVU(null)
      setRemoveModal(false)
    } else {
      removeRVU(currentRVU)
    }
  };

  const removeRVU = (oldRVU: RVU) => {
    console.log("Removing RVU:", oldRVU.toString());
    try {
      const updatedCSVObjects = CSVObjects.filter((cpt: RVU) => cpt.id !== RVU.id);
      setCSVObjects(updatedCSVObjects);
      const updatedCSVData = CSVData
        .split('\n')
        .filter((row: any) => !row.startsWith(oldRVU.id)) // Remove the row with the matching ID
        .join('\n');
      setCSVData(updatedCSVData);
      setRemoveModal(false);
      console.log("RVU removed. Updated CSVObjects:", updatedCSVObjects);
      setCurrentRVU(null)
      showSuccessMessage(oldRVU.toString() + ' removed successfully.');
      if (!touched) setTouched(true);
    } catch (error) { showErrorMessage('Error removing ' + oldRVU.toString() + '. Please try again.', error) }
  }

  const sort = (column: string, ascending: boolean) => () => {
    const sortedObjects = [...CSVObjects].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      // Handle Date column
      if (column === "Date") {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }

      // Handle numeric columns
      if (["wRVU", "Compensation", "Quantity"].includes(column)) {
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        return ascending ? numA - numB : numB - numA;
      }

      // Handle string columns (CPT Code, Description, Category, etc.)
      if (typeof valA === "string" && typeof valB === "string") {
        return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      // Fallback
      return 0;
    });
    setCSVObjects(sortedObjects);
    const header = CSVData.split('\n')[0];
    const sortedCSVData = [header, ...sortedObjects.map(cpt => (
      `${cpt.id},${cpt.Date},${cpt["CPT Code"]},${cpt.Description},${cpt.wRVU},${cpt.Compensation},${cpt.Category},${cpt.Quantity}`
    ))].join('\n');
    setCSVData(sortedCSVData);
    console.log(`Sorted by ${column} in ${ascending ? 'ascending' : 'descending'} order.`);
  }

  const filter = (e: any) => {
    const search = e.target.value.toLowerCase();
    const filtered = CSVObjects.filter((cpt: any) =>
      Object.values(cpt).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
    if (search) {
      setCSVObjects(filtered);
    } else {
      // Reset to all data by re-parsing CSVData
      const rows = CSVData.split('\n').slice(1).map(row => row.split(','));
      const objects = rows.map((row) => ({
        id: row[0],
        Date: row[1],
        "CPT Code": row[2],
        Description: row[3],
        wRVU: parseFloat(row[4]),
        Compensation: parseFloat(row[5]),
        Category: row[6],
        Quantity: parseInt(row[7]) || 1
      }));
      setCSVObjects(objects);
    }
  }

  if (!CSVData || !CSVObjects || CSVObjects.length === 0) {
      return <div className="empty-table">No RVUs to display. Please import or add data.</div>;
  }
  return (
      <div>
          {/* <Divider orientation="horizontal" flexItem /> */}
          <div className="totals">
            <span>
              <Chip id="save-button" className={"button " + (touched ? 'tilt-n-move-shaking' : '')} icon={<SaveIcon />} label="Save" variant="outlined" onClick={saveCSV} />
              <input type="file" accept=".csv" style={{ display: "none" }} id="csv-import-input" onChange={importCSV}/>
              <Chip className="button" icon={<FileDownloadIcon />} label="Import" variant="outlined" onClick={clickImport} />
              <Chip className="button" icon={<FileUploadIcon />} label="Export" variant="outlined" onClick={exportCSV} />
              <Chip className="button" icon={<DeleteForeverIcon />} label="Clear" variant="outlined" onClick={setClearModalToTrue} />
            </span>
            <span>
              <Chip className="button" icon={<InsightsIcon />} label="Analytics" variant="outlined" disabled />
              <Chip className="info" label={ `Total Compensation: $` + CSVObjects.reduce((acc: number, cpt: RVU) => acc + cpt.Compensation * (cpt.Quantity || 1), 0).toFixed(2)} variant="outlined" />
            </span>
          </div>
          { error && <Alert variant="filled" severity="error" onClose={() => { setError(null)}}>{error}</Alert> }
          { success && <Alert variant="filled" severity="success" onClose={() => { setSuccess(null)}}>{success}</Alert> }
        <Table stickyHeader={true} className="cpt-table">
          <thead>
            <tr>
              <th>
                <span className="th-container">
                  { !showSearch && <SearchIcon className="searchToggle" title="Show Search Bar" onClick={toggleSearch(true)} /> }
                  { showSearch && <SearchOffIcon className="searchToggle" title="Hide Search Bar" onClick={toggleSearch(false)} /> }
                  Date
                  <span className="sort-icons">
                    <span className="karet" title="Sort Ascending" onClick={sort("Date", true)}>▲</span>
                    <span className="karet" title="Sort Descending" onClick={sort("Date", false)}>▼</span>
                  </span></span>
              </th>
              <th>
                <span className="th-container">
                CPT Code
                <span className="sort-icons">
                  <span className="karet" title="Sort Ascending" onClick={sort("CPT Code", true)}>▲</span>
                  <span className="karet" title="Sort Descending" onClick={sort("CPT Code", false)}>▼</span>
                </span>
                </span>
              </th>
              <th>
                <span className="th-container">
                Description
                <span className="sort-icons">
                  <span className="karet" title="Sort Ascending" onClick={sort("Description", true)}>▲</span>
                  <span className="karet" title="Sort Descending" onClick={sort("Description", false)}>▼</span>
                </span>
                </span>
              </th>
              <th>
                <span className="th-container">
                wRVU
                <span className="sort-icons">
                  <span className="karet" title="Sort Ascending" onClick={sort("wRVU", true)}>▲</span>
                  <span className="karet" title="Sort Descending" onClick={sort("wRVU", false)}>▼</span>
                </span>
                </span>
              </th>
              <th>
                <span className="th-container">
                Compensation
                <span className="sort-icons">
                  <span className="karet" title="Sort Ascending" onClick={sort("Compensation", true)}>▲</span>
                  <span className="karet" title="Sort Descending" onClick={sort("Compensation", false)}>▼</span>
                </span>
                </span>
              </th>
              <th>
                <span className="th-container">
                Category
                <span className="sort-icons">
                  <span className="karet" title="Sort Ascending" onClick={sort("Category", true)}>▲</span>
                  <span className="karet" title="Sort Descending" onClick={sort("Category", false)}>▼</span>
                </span>
                </span>
              </th>
              <th>
                <span className="th-container">
                Quantity
                <span className="sort-icons">
                  <span className="karet" title="Sort Ascending" onClick={sort("Quantity", true)}>▲</span>
                  <span className="karet" title="Sort Descending" onClick={sort("Quantity", false)}>▼</span>
                </span>
                </span>
              </th>
              <th></th>
            </tr>
            { showSearch && <tr>
              <th colSpan={7}>
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-input"
                  onChange={filter}
                />
              </th>
            </tr> }
          </thead>
          <tbody>
            {CSVObjects.map((cpt: RVU) => (
              <tr key={cpt.id}>
                <td >{cpt.Date}</td> 
                <td>{cpt["CPT Code"]}</td>
                <td>{cpt.Description}</td>
                <td>{cpt.wRVU.toFixed(2)}</td>
                <td>${cpt.Compensation.toFixed(2)}</td>
                <td>{cpt.Category}</td>
                <td>
                  <span className="operator" onClick={() => updateQuantity(cpt.id, (cpt.Quantity + 1))}>&#43;</span>
                  <input type="number" min="1" value={cpt.Quantity} onChange={(e) => updateQuantity(cpt.id, e.target.value)} />
                  <span className="operator" onClick={() => { if (cpt.Quantity > 1) updateQuantity(cpt.id, (cpt.Quantity - 1)) }}>&#8722;</span>
                </td>
                <td className="d-flex"><RemoveCircleIcon id="remove-icon" onClick={handleOpenRemoveModal(cpt)} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
        { currentRVU && 
          <Dialog
            open={removeModal}
            onClose={handleClose(false)}
            aria-labelledby="alert-remove-RVU"
            aria-describedby="alert-remove-RVU-row"
            maxWidth="xl"
            className="dialog"
          >
            <DialogContent className="remove-dialog">
              <DialogContentText id="alert-remove-RVU-row">
                Are you sure you want to remove this RVU?
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>CPT Code</th>
                      <th>Description</th>
                      <th>wRVU</th>
                      <th>Compensation</th>
                      <th>Category</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody><tr>
                    <td>{currentRVU.Date}</td>
                    <td>{currentRVU["CPT Code"]}</td>
                    <td>{currentRVU.Description}</td>
                    <td>{currentRVU.wRVU.toFixed(2)}</td>
                    <td>${currentRVU.Compensation.toFixed(2)}</td>
                    <td>{currentRVU.Category}</td>
                    <td>{currentRVU.Quantity}</td>
                </tr></tbody></table>
              </DialogContentText>
            </DialogContent>
            <DialogActions className="remove-dialog">
              <Button onClick={handleClose(false)}>No</Button>
              <Button onClick={handleClose(true)} autoFocus> Yes </Button>
            </DialogActions>
          </Dialog> 
        }
        <Dialog
          open={clearModal}
          onClose={handleCloseClear}
          aria-labelledby="alert-clear-table"
          aria-describedby="alert-clear-table-row"
          maxWidth="xl"
          className="dialog"
        >
          <DialogContent className="remove-dialog">
            <DialogContentText id="alert-clear-table-row">
              Are you sure you want to clear this table?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="remove-dialog">
            <Button onClick={() => handleCloseClear(false)}>No</Button>
            <Button onClick={() => handleCloseClear(true)} autoFocus> Yes </Button>
          </DialogActions>
        </Dialog> 
      </div>
  )
}

export default RSVTable;
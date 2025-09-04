import { Chip, Table } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Alert from '@mui/material/Alert';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

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

  const [clearModal, setClearModal] = useState<boolean>(false);
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

  const getMonthlyAverage = (): string => {
    const totalCompensation = CSVObjects.reduce((acc: number, cpt: RVU) => acc + cpt.Compensation * (cpt.Quantity || 1), 0);
    const dates: Date[] = CSVObjects.map((cpt: RVU) => new Date(cpt.Date as string));
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    const maxDate = new Date(Math.max(...dates.map(date => date.getTime())));
    const months = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1; // +1 to include the current month
    const average = totalCompensation / months;
    return `Average Monthly Compensation: $` + average.toFixed(2);
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

  const [removeModal, setRemoveModal] = useState<boolean>(false);
  const [currentRVU, setCurrentRVU] = useState<RVU | null>(null);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [displayRange, setDisplayRange] = useState<string>('');
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const toggleSearch = (value: boolean) => () => {
    setShowSearch(value)
  }

  // Helper to parse CSVData into objects / Reset all data by re-parsing CSVData
  const parseCSVObjects = () => {
    const rows = CSVData.split('\n').slice(1).map((row: any) => row.split(','));
    return rows.map((row: any) => ({
      id: row[0],
      Date: row[1],
      "CPT Code": row[2],
      Description: row[3],
      wRVU: parseFloat(row[4]),
      Compensation: parseFloat(row[5]),
      Category: row[6],
      Quantity: parseInt(row[7]) || 1
    }));
  };

  // Helper to filter by date range
  const filterByDateRange = (from: Dayjs | null, to: Dayjs | null) => {
    const objects = parseCSVObjects();
    if (!from && !to) {
      setCSVObjects(objects);
      return;
    }
    const filtered = objects.filter((cpt: RVU) => {
      const cptDate = new Date((cpt.Date as string));
      const afterFrom = from ? cptDate >= from.subtract(1, 'day').toDate() : true;
      const beforeTo = to ? cptDate <= to.toDate() : true;
      return afterFrom && beforeTo;
    });
    if (filtered.length === 0) showErrorMessage('No RVUs found in the selected date range. Please try a different range.');
    else setCSVObjects(filtered);
  };

  const filterFromDate = (date: Dayjs | null, DOM?: boolean) => { // DOM indicates if user selected from the DOM input
    setError(null)
    if (DOM) setDisplayRange('Custom')  // clear Preselected Date Range toggle from 'All'
    setFromDate(date);
    filterByDateRange(date, toDate);
  };

  const filterToDate = (date: Dayjs | null, DOM?: boolean) => {
    setError(null)
    if (DOM) setDisplayRange('Custom') // clear Preselected Date Range toggle from 'All'
    setToDate(date);
    filterByDateRange(fromDate, date);
  };

  const updateDisplayRange = (event: React.MouseEvent<HTMLElement>, newRange: string) => {
    setError(null);
    setDisplayRange(newRange);
    const now = new Date();
    let from: Dayjs | null = null;
    let to: Dayjs | null = null;
    if (newRange === '') {
      from = to = null;
      setError(null)
    } else if (newRange === 'Today') {
      from = to = dayjs(now);
    } else if (newRange === 'This Month') {
      from = dayjs(new Date(now.getFullYear(), now.getMonth(), 1));
      to = dayjs(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (newRange === 'Past Month') {
      from = dayjs(now).subtract(1, 'month')
      to = dayjs(now);
    } else if (newRange === 'This Year') {
      from = dayjs(new Date(now.getFullYear(), 0, 1));
      to = dayjs(new Date(now.getFullYear(), 12, 31));
    } else if (newRange === 'Past Year') {
      from = dayjs(now).subtract(1, 'year')
      to = dayjs(now);
    }
    setFromDate(from);
    setToDate(to);
    filterByDateRange(from, to);
  };

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
    ));
    if (search) {
      setCSVObjects(filtered);
    } else parseCSVObjects()
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
            { CSVObjects.length > 0 && <span>
              <Chip className="info" label={ `Total Compensation: $` + CSVObjects.reduce((acc: number, cpt: RVU) => acc + cpt.Compensation * (cpt.Quantity || 1), 0).toFixed(2)} variant="outlined" />
              <Chip className="info" label={ getMonthlyAverage() } variant="outlined" />
            </span> }
          </div>
          { error && <Alert variant="filled" severity="error" onClose={() => { setError(null)}}>{error}</Alert> }
          { success && <Alert variant="filled" severity="success" onClose={() => { setSuccess(null)}}>{success}</Alert> }
          <div className="date-container">
            <span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker slotProps={{ field: { clearable: true, onClear: () => setFromDate(null) }}} className="date" label="From" value={fromDate} onChange={(e) => filterFromDate(e, true)} />
              </LocalizationProvider>
              -
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker slotProps={{ field: { clearable: true, onClear: () => setToDate(null) }}} className="date" label="To" value={toDate} onChange={(e) => filterToDate(e, true)} />
              </LocalizationProvider>
            </span>
            <ToggleButtonGroup
                color="primary"
                value={displayRange}
                exclusive
                onChange={updateDisplayRange}
                aria-label="Show Preselected Date Range"
              >
                <ToggleButton className={"button " + (displayRange === '' ? 'active-show' : '')} value="" aria-label="All">
                 All
                </ToggleButton>
                <ToggleButton className={"button " + (displayRange === 'Today' ? 'active-show' : '')} value="Today" aria-label="Today">
                 Today
                </ToggleButton>
                <ToggleButton className={"button " + (displayRange === 'This Month' ? 'active-show' : '')} value="This Month" aria-label="This Month">
                  This Month
                </ToggleButton>
                <ToggleButton className={"button " + (displayRange === 'Past Month' ? 'active-show' : '')} value="Past Month" aria-label="Past Month">
                  Past Month
                </ToggleButton>
                <ToggleButton className={"button " + (displayRange === 'This Year' ? 'active-show' : '')} value="This Year" aria-label="This Year">
                  This Year
                </ToggleButton>
                <ToggleButton className={"button " + (displayRange === 'Past Year' ? 'active-show' : '')} value="Past Year" aria-label="Past Year">
                  Past Year
                </ToggleButton>              
              </ToggleButtonGroup>
          </div>
        <Table stickyHeader={true} className="cpt-table">
          <thead>
            <tr>
              <th colSpan={1}>
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
                Total Compensation
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
            { showSearch && 
            <tr>
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
                <td>${(cpt.Compensation * (cpt.Quantity || 1)).toFixed(2)}</td>
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
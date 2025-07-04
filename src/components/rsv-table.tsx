import { Chip, Table } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { useState } from 'react'

import '../App.scss'


const RSVTable = ({CSVData, setCSVData, CSVObjects, setCSVObjects}) => {
    const exportCSV = () => {
      const blob = new Blob([CSVData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rvu-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    const clickImport = () => {
        const input = document.getElementById('csv-import-input') as HTMLInputElement
        if (input) input.click()   
      }

    const importCSV = (e: any) => {
        const file = e.target.files[0];
        if (!file) console.error("No file selected for import")
        else if (file.type !== 'text/csv') console.error("Selected file is not a CSV file") // TODO: accept other file types, like Excel
        else {
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
      }
    }

    const updateQuantity = (id: string, value: string) => {
      const newQuantity = parseInt(value);
      if (isNaN(newQuantity) || newQuantity < 0) return; // Ignore invalid input
      const updatedCSVObjects = CSVObjects.map(cpt => 
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
      setCSVData(updatedCSVData);
      console.log("Updated quantity for RVU with ID:", id, "to", newQuantity);
    }

    const [removeModal, setRemoveModal] = useState(false);
    const [currentRVU, setCurrentRVU] = useState(null);
    const handleOpenRemoveModal = (cpt: any) => () => {
      console.log("Opening remove modal for RVU:", cpt);
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

    const removeRVU = (RVU: any) => {
      // TODO: remove RVU from local CSV file


      console.log("Removing RVU:", RVU);
      const updatedCSVObjects = CSVObjects.filter(cpt => cpt.id !== RVU.id);
      setCSVObjects(updatedCSVObjects);
      const updatedCSVData = CSVData
        .split('\n')
        .filter(row => !row.startsWith(RVU.id)) // Remove the row with the matching ID
        .join('\n');
      setCSVData(updatedCSVData);
      setRemoveModal(false);
      console.log("RVU removed. Updated CSVObjects:", updatedCSVObjects);
      setCurrentRVU(null)
    }

    if (!CSVData || !CSVObjects || CSVObjects.length === 0) {
        return <div className="empty-table">No RVUs to display. Please import or add data.</div>;
    }
    return (
        <div>
            {/* <Divider orientation="horizontal" flexItem /> */}
            <div className="totals">
              <span>
                <input type="file" accept=".csv" style={{ display: "none" }} id="csv-import-input" onChange={importCSV}/>
                <Chip className="button" icon={<FileDownloadIcon />} label="Import" variant="outlined" onClick={clickImport} />
                <Chip className="button" icon={<FileUploadIcon />} label="Export" variant="outlined" onClick={exportCSV} />
              </span>
              <span><Chip className="info" label={ `Total Compensation: $` + CSVObjects.reduce((acc: number, cpt: any) => acc + cpt.Compensation * (cpt.Quantity || 1), 0).toFixed(2)} variant="outlined" /></span>
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
                <th>Quantity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CSVObjects.map((cpt: any) => (
                <tr key={cpt.id}>
                  <td >{cpt.Date}</td> 
                  <td>{cpt["CPT Code"]}</td>
                  <td>{cpt.Description}</td>
                  <td>{cpt.wRVU.toFixed(2)}</td>
                  <td>${cpt.Compensation.toFixed(2)}</td>
                  <td>{cpt.Category}</td>
                  <td><input type="number" min="1" value={cpt.Quantity} onChange={(e) => updateQuantity(cpt.id, e.target.value)} /></td>
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
        </div>
    )
}

export default RSVTable;
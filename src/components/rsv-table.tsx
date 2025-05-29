import { Chip, Table } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
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
                    Category: row[6]
                }));
                setCSVObjects(objects);
                console.log("CSV objects loaded:", objects);
              }
          };
          reader.readAsText(file)
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
                <input type="file" accept=".csv" style={{ display: "none" }} id="csv-import-input" onChange={importCSV}/>
                <Chip className="button" icon={<FileDownloadIcon />} label="Import" variant="outlined" onClick={clickImport} />
                <Chip className="button" icon={<FileUploadIcon />} label="Export" variant="outlined" onClick={exportCSV} />
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
        </div>
    )
}

export default RSVTable;
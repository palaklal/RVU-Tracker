import { Chip, Table } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import '../App.scss'


const RSVTable = ({CSVData, setCSVData, CSVObjects, setCSVObjects}) => {
    return (
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
        </div>
    )
}

export default RSVTable;
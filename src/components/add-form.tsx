import { useState } from 'react'
import { FormControl, InputLabel, NativeSelect } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import { Dayjs } from 'dayjs';
import CPTs from '../data/CPTs';
import '../App.scss';              
import { sortObjectsByDate, sortRowsByDate } from '../helper-functions/sort.ts';
import type { IRVU } from "../types/IRVU";

const AddForm = ({CSVData, setCSVData, CSVObjects, setCSVObjects, updateCSV}) => { // TODO: remove setCSVObjects (and maybe setCSVData) once updateCSV is implemented
    const [date, setDate] = useState<Dayjs | null>(null);
    const [selectedCPTs, setSelectedCPTs] = useState<any[]>([]);
    const [formStatus, setFormStatus] = useState<any>({text: '', type: ''});

    const addSelectedCPTs = (cpt: any) => {
        if (!cpt) return
        else {
            cpt = JSON.parse(cpt)
            cpt.Date = date ? date.format('YYYY-MM-DD') : null
            cpt.id = Math.random();
            cpt.Quantity = 1; // Default to 1 if Quantity is not provided
        if (selectedCPTs.length === 0) setSelectedCPTs([cpt]) 
        else setSelectedCPTs(prev => [...prev, cpt])
        }
    }

    const updateCPTQuantity = (cpt: IRVU, quantity: string | number) => {
        cpt.Quantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
        if (isNaN(cpt.Quantity) || cpt.Quantity < 1) cpt.Quantity = 1
        setSelectedCPTs([...selectedCPTs.filter(selected => selected.id !== cpt.id), cpt])
        console.log("Updated CPT Quantity", cpt, "to", cpt.Quantity)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !selectedCPTs) return;
        setFormStatus({text: (`Adding ${selectedCPTs.length} RVU` + (selectedCPTs.length > 1 ? 's' : '') + `...`), type: 'loading'});
        try {
            let rows: any[] = [];
            selectedCPTs.forEach((cpt: IRVU) => {
                // Prepare CSV row: ID, Date, CPT Code, Description, wRVU, Compensation, Category, Quantity
                const row = [
                    cpt.id,
                    date.format('YYYY-MM-DD'),
                    cpt['CPT Code'],
                    cpt.Description,
                    cpt.wRVU,
                    cpt.Compensation,
                    cpt.Category,
                    (cpt.Quantity || 1) // Default to 1 if Quantity is not provided
                ];
                rows.push(row);
            });
            let CSVContent
            if (CSVData && CSVData.length > 0) {
                // Combine existing CSV data and new rows, then sort by date ascending
                const existingRows = CSVData
                    .split('\n')
                    .filter(Boolean) // Remove empty lines
                    .slice(1) // skip header
                    .map((line: string) => line.split(','));
                let allRows = [...existingRows, ...rows];
                allRows = sortRowsByDate(allRows);
                CSVContent = `ID,Date,CPT Code,Description,wRVU,Compensation,Categor,Quantityy\n` + allRows.map(row => row.join(',')).join('\n');
                console.log("CSVContent", CSVContent)
            } else {
                // If no existing data, just use the new rows
                CSVContent = `ID,Date,CPT Code,Description,wRVU,Compensation,Category,Quantity\n`
                + rows.map(row => row.join(',')).join('\n');
            }
            
            setCSVData(CSVContent);
            if (CSVObjects && CSVObjects.length > 0) {
                let newCSVObjects = [...CSVObjects, ...selectedCPTs];
                newCSVObjects = sortObjectsByDate(newCSVObjects);
                updateCSV(newCSVObjects);
                console.log("New CSVObjects", newCSVObjects);  
            }
            else updateCSV(selectedCPTs)

            setFormStatus({text: (`Added ${selectedCPTs.length} RVU` + (selectedCPTs.length > 1 ? 's' : '') + `! Resetting form...`), type: 'success'});
            setTimeout(() => {
                // Reset form state
                setFormStatus('')
                setSelectedCPTs([]);
                setDate(null);
            }, 5000);
        } catch (error) {
            console.error("Error adding RVUs", error);
            setFormStatus({text: 'Error adding RVUs. Please try again.', type: 'error'});
        }
    };

    const getCPTChip = (cpt: IRVU) => {
        return cpt.Date + " - " + cpt.Description
    };
    const removeCPTCode = (selectedId: number) => {
        setSelectedCPTs([...selectedCPTs.filter(cpt => cpt.id !== selectedId)]);
        console.log(selectedCPTs)
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <FormControl className="form-control" fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker className="date" label="Date of Services Rendered" value={date} onChange={setDate} />
                </LocalizationProvider>        
            </FormControl>
            <FormControl className="form-control" fullWidth disabled={!date}>
                <InputLabel variant="standard" htmlFor="RVU" shrink={true}> RVU </InputLabel>
                <NativeSelect value="" onChange={e => addSelectedCPTs(e.target.value)} inputProps={{ name: 'RVU', id: 'RVU', }}>
                    <option value=""></option>
                    {CPTs.map((cpt: IRVU) => (
                        <option key={cpt["CPT Code"]} value={JSON.stringify(cpt)}>
                            {cpt["CPT Code"]} - {cpt.Description}
                        </option>
                    ))}
                </NativeSelect>
            </FormControl>
            <div className="chips-container">
                {selectedCPTs.map((cpt: IRVU) => (
                    // <Chip key={cpt.id} label={getCPTChip(cpt)} onDelete={() => removeCPTCode(cpt.id)} />
                    <div className="custom-chip" key={cpt.id}>
                        <span className="operation-btn close-btn" onClick={() => removeCPTCode(cpt.id)}>&#10005;</span>
                        {getCPTChip(cpt)}
                        <div className="operation-btns">
                            <span className="operation-btn" onClick={() => updateCPTQuantity(cpt, (cpt.Quantity + 1))}>&#43;</span>
                            <input type="number" min="1" value={cpt.Quantity} onChange={(e) => updateCPTQuantity(cpt, e.target.value)} />
                            <span className="operation-btn" onClick={() => { if (cpt.Quantity > 1) updateCPTQuantity(cpt, (cpt.Quantity - 1)) }}>&#8722;</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="submit-container">
                <button type="submit" disabled={!date || selectedCPTs.length === 0 || (formStatus.type === 'loading' || formStatus.type === 'success')}>
                <AddIcon style={{ marginRight: 4 }} />
                    Add RVUs
                </button>
            {formStatus.type && <div className={formStatus.type + " form-status"}>{formStatus.text}</div>}
            </div>
        </form>
    );
}
export default AddForm;
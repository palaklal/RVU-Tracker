import { useState, useEffect } from 'react'
import { FormControl } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/system';
import { Dayjs } from 'dayjs';

import CPTs from '../../data/CPTs.ts';
import '../../App.scss';
import './add-form.scss';              
import { sortObjectsByDate, sortRowsByDate } from '../../helper-functions/sort.ts';
import type { IRVU } from "../../types/IRVU.ts";

const GroupHeader = styled('div')(() => ({
  position: 'sticky',
  padding: '4px 10px',
  color: '#ffffff',
  letterSpacing: '2.5px',
  backgroundColor: '#006064',
}));
const GroupItems = styled('ul')({
  padding: 0,
});

const AddForm = ({CSVData, setCSVData, CSVObjects, setCSVObjects, updateCSV}) => { // TODO: remove setCSVObjects (and maybe setCSVData) once updateCSV is implemented
    useEffect(() => {
        CPTs.sort((a: IRVU, b: IRVU) => a.Category.localeCompare(b.Category)); // sort CPTs by Category for Automplete grouping
    }, []);

    const [date, setDate] = useState<Dayjs | null>(null);
    const [selectedCPTs, setSelectedCPTs] = useState<any[]>([]);
    const [formStatus, setFormStatus] = useState<any>({text: '', type: ''});

    const addSelectedCPT = (cpt: IRVU): void => {
        // console.log("Adding CPT", cpt)
        cpt.Date = date ? date.format('YYYY-MM-DD') : null
        cpt.id = Math.random();
        cpt.Quantity = 1; // Default to 1 if Quantity is not provided
        if (selectedCPTs.length === 0) setSelectedCPTs([cpt]) 
        else {
            let existingCPT: IRVU | null = selectedCPTs.find(selected => selected.Description === cpt.Description)
            if (existingCPT) {
                existingCPT.Quantity += cpt.Quantity;
                setSelectedCPTs([...selectedCPTs.filter(selected => selected.id !== existingCPT.id), existingCPT])
                // console.log("Incremented CPT Quantity", existingCPT.Description, "to", existingCPT.Quantity)
            } else setSelectedCPTs(prev => [...prev, cpt])
        }
    }

    const updateCPTQuantity = (cpt: IRVU, quantity: string | number): void => {
        cpt.Quantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
        if (isNaN(cpt.Quantity) || cpt.Quantity < 1) cpt.Quantity = 1
        setSelectedCPTs([...selectedCPTs.filter(selected => selected.id !== cpt.id), cpt])
        console.log("Updated CPT Quantity", cpt.Description, "to", cpt.Quantity)
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
        return `${cpt['CPT Code']} - ${cpt.Description} ($${cpt.Compensation})`
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
            <FormControl className="form-control" fullWidth>
                <Autocomplete
                    options={CPTs}
                    groupBy={(option: IRVU) => option.Category}
                    getOptionLabel={(option: IRVU) => getCPTChip(option)}
                    renderOption={(props, option: IRVU) => (
                        <li {...props} key={option.id}>
                            <span style={{ fontWeight: 'bold' }}>{option['CPT Code']}&nbsp;</span>- {option.Description}&nbsp;<span style={{ fontWeight: '100' }}>(${option.Compensation})</span>
                        </li>
                    )}
                    renderInput={(params) => <TextField {...params} label="RVU" />}
                    renderGroup={(params) => (
                        <li key={params.key}>
                            <GroupHeader>{params.group.toLocaleUpperCase()}</GroupHeader>
                            <GroupItems key={Math.random()}>{params.children}</GroupItems>
                        </li>
                    )}
                    onChange={(_ : any, newValue: IRVU | null) => { if (newValue) addSelectedCPT(newValue) }}
                    disabled={!date}
                />
            </FormControl>
            <div className="chips-container">
                {selectedCPTs
                    .sort((a, b) => a['CPT Code'].localeCompare(b['CPT Code']))
                    .map((cpt: IRVU) => (
                    // <Chip key={cpt.id} label={getCPTChip(cpt)} onDelete={() => removeCPTCode(cpt.id)} />
                    <div className="custom-chip" key={cpt.id}>
                        <div className="close-btn-container"><span className="operation-btn close-btn" onClick={() => removeCPTCode(cpt.id)}>&#10005;</span></div>
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
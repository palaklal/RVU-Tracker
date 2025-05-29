import { useState } from 'react'
import { FormControl, InputLabel, NativeSelect, Chip } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import { Dayjs } from 'dayjs';
import CPTs from '../data/CPTs';
import '../App.scss';              

const AddForm = ({setCSVData, setCSVObjects}) => {
    const [date, setDate] = useState<Dayjs | null>(null);
    const [selectedCPTs, setSelectedCPTs] = useState<any[]>([]);
    const [formStatus, setFormStatus] = useState<any>({text: '', type: ''});

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

            setCSVData(csvContent);
            setCSVObjects(selectedCPTs)

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

    const getCPTChip = (cpt: any) => {
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
        </form>
    );
}
export default AddForm;
import { useState } from 'react'
import { FormControl,  InputLabel, NativeSelect } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';import CPTs from './data/CPTs'
import './App.scss'

function App() {
  return (
    <>
      {}
      <h1 className="title">RVU Tracker</h1>
      <form>
        <FormControl  className="form-control" fullWidth>
           {/* <InputLabel htmlFor="date">Date</InputLabel> */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker className="date" />
            </LocalizationProvider>        
          </FormControl>
        <FormControl className="form-control" fullWidth>
          <InputLabel variant="standard" htmlFor="CPTCode"> CPT Code </InputLabel>
          <NativeSelect
            defaultValue=""
            inputProps={{
              name: 'CPT Code',
              id: 'CPTCode',
            }}
            className="select-input">
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

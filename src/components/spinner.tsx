import { CircularProgress, Box } from "@mui/material";

const Spinner = () => {
    return (
        <Box><CircularProgress size="10rem" thickness=".5" /></Box>
    );
};

export default Spinner;

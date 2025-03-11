import React from "react";
import { Alert, AlertTitle, Box } from "@mui/material";

interface SuccessMessageProps {
  message?: string;
  title?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message = "Operation completed successfully.",
  title = "Success",
}) => {
  return (
    <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
      <Alert severity="success">
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default SuccessMessage;

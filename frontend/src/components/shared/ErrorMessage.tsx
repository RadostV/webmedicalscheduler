import React from "react";
import { Alert, AlertTitle, Box } from "@mui/material";

interface ErrorMessageProps {
  message?: string;
  title?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = "An unexpected error occurred. Please try again later.",
  title = "Error",
}) => {
  return (
    <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
      <Alert severity="error">
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;

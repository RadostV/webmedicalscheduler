import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { useAuth } from "../../contexts/shared/AuthContext";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

interface FormValues {
  username: string;
  password: string;
  confirmPassword: string;
  type: "patient" | "doctor";
  specialty?: string;
}

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  type: Yup.string()
    .required("Please select an account type")
    .oneOf(["patient", "doctor"], "Invalid account type"),
  specialty: Yup.string().when("type", {
    is: "doctor",
    then: (schema) => schema.required("Specialty is required for doctors"),
    otherwise: (schema) => schema.optional(),
  }),
});

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const initialValues: FormValues = {
    username: "",
    password: "",
    confirmPassword: "",
    type: "patient",
    specialty: "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      setError(null);
      const { confirmPassword, ...registrationData } = values;
      await register(registrationData);

      // Redirect based on user type
      navigate(
        values.type === "patient" ? "/patient/appointments" : "/doctor/schedule"
      );
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Create an Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form>
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
                margin="normal"
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                margin="normal"
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.confirmPassword && Boolean(errors.confirmPassword)
                }
                helperText={touched.confirmPassword && errors.confirmPassword}
                margin="normal"
                disabled={isSubmitting}
              />

              <FormControl
                fullWidth
                margin="normal"
                error={touched.type && Boolean(errors.type)}
              >
                <InputLabel id="type-label">Account Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={values.type}
                  label="Account Type"
                  onChange={(e: SelectChangeEvent<"patient" | "doctor">) => {
                    setFieldValue("type", e.target.value);
                    if (e.target.value === "patient") {
                      setFieldValue("specialty", "");
                    }
                  }}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </Select>
                {touched.type && errors.type && (
                  <FormHelperText>{errors.type}</FormHelperText>
                )}
              </FormControl>

              {values.type === "doctor" && (
                <TextField
                  fullWidth
                  name="specialty"
                  label="Medical Specialty"
                  value={values.specialty}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.specialty && Boolean(errors.specialty)}
                  helperText={touched.specialty && errors.specialty}
                  margin="normal"
                  disabled={isSubmitting}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/login")}
                sx={{ mt: 1 }}
                disabled={isSubmitting}
              >
                Already have an account? Login
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default RegisterForm;

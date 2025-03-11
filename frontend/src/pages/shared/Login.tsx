import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useAuth } from "../../contexts/shared/AuthContext";
import { LoginRequest } from "../../types/shared/auth.types";

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const { isAuthenticated, login, loading, error, user } = useAuth();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);

  // If user is already authenticated, redirect to appropriate page
  if (isAuthenticated && user) {
    const from =
      (location.state as LocationState)?.from?.pathname ||
      (user.type === "patient" ? "/patient/appointments" : "/doctor/schedule");
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (
    values: LoginRequest,
    { setSubmitting }: FormikHelpers<LoginRequest>
  ) => {
    try {
      setLoginError(null);
      await login(values);

      // Note: No need to navigate here, the component will redirect via the conditional render above
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Medical Scheduler Login
          </Typography>

          {(error || loginError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || loginError}
            </Alert>
          )}

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({
              isSubmitting,
              handleChange,
              handleBlur,
              values,
              errors,
              touched,
            }) => (
              <Form>
                <TextField
                  name="username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  autoComplete="username"
                  disabled={loading || isSubmitting}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                />
                <TextField
                  type="password"
                  name="password"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  autoComplete="current-password"
                  disabled={loading || isSubmitting}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading || isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading || isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Login"
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" align="center">
              Demo accounts:
              <br />
              Patient: username "patient", password "password"
              <br />
              Doctor: username "doctor", password "password"
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

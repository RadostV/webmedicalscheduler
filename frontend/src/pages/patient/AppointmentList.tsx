import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import { Appointment } from "../../types/appointment";
import { patientService } from "../../services/patient/patient.service";

const AppointmentList: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsList = await patientService.getAppointments();
        setAppointments(appointmentsList);
        setError(null);
      } catch (err) {
        setError("Failed to fetch appointments. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">My Appointments</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/patient/schedule")}
        >
          Schedule New Appointment
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>No appointments scheduled.</Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigate("/patient/schedule")}
          >
            Schedule Your First Appointment
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments
                .sort(
                  (a, b) =>
                    new Date(b.dateTime).getTime() -
                    new Date(a.dateTime).getTime()
                )
                .map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.doctor?.name}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.dateTime), "MMMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.dateTime), "h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AppointmentList;

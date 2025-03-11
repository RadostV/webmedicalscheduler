import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import { useAuth } from "../../contexts/shared/AuthContext";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import Modal from "../../components/shared/Modal";
import {
  Appointment,
  AppointmentStatus,
} from "../../types/shared/appointment.types";

const AppointmentList: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockAppointments: Appointment[] = [
          {
            id: "1",
            patientId: "1",
            doctorId: "2",
            doctorName: "Dr. Jane Smith",
            dateTime: new Date(2023, 5, 15, 10, 30).toISOString(),
            status: "scheduled",
          },
          {
            id: "2",
            patientId: "1",
            doctorId: "3",
            doctorName: "Dr. John Doe",
            dateTime: new Date(2023, 5, 20, 14, 0).toISOString(),
            status: "scheduled",
          },
          {
            id: "3",
            patientId: "1",
            doctorId: "2",
            doctorName: "Dr. Jane Smith",
            dateTime: new Date(2023, 4, 5, 9, 0).toISOString(),
            status: "completed",
          },
        ];

        setAppointments(mockAppointments);
        setError(null);
      } catch (err) {
        setError("Failed to fetch appointments. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === selectedAppointment.id
            ? { ...app, status: "cancelled" as AppointmentStatus }
            : app
        )
      );

      setModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError("Failed to cancel appointment. Please try again later.");
      console.error(err);
    }
  };

  const getStatusChipColor = (status: AppointmentStatus) => {
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

  if (loading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (appointments.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          No Appointments
        </Typography>
        <Typography variant="body1" color="textSecondary">
          You don't have any appointments scheduled.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          href="/patient/schedule"
        >
          Schedule an Appointment
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => {
              const appointmentDate = new Date(appointment.dateTime);
              return (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>
                    {format(appointmentDate, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{format(appointmentDate, "h:mm a")}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)
                      }
                      color={getStatusChipColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.status === "scheduled" && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelAppointment(appointment)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={modalOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        onConfirm={confirmCancelAppointment}
        onCancel={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
        confirmText="Yes, Cancel Appointment"
        cancelText="No, Keep Appointment"
      />
    </Box>
  );
};

export default AppointmentList;

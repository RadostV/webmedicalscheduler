import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from "@mui/material";
import { format } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../../contexts/shared/AuthContext";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import Modal from "../../components/shared/Modal";
import { doctorService } from "../../services/doctor/doctor.service";
import {
  Appointment,
  AppointmentStatus,
  CalendarEvent,
} from "../../types/shared/appointment.types";
import { useNavigate } from "react-router-dom";

const Schedule: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    action: () => void;
  }>({
    title: "",
    message: "",
    action: () => {},
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const fetchedAppointments = await doctorService.getAppointments();
      setAppointments(fetchedAppointments);
      setError(null);
    } catch (err) {
      setError("Failed to fetch appointments. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChange = (
    appointment: Appointment,
    status: AppointmentStatus
  ) => {
    let title = "";
    let message = "";

    if (status === "completed") {
      title = "Mark as Completed";
      message = `Are you sure you want to mark the appointment with ${appointment.patientName} as completed?`;
    } else if (status === "cancelled") {
      title = "Cancel Appointment";
      message = `Are you sure you want to cancel the appointment with ${appointment.patientName}?`;
    }

    setModalData({
      title,
      message,
      action: async () => {
        try {
          setLoading(true);
          console.log("Updating appointment:", {
            appointmentId: appointment.id,
            status,
          });

          const updatedAppointment =
            await doctorService.updateAppointmentStatus(appointment.id, status);
          console.log("Updated appointment:", updatedAppointment);

          setAppointments((prevAppointments) =>
            prevAppointments.map((app) =>
              app.id === appointment.id ? { ...updatedAppointment } : app
            )
          );

          setModalOpen(false);
          setError(null);
        } catch (err) {
          console.error("Error updating appointment status:", err);
          setError(
            `Failed to update appointment status. Please try again later.`
          );
        } finally {
          setLoading(false);
        }
      },
    });

    setModalOpen(true);
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

  const convertToCalendarEvents = (
    appointments: Appointment[]
  ): CalendarEvent[] => {
    return appointments.map((appointment) => {
      const startDate = new Date(appointment.dateTime);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30); // Assuming 30 minute appointments

      return {
        id: appointment.id,
        title: `${appointment.patientName}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        status: appointment.status,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
      };
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Schedule
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="List View" />
          <Tab label="Calendar View" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 ? (
            // List View
            appointments.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
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
                          <TableCell>{appointment.patientName}</TableCell>
                          <TableCell>
                            {format(appointmentDate, "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(appointmentDate, "h:mm a")}
                          </TableCell>
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
                              <>
                                <Button
                                  size="small"
                                  color="success"
                                  sx={{ mr: 1 }}
                                  onClick={() =>
                                    handleStatusChange(appointment, "completed")
                                  }
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleStatusChange(appointment, "cancelled")
                                  }
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1">No appointments found.</Typography>
              </Box>
            )
          ) : (
            // Calendar View
            <Box sx={{ height: 600 }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                initialView="timeGridWeek"
                editable={false}
                selectable={false}
                selectMirror={true}
                dayMaxEvents={true}
                events={convertToCalendarEvents(appointments)}
                eventContent={(eventInfo) => {
                  const status = eventInfo.event.extendedProps
                    .status as AppointmentStatus;
                  return (
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {eventInfo.event.title}
                      </Typography>
                      <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        color={getStatusChipColor(status)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  );
                }}
                eventClick={(clickInfo) => {
                  const appointment = appointments.find(
                    (app) => app.id === clickInfo.event.id
                  );
                  if (appointment && appointment.status === "scheduled") {
                    // Show a dropdown menu or action buttons
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Modal
        open={modalOpen}
        title={modalData.title}
        message={modalData.message}
        onConfirm={modalData.action}
        onCancel={() => {
          setModalOpen(false);
          setSelectedAppointment(null);
        }}
      />
    </Box>
  );
};

export default Schedule;

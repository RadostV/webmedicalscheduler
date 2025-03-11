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
import SuccessMessage from "../../components/shared/SuccessMessage";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    title: "",
    message: "",
    action: async () => {},
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // Log state changes for debugging
  useEffect(() => {
    console.log("Selected appointment changed:", selectedAppointment);
  }, [selectedAppointment]);

  useEffect(() => {
    console.log("Action modal open state changed:", actionModalOpen);
  }, [actionModalOpen]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const fetchedAppointments = await doctorService.getAppointments();
      console.log("Fetched appointments:", fetchedAppointments);

      if (fetchedAppointments.length > 0) {
        console.log("First appointment ID:", fetchedAppointments[0].id);
        console.log(
          "First appointment ID type:",
          typeof fetchedAppointments[0].id
        );
      }

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
          const updatedAppointment =
            await doctorService.updateAppointmentStatus(appointment.id, status);

          setAppointments((prevAppointments) =>
            prevAppointments.map((app) =>
              app.id === appointment.id ? { ...updatedAppointment } : app
            )
          );

          const successMsg =
            status === "completed"
              ? "Appointment marked as completed successfully"
              : "Appointment cancelled successfully";
          setSuccessMessage(successMsg);
          setTimeout(() => setSuccessMessage(null), 3000);

          setModalOpen(false);
          setActionModalOpen(false);
          setSelectedAppointment(null);
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

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled":
        return "#1976d2"; // primary blue
      case "completed":
        return "#2e7d32"; // success green
      case "cancelled":
        return "#d32f2f"; // error red
      default:
        return "#757575"; // default gray
    }
  };

  const convertToCalendarEvents = (
    appointments: Appointment[]
  ): CalendarEvent[] => {
    console.log("Converting appointments to calendar events");
    return appointments.map((appointment) => {
      const startDate = new Date(appointment.dateTime);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30); // Assuming 30 minute appointments

      // Ensure ID is a string
      const eventId = String(appointment.id);

      const event = {
        id: eventId,
        title: `${appointment.patientName}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        status: appointment.status,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
      };

      console.log("Created calendar event:", event);
      return event;
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

      {successMessage && <SuccessMessage message={successMessage} />}

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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment) => {
                      const appointmentDate = new Date(appointment.dateTime);
                      return (
                        <TableRow
                          key={appointment.id}
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setActionModalOpen(true);
                          }}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
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
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventTimeFormat={{
                  hour: "numeric",
                  minute: "2-digit",
                  meridiem: "short",
                }}
                eventDisplay="block"
                eventClassNames="clickable-event"
                eventDidMount={(info) => {
                  info.el.style.cursor = "pointer";
                }}
                events={convertToCalendarEvents(appointments)}
                eventContent={(eventInfo) => {
                  const status = eventInfo.event.extendedProps
                    .status as AppointmentStatus;
                  const eventId = eventInfo.event.id;

                  const handleEventClick = () => {
                    console.log("Event box clicked directly:", eventId);

                    // Ensure consistent ID type comparison
                    const stringEventId = String(eventId);
                    console.log(
                      "Converted event ID for box click:",
                      stringEventId
                    );

                    const appointment = appointments.find(
                      (app) => String(app.id) === stringEventId
                    );

                    if (appointment) {
                      console.log(
                        "Setting appointment and opening modal from box click:",
                        appointment
                      );
                      setSelectedAppointment(appointment);
                      setActionModalOpen(true);
                    } else {
                      console.log(
                        "No appointment found with ID:",
                        stringEventId
                      );
                      console.log(
                        "Available appointment IDs:",
                        appointments.map((app) => String(app.id))
                      );
                    }
                  };

                  return (
                    <Box
                      onClick={handleEventClick}
                      sx={{
                        p: 0.5,
                        height: "100%",
                        width: "100%",
                        backgroundColor: getStatusColor(status),
                        color: "#fff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.9,
                          transform: "scale(1.02)",
                          transition: "all 0.1s ease-in-out",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {eventInfo.event.title}
                      </Typography>
                    </Box>
                  );
                }}
                eventClick={(clickInfo) => {
                  console.log("Event clicked:", clickInfo.event);
                  console.log("Event ID:", clickInfo.event.id);
                  console.log("All appointments:", appointments);

                  // Ensure consistent ID type comparison
                  const eventId = String(clickInfo.event.id);
                  console.log("Converted event ID for comparison:", eventId);

                  const appointment = appointments.find(
                    (app) => String(app.id) === eventId
                  );

                  console.log("Found appointment:", appointment);

                  if (appointment) {
                    console.log(
                      "Setting selected appointment and opening modal"
                    );
                    setSelectedAppointment(appointment);
                    setActionModalOpen(true);
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
        }}
      />

      <Modal
        open={actionModalOpen}
        title="Appointment Actions"
        message={
          selectedAppointment
            ? `Appointment with ${selectedAppointment.patientName} on ${format(
                new Date(selectedAppointment.dateTime),
                "MMM dd, yyyy 'at' h:mm a"
              )}`
            : "No appointment selected"
        }
        onCancel={() => {
          console.log("Closing action modal");
          setActionModalOpen(false);
          setSelectedAppointment(null);
        }}
        customActions={
          selectedAppointment?.status === "scheduled" ? (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  console.log("Complete button clicked");
                  handleStatusChange(selectedAppointment, "completed");
                }}
              >
                Complete
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  console.log("Cancel button clicked");
                  handleStatusChange(selectedAppointment, "cancelled");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  console.log("Close button clicked");
                  setActionModalOpen(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  console.log("Close button clicked");
                  setActionModalOpen(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
            </Box>
          )
        }
      />
    </Box>
  );
};

export default Schedule;

import React, { useState, useEffect } from 'react';
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
  Link,
  IconButton,
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import Modal from '../../components/shared/Modal';
import AppointmentCompletion from '../../components/doctor/AppointmentCompletion';
import { doctorService } from '../../services/doctor/doctor.service';
import { Appointment, AppointmentStatus, CalendarEvent } from '../../types/shared/appointment.types';
import { API_BASE_URL } from '../../config/api.config';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

interface ExpandableRowProps {
  appointment: Appointment;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ appointment }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const handlePrescriptionClick = (event: React.MouseEvent) => {
    if (!token) {
      event.preventDefault();
      setError('Please log in to view the prescription');
      return;
    }

    if (!appointment.hasPrescription) {
      event.preventDefault();
      setError('Prescription not found');
      return;
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{appointment.patientName}</TableCell>
        <TableCell>{format(new Date(appointment.dateTime), 'MMMM d, yyyy')}</TableCell>
        <TableCell>{format(new Date(appointment.dateTime), 'h:mm a')}</TableCell>
        <TableCell>
          <Chip
            label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            color={getStatusColor(appointment.status)}
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Medical Details
              </Typography>
              <Table size="small">
                <TableBody>
                  {appointment.consultationAnalysis && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '200px' }}>
                        Consultation Analysis
                      </TableCell>
                      <TableCell>{appointment.consultationAnalysis}</TableCell>
                    </TableRow>
                  )}
                  {appointment.description && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Description
                      </TableCell>
                      <TableCell>{appointment.description}</TableCell>
                    </TableRow>
                  )}
                  {appointment.hasPrescription && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Prescription
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${API_BASE_URL}/api/doctors/appointments/${appointment.id}/prescription?token=${token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handlePrescriptionClick}
                          sx={{ textDecoration: 'none', color: 'primary.main' }}
                        >
                          View Prescription (PDF)
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                  {!appointment.consultationAnalysis && !appointment.description && !appointment.hasPrescription && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          No medical details available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

const Schedule: React.FC = () => {
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
    title: '',
    message: '',
    action: async () => {},
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);

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
      setError('Failed to fetch appointments. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusChange = (appointment: Appointment, status: AppointmentStatus) => {
    if (status === 'completed') {
      setSelectedAppointment(appointment);
      setActionModalOpen(false);
      setCompletionModalOpen(true);
      return;
    }

    setModalData({
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel the appointment with ${appointment.patientName}?`,
      action: async () => {
        try {
          setLoading(true);
          const updatedAppointment = await doctorService.updateAppointmentStatus(appointment.id, status);
          setAppointments((prevAppointments) =>
            prevAppointments.map((app) => (app.id === appointment.id ? updatedAppointment : app))
          );
          setSuccessMessage('Appointment cancelled successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
          setModalOpen(false);
          setActionModalOpen(false);
          setSelectedAppointment(null);
          setError(null);
        } catch (err) {
          setError(`Failed to update appointment status. Please try again later.`);
        } finally {
          setLoading(false);
        }
      },
    });

    setModalOpen(true);
  };

  const convertToCalendarEvents = (appointments: Appointment[]): CalendarEvent[] => {
    return appointments.map((appointment) => {
      const startDate = new Date(appointment.dateTime);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30);

      return {
        id: String(appointment.id),
        title: appointment.patientName || 'Unknown Patient',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        status: appointment.status as AppointmentStatus,
        patientId: appointment.patientId,
        doctorId: appointment.doctor?.id || appointment.doctorId,
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

      {successMessage && <SuccessMessage message={successMessage} />}

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
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
                      <TableCell style={{ width: '50px' }} />
                      <TableCell>Patient</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments
                      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                      .map((appointment) => (
                        <ExpandableRow key={appointment.id} appointment={appointment} />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">No appointments found.</Typography>
              </Box>
            )
          ) : (
            // Calendar View
            <Box sx={{ height: 600 }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                initialView="timeGridWeek"
                editable={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short',
                }}
                eventDisplay="block"
                eventClassNames="clickable-event"
                eventDidMount={(info) => {
                  info.el.style.cursor = 'pointer';
                }}
                events={convertToCalendarEvents(appointments)}
                eventContent={(eventInfo) => {
                  const status = eventInfo.event.extendedProps.status as AppointmentStatus;
                  const eventId = eventInfo.event.id;

                  const handleEventClick = () => {
                    const stringEventId = String(eventId);
                    const appointment = appointments.find((app) => String(app.id) === stringEventId);

                    if (appointment) {
                      setSelectedAppointment(appointment);
                      setActionModalOpen(true);
                    }
                  };

                  return (
                    <Box
                      onClick={handleEventClick}
                      sx={{
                        p: 0.5,
                        height: '100%',
                        width: '100%',
                        backgroundColor: getStatusColor(status),
                        color: '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.9,
                          transform: 'scale(1.02)',
                          transition: 'all 0.1s ease-in-out',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {eventInfo.event.title}
                      </Typography>
                    </Box>
                  );
                }}
                eventClick={(clickInfo) => {
                  const eventId = String(clickInfo.event.id);
                  const appointment = appointments.find((app) => String(app.id) === eventId);

                  if (appointment) {
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
        title="Appointment Details"
        message=""
        onCancel={() => {
          setActionModalOpen(false);
          setSelectedAppointment(null);
        }}
        customActions={
          selectedAppointment?.status === 'scheduled' ? (
            <Box>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Appointment Information
                </Typography>
                <Typography>Patient: {selectedAppointment.patientName}</Typography>
                <Typography>
                  Date: {format(new Date(selectedAppointment.dateTime), "MMMM d, yyyy 'at' h:mm a")}
                </Typography>
                <Typography>
                  Status:{' '}
                  <Chip
                    label={selectedAppointment.status}
                    color={getStatusColor(selectedAppointment.status)}
                    size="small"
                  />
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleStatusChange(selectedAppointment, 'completed');
                  }}
                >
                  Complete
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleStatusChange(selectedAppointment, 'cancelled');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setActionModalOpen(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Appointment Information
                </Typography>
                <Typography>Patient: {selectedAppointment?.patientName}</Typography>
                <Typography>
                  Date:{' '}
                  {selectedAppointment
                    ? format(new Date(selectedAppointment.dateTime), "MMMM d, yyyy 'at' h:mm a")
                    : ''}
                </Typography>
                <Typography>
                  Status:{' '}
                  {selectedAppointment && (
                    <Chip
                      label={selectedAppointment.status}
                      color={getStatusColor(selectedAppointment.status)}
                      size="small"
                    />
                  )}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setActionModalOpen(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )
        }
      />

      <Modal
        open={completionModalOpen}
        title="Complete Appointment"
        message=""
        onConfirm={() => {
          setCompletionModalOpen(false);
          setSelectedAppointment(null);
          fetchAppointments();
        }}
        onCancel={() => {
          setCompletionModalOpen(false);
          setSelectedAppointment(null);
        }}
      >
        {selectedAppointment && (
          <AppointmentCompletion
            appointmentId={selectedAppointment.id}
            onComplete={() => {
              setCompletionModalOpen(false);
              setSelectedAppointment(null);
              fetchAppointments();
            }}
            onCancel={() => {
              setCompletionModalOpen(false);
              setSelectedAppointment(null);
            }}
          />
        )}
      </Modal>
    </Box>
  );
};

export default Schedule;

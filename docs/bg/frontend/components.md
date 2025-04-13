# Frontend Компоненти

## Общ Преглед

Системата за Медицински Прегледи използва React с TypeScript и Material-UI за създаване на модерен и отзивчив потребителски интерфейс. Компонентите са организирани в логически групи според тяхната функционалност.

## Основни Компоненти

### Навигация

```typescript
// src/components/navigation/Navbar.tsx
interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Система за Медицински Прегледи
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit" onClick={onLogout}>
          Изход
        </Button>
      </Toolbar>
    </AppBar>
  );
};
```

### Форми

```typescript
// src/components/forms/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Имейл"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <TextField
        label="Парола"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      <Button type="submit">Вход</Button>
    </form>
  );
};
```

## Компоненти за Пациенти

### Търсене на Лекари

```typescript
// src/components/patient/DoctorSearch.tsx
interface DoctorSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
}

export const DoctorSearch: React.FC<DoctorSearchProps> = ({ onSearch }) => {
  const [criteria, setCriteria] = useState({
    specialty: '',
    location: '',
    date: null
  });

  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Специалност"
            value={criteria.specialty}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Локация"
            value={criteria.location}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DatePicker
            label="Дата"
            value={criteria.date}
            onChange={handleDateChange}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
```

### Управление на Прегледи

```typescript
// src/components/patient/AppointmentManagement.tsx
interface AppointmentManagementProps {
  appointments: Appointment[];
  onCancel: (id: string) => void;
  onReschedule: (id: string, date: Date) => void;
}

export const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  appointments,
  onCancel,
  onReschedule
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Дата</TableCell>
            <TableCell>Час</TableCell>
            <TableCell>Доктор</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map(appointment => (
            <TableRow key={appointment.id}>
              <TableCell>{formatDate(appointment.date)}</TableCell>
              <TableCell>{formatTime(appointment.time)}</TableCell>
              <TableCell>{appointment.doctor.name}</TableCell>
              <TableCell>{appointment.status}</TableCell>
              <TableCell>
                <Button onClick={() => onCancel(appointment.id)}>
                  Отказ
                </Button>
                <Button onClick={() => handleReschedule(appointment.id)}>
                  Преплан
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## Компоненти за Лекари

### Управление на Профил

```typescript
// src/components/doctor/ProfileManagement.tsx
interface ProfileManagementProps {
  doctor: Doctor;
  onUpdate: (data: DoctorUpdateData) => void;
}

export const ProfileManagement: React.FC<ProfileManagementProps> = ({
  doctor,
  onUpdate
}) => {
  const [profile, setProfile] = useState(doctor);

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Име"
              value={profile.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Специалност"
              value={profile.specialty}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Локация"
              value={profile.location}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
```

### Управление на Наличност

```typescript
// src/components/doctor/AvailabilityManagement.tsx
interface AvailabilityManagementProps {
  availability: TimeSlot[];
  onUpdate: (slots: TimeSlot[]) => void;
}

export const AvailabilityManagement: React.FC<AvailabilityManagementProps> = ({
  availability,
  onUpdate
}) => {
  return (
    <Paper>
      <Grid container spacing={2}>
        {DAYS_OF_WEEK.map(day => (
          <Grid item xs={12} key={day}>
            <Typography variant="h6">{day}</Typography>
            <TimeSlotSelector
              slots={availability.filter(slot => slot.day === day)}
              onChange={handleSlotChange}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
```

### Управление на График

```typescript
// src/components/doctor/ScheduleManagement.tsx
interface ScheduleManagementProps {
  schedule: Appointment[];
  onUpdate: (appointment: Appointment) => void;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  schedule,
  onUpdate
}) => {
  return (
    <Calendar
      events={schedule.map(appointment => ({
        id: appointment.id,
        title: `${appointment.patient.name} - ${appointment.type}`,
        start: new Date(appointment.date),
        end: new Date(appointment.endTime)
      }))}
      onEventChange={handleEventChange}
    />
  );
};
```

## Общи Компоненти

### Календар

```typescript
// src/components/common/Calendar.tsx
interface CalendarProps {
  events: CalendarEvent[];
  onEventChange: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  onEventChange
}) => {
  return (
    <FullCalendar
      events={events}
      eventChange={onEventChange}
      locale="bg"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
    />
  );
};
```

### Известия

```typescript
// src/components/common/Notifications.tsx
interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onDismiss
}) => {
  return (
    <SnackbarProvider maxSnack={3}>
      {notifications.map(notification => (
        <Snackbar
          key={notification.id}
          open={true}
          onClose={() => onDismiss(notification.id)}
        >
          <Alert severity={notification.type}>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarProvider>
  );
};
```

## Стилове и Теми

### Конфигурация на Темата

```typescript
// src/theme/index.ts
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500
    }
  }
});
```

### Отзивчив Дизайн

```typescript
// src/components/common/ResponsiveContainer.tsx
interface ResponsiveContainerProps {
  children: React.ReactNode;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children
}) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
        {children}
      </Box>
    </Container>
  );
};
```

## Имплементационни Забележки

### Добри Практики
1. Използвайте функционални React компоненти
2. Типизирайте всички пропс и стейт с TypeScript
3. Използвайте Material-UI за консистентен дизайн
4. Имплементирайте отзивчив дизайн за всички размери екрани
5. Оптимизирайте производителността с React.memo

### Поддръжка
1. Редовни обновявания на зависимостите
2. Тестване на компонентите
3. Документация на пропс и методи
4. Code reviews
5. Performance monitoring 
# Frontend Компоненти

## Общ Преглед

Този документ описва frontend компонентите на Системата за Медицински Прегледи. Системата използва React с TypeScript и Material-UI за създаване на модерен и отзивчив потребителски интерфейс.

## Основни Компоненти

### Навигация
```typescript
// Navigation.tsx
interface NavigationProps {
  user: User;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Медицински Прегледи</Typography>
        <Button color="inherit" onClick={onLogout}>
          Изход
        </Button>
      </Toolbar>
    </AppBar>
  );
};
```

#### Описание
- Отзивчива навигационна лента
- Динамично меню според ролята
- Интегрирана търсена функционалност
- Уведомления за потребителя

### Форми
```typescript
// Form.tsx
interface FormProps {
  onSubmit: (data: any) => void;
  initialValues: any;
}

const Form: React.FC<FormProps> = ({ onSubmit, initialValues }) => {
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Име"
        name="name"
        value={values.name}
        onChange={handleChange}
      />
      <Button type="submit">Изпрати</Button>
    </form>
  );
};
```

#### Описание
- Валидация на входните данни
- Обработка на грешки
- Автоматично запазване
- Поддръжка на различни типове полета

## Компоненти за Пациенти

### Търсене на Лекари
```typescript
// SearchDoctors.tsx
interface SearchDoctorsProps {
  onSearch: (criteria: SearchCriteria) => void;
}

const SearchDoctors: React.FC<SearchDoctorsProps> = ({ onSearch }) => {
  return (
    <Card>
      <CardContent>
        <TextField
          label="Специалност"
          onChange={handleSpecialtyChange}
        />
        <TextField
          label="Локация"
          onChange={handleLocationChange}
        />
        <Button onClick={handleSearch}>
          Търсене
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### Описание
- Филтриране по специалност
- Търсене по локация
- Сортиране по рейтинг
- Преглед на налични часове

### Управление на Прегледите
```typescript
// Appointments.tsx
interface AppointmentsProps {
  appointments: Appointment[];
  onCancel: (id: string) => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ appointments, onCancel }) => {
  return (
    <List>
      {appointments.map(appointment => (
        <ListItem key={appointment.id}>
          <ListItemText
            primary={appointment.doctor.name}
            secondary={formatDate(appointment.date)}
          />
          <Button onClick={() => onCancel(appointment.id)}>
            Отказ
          </Button>
        </ListItem>
      ))}
    </List>
  );
};
```

#### Описание
- Календар на прегледите
- Статус на прегледите
- Известявания
- История на прегледите

## Компоненти за Лекари

### Управление на Профила
```typescript
// DoctorProfile.tsx
interface DoctorProfileProps {
  doctor: Doctor;
  onUpdate: (data: DoctorUpdate) => void;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onUpdate }) => {
  return (
    <Card>
      <CardContent>
        <TextField
          label="Име"
          value={doctor.name}
          onChange={handleNameChange}
        />
        <TextField
          label="Специалност"
          value={doctor.specialty}
          onChange={handleSpecialtyChange}
        />
        <Button onClick={handleSave}>
          Запази
        </Button>
      </CardContent>
    </Card>
  );
};
```

#### Описание
- Редактиране на лична информация
- Управление на специалности
- Добавяне на квалификации
- Качване на снимки

### Управление на Графика
```typescript
// Schedule.tsx
interface ScheduleProps {
  availability: TimeSlot[];
  onUpdate: (slots: TimeSlot[]) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ availability, onUpdate }) => {
  return (
    <Calendar>
      {availability.map(slot => (
        <TimeSlot
          key={slot.id}
          time={slot.time}
          isAvailable={slot.isAvailable}
          onClick={() => toggleSlot(slot.id)}
        />
      ))}
    </Calendar>
  );
};
```

#### Описание
- Календар на наличност
- Управление на работно време
- Блокиране на часове
- Повторяващи се графици

### Преглед на Графика
```typescript
// Calendar.tsx
interface CalendarProps {
  appointments: Appointment[];
  onSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ appointments, onSelect }) => {
  return (
    <div className="calendar">
      {appointments.map(appointment => (
        <AppointmentSlot
          key={appointment.id}
          time={appointment.time}
          patient={appointment.patient}
          onClick={() => handleSelect(appointment)}
        />
      ))}
    </div>
  );
};
```

#### Описание
- Дневен/седмичен изглед
- Цветово кодиране
- Фильтриране
- Експорт

## Общи Компоненти

### Календар
```typescript
// Calendar.tsx
interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ value, onChange }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        value={value}
        onChange={onChange}
        renderInput={(props) => <TextField {...props} />}
      />
    </MuiPickersUtilsProvider>
  );
};
```

#### Описание
- Избор на дата
- Валидация
- Локализация
- Форматиране

### Известявания
```typescript
// Notifications.tsx
interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onDismiss }) => {
  return (
    <SnackbarProvider>
      {notifications.map(notification => (
        <Snackbar
          key={notification.id}
          message={notification.message}
          onClose={() => onDismiss(notification.id)}
        />
      ))}
    </SnackbarProvider>
  );
};
```

#### Описание
- Toast съобщения
- Статус известия
- Автоматично затваряне
- Приоритизация

## Стилове и Теми

### Конфигурация на Темата
```typescript
// theme.ts
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
});
```

#### Описание
- Цветова схема
- Типография
- Отстъпи
- Анимации

### Отзивчив Дизайн
```typescript
// ResponsiveLayout.tsx
interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        {children}
      </Grid>
    </Grid>
  );
};
```

#### Описание
- Breakpoints
- Grid система
- Flexbox
- Медия заявки

## Бележки за Имплементацията

### Добри Практики
- Функционални компоненти
- TypeScript типизация
- Props валидация
- Мемоизация

### Производителност
- Лениво зареждане
- Код разделяне
- Оптимизация на рендерирането
- Кеширане

### Поддръжка
- Документация
- Тестове
- Логване
- Мониторинг 
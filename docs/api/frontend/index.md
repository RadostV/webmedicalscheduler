# Frontend API Документация

## Общ Преглед

Този документ описва API интерфейсите, използвани във frontend частта на Системата за Медицински Прегледи. API-то е изградено с TypeScript и Axios за HTTP заявки.

## Автентикация

### Интерфейси
```typescript
interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  type: 'patient' | 'doctor';
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    type: string;
  };
}
```

### Функции
```typescript
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post('/api/auth/login', credentials);
  return response.data;
};

const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post('/api/auth/register', data);
  return response.data;
};
```

## Лекарски API

### Интерфейси
```typescript
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  education: string;
  qualifications: string;
  contact_info: {
    phone: string;
    email: string;
    address: string;
  };
  location: string;
  languages: string[];
  profile_photo_url: string;
  description: string;
}

interface DoctorSearchParams {
  specialty?: string;
  location?: string;
  page?: number;
  limit?: number;
}

interface DoctorSearchResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
}
```

### Функции
```typescript
const searchDoctors = async (params: DoctorSearchParams): Promise<DoctorSearchResponse> => {
  const response = await axios.get('/api/doctors', { params });
  return response.data;
};

const getDoctorDetails = async (id: number): Promise<Doctor> => {
  const response = await axios.get(`/api/doctors/${id}`);
  return response.data;
};

const updateDoctorProfile = async (id: number, data: Partial<Doctor>): Promise<Doctor> => {
  const response = await axios.put(`/api/doctors/${id}`, data);
  return response.data;
};
```

## API за Наличност

### Интерфейси
```typescript
interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Availability {
  id: number;
  date: string;
  time_slots: TimeSlot[];
}

interface AvailabilityParams {
  start_date: string;
  end_date: string;
}
```

### Функции
```typescript
const getAvailability = async (doctorId: number, params: AvailabilityParams): Promise<Availability[]> => {
  const response = await axios.get(`/api/doctors/${doctorId}/availability`, { params });
  return response.data;
};

const updateAvailability = async (doctorId: number, availability: Availability[]): Promise<void> => {
  await axios.put(`/api/doctors/${doctorId}/availability`, { availability });
};
```

## API за Прегледи

### Интерфейси
```typescript
interface Appointment {
  id: number;
  doctor: {
    id: number;
    name: string;
    specialty: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

interface AppointmentParams {
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

interface AppointmentResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
}
```

### Функции
```typescript
const getAppointments = async (params: AppointmentParams): Promise<AppointmentResponse> => {
  const response = await axios.get('/api/appointments', { params });
  return response.data;
};

const createAppointment = async (data: {
  doctor_id: number;
  date: string;
  time: string;
  notes?: string;
}): Promise<Appointment> => {
  const response = await axios.post('/api/appointments', data);
  return response.data;
};

const updateAppointment = async (id: number, data: {
  status?: string;
  notes?: string;
}): Promise<Appointment> => {
  const response = await axios.put(`/api/appointments/${id}`, data);
  return response.data;
};
```

## Общи Утилити

### Обработка на Грешки
```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
}

const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data.message,
      code: error.response.data.code,
      status: error.response.status
    };
  }
  return {
    message: 'Възникна грешка при обработката на заявката',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
};
```

### Управление на Токени
```typescript
const setAuthToken = (token: string): void => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeAuthToken = (): void => {
  delete axios.defaults.headers.common['Authorization'];
};
```

## Примери за Използване

### Вход в Системата
```typescript
const handleLogin = async (username: string, password: string) => {
  try {
    const response = await login({ username, password });
    setAuthToken(response.token);
    // Пренасочване към началната страница
  } catch (error) {
    const apiError = handleApiError(error);
    // Показване на съобщение за грешка
  }
};
```

### Търсене на Лекари
```typescript
const searchDoctorsBySpecialty = async (specialty: string) => {
  try {
    const response = await searchDoctors({ specialty });
    // Актуализиране на списъка с лекари
  } catch (error) {
    const apiError = handleApiError(error);
    // Показване на съобщение за грешка
  }
};
```

## Бележки за Имплементацията

### Асинхронни Функции
- Всички API функции са асинхронни
- Използва се async/await синтаксис
- Обработка на грешки с try/catch

### Обработка на Грешки
- Централизирана обработка на грешки
- Типизирани съобщения за грешки
- Логване на грешки

### JWT Токени
- Автоматично добавяне на токени
- Обновяване на токени
- Изчистване при изход 
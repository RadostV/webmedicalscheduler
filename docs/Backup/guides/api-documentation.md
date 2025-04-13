# API Documentation

This document provides detailed information about the Medical Appointment System API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:3001/api
```

For production environments, replace with your production API URL.

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT).

### Authentication Header

Include the JWT token in the Authorization header of your requests:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

To obtain a JWT token, use the login endpoint:

```
POST /auth/login
```

## API Endpoints

### Authentication

#### Register a New User

```
POST /auth/register
```

**Request Body:**

```json
{
  "username": "string",
  "password": "string",
  "accountType": "PATIENT" | "DOCTOR",
  "specialty": "string" // Required only for DOCTOR accounts
}
```

**Response:**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "accountType": "PATIENT" | "DOCTOR",
    "doctorProfile": {
      "id": "string",
      "specialty": "string"
    } // Only for DOCTOR accounts
  }
}
```

**Status Codes:**

- 201: User created successfully
- 400: Invalid request body
- 409: Username already exists

#### User Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "accountType": "PATIENT" | "DOCTOR",
    "doctorProfile": {
      "id": "string",
      "specialty": "string"
    } // Only for DOCTOR accounts
  }
}
```

**Status Codes:**

- 200: Login successful
- 401: Invalid credentials

### Doctor Endpoints

#### Get Doctor's Appointments

```
GET /doctors/appointments
```

**Authentication:** Required (DOCTOR role)

**Query Parameters:**

- `status` (optional): Filter by appointment status
- `date` (optional): Filter by date (YYYY-MM-DD)

**Response:**

```json
[
  {
    "id": "string",
    "date": "string",
    "time": "string",
    "status": "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
    "patientId": "string",
    "doctorId": "string",
    "patient": {
      "id": "string",
      "username": "string"
    }
  }
]
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (not a doctor)

#### Update Appointment Status

```
PATCH /doctors/appointments/:id/status
```

**Authentication:** Required (DOCTOR role)

**URL Parameters:**

- `id`: Appointment ID

**Request Body:**

```json
{
  "status": "CONFIRMED" | "CANCELLED" | "COMPLETED"
}
```

**Response:**

```json
{
  "id": "string",
  "date": "string",
  "time": "string",
  "status": "CONFIRMED" | "CANCELLED" | "COMPLETED",
  "patientId": "string",
  "doctorId": "string"
}
```

**Status Codes:**

- 200: Success
- 400: Invalid status
- 401: Unauthorized
- 403: Forbidden (not the doctor for this appointment)
- 404: Appointment not found

#### Get Doctor's Availability

```
GET /doctors/availability
```

**Authentication:** Required (DOCTOR role)

**Response:**

```json
[
  {
    "id": "string",
    "date": "string",
    "startTime": "string",
    "endTime": "string",
    "doctorId": "string"
  }
]
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (not a doctor)

#### Set Doctor's Availability

```
POST /doctors/availability
```

**Authentication:** Required (DOCTOR role)

**Request Body:**

```json
{
  "date": "string", // YYYY-MM-DD
  "startTime": "string", // HH:MM
  "endTime": "string" // HH:MM
}
```

**Response:**

```json
{
  "id": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "doctorId": "string"
}
```

**Status Codes:**

- 201: Created
- 400: Invalid request body
- 401: Unauthorized
- 403: Forbidden (not a doctor)
- 409: Overlapping availability

#### Delete Availability Slot

```
DELETE /doctors/availability/:id
```

**Authentication:** Required (DOCTOR role)

**URL Parameters:**

- `id`: Availability ID

**Response:**

```json
{
  "message": "Availability deleted successfully"
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (not the doctor for this availability)
- 404: Availability not found

### Patient Endpoints

#### Get Patient's Appointments

```
GET /patients/appointments
```

**Authentication:** Required (PATIENT role)

**Query Parameters:**

- `status` (optional): Filter by appointment status
- `date` (optional): Filter by date (YYYY-MM-DD)

**Response:**

```json
[
  {
    "id": "string",
    "date": "string",
    "time": "string",
    "status": "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
    "patientId": "string",
    "doctorId": "string",
    "doctor": {
      "id": "string",
      "username": "string",
      "doctorProfile": {
        "specialty": "string"
      }
    }
  }
]
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (not a patient)

#### Schedule an Appointment

```
POST /patients/appointments
```

**Authentication:** Required (PATIENT role)

**Request Body:**

```json
{
  "doctorId": "string",
  "date": "string", // YYYY-MM-DD
  "time": "string" // HH:MM
}
```

**Response:**

```json
{
  "id": "string",
  "date": "string",
  "time": "string",
  "status": "PENDING",
  "patientId": "string",
  "doctorId": "string"
}
```

**Status Codes:**

- 201: Created
- 400: Invalid request body
- 401: Unauthorized
- 403: Forbidden (not a patient)
- 409: Time slot not available

#### Cancel an Appointment

```
PATCH /patients/appointments/:id/cancel
```

**Authentication:** Required (PATIENT role)

**URL Parameters:**

- `id`: Appointment ID

**Response:**

```json
{
  "id": "string",
  "date": "string",
  "time": "string",
  "status": "CANCELLED",
  "patientId": "string",
  "doctorId": "string"
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 403: Forbidden (not the patient for this appointment)
- 404: Appointment not found
- 409: Appointment cannot be cancelled (e.g., already completed)

### Doctor Information

#### Get All Doctors

```
GET /doctors
```

**Authentication:** Required (PATIENT role)

**Query Parameters:**

- `specialty` (optional): Filter by specialty

**Response:**

```json
[
  {
    "id": "string",
    "username": "string",
    "doctorProfile": {
      "id": "string",
      "specialty": "string"
    }
  }
]
```

**Status Codes:**

- 200: Success
- 401: Unauthorized

#### Get Doctor Details

```
GET /doctors/:id
```

**Authentication:** Required

**URL Parameters:**

- `id`: Doctor ID

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "doctorProfile": {
    "id": "string",
    "specialty": "string"
  }
}
```

**Status Codes:**

- 200: Success
- 401: Unauthorized
- 404: Doctor not found

#### Get Doctor's Available Time Slots

```
GET /doctors/:id/slots
```

**Authentication:** Required (PATIENT role)

**URL Parameters:**

- `id`: Doctor ID

**Query Parameters:**

- `date`: Date to check (YYYY-MM-DD)

**Response:**

```json
{
  "availableSlots": ["09:00", "09:30", "10:00", "10:30"]
}
```

**Status Codes:**

- 200: Success
- 400: Invalid date
- 401: Unauthorized
- 404: Doctor not found

## Error Responses

All API errors follow this format:

```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `CONFLICT`: Resource conflict
- `INTERNAL_ERROR`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate limited, you'll receive a 429 Too Many Requests response with a Retry-After header indicating when you can try again.

## Pagination

For endpoints that return lists, pagination is supported using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

Paginated responses include metadata:

```json
{
  "data": [...], // The actual items
  "pagination": {
    "total": 100, // Total number of items
    "pages": 10, // Total number of pages
    "current": 1, // Current page
    "limit": 10 // Items per page
  }
}
```

## Versioning

The API version is included in the URL path:

```
/api/v1/resource
```

The current version is v1. When new versions are released, the old versions will remain available for a deprecation period.

## Swagger Documentation

A Swagger UI is available at:

```
http://localhost:3001/api-docs
```

This provides an interactive documentation where you can test API endpoints directly.

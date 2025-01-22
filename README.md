# Emergency Service Locator Backend

This is the backend service for the Emergency Service Locator application. It provides APIs to locate emergency services, update service status, and manage emergency service data using Firebase as the database.

## Features

- Fetch all emergency services
- Locate the nearest emergency service based on geolocation
- Update the status of a specific emergency service
- Create new emergency services
- Update existing emergency services

## Requirements

- Node.js (v22 or latest)
- Firebase Admin SDK
- Express
- TypeScript

## Installation

1. Clone the repository:

   ```bash
   https://github.com/NAMUS09/EmergencyServiceLocator.git emergency-service-locator-backend
   cd emergency-service-locator-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase:

   - Create a Firebase project on the [Firebase Console](https://console.firebase.google.com/).
   - Download the Firebase Admin SDK service account key (JSON file).
   - Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of the downloaded JSON file.

4. Run the development server:

   ```bash
   npm run start
   ```

   The backend will be available at `http://localhost:3000`.

## API Endpoints

### 1. **GET /api/services/all**

Fetches a list of all emergency services.

#### Request

```http
GET /api/services/all
```

#### Response

```json
[
  {
    "id": "-OH8BdVcUDvwR4nurr-5",
    "location": {
      "col": 2,
      "row": 2
    },
    "status": "open",
    "type": "hospital"
  }
]
```

#### Status Codes

- `200 OK`: Successfully fetched the list of services.
- `500 Internal Server Error`: Failed to fetch services.

---

### 2. **GET /api/nearest**

Finds the nearest emergency service based on provided location.

#### Request

```http
GET /api/nearest?row=2&col=2&serviceType=hospital
```

#### Response

```json
{
  "paths": [
    {
      "row": 9,
      "col": 2
    },
    {
      "row": 10,
      "col": 2
    },
    {
      "row": 10,
      "col": 3
    }
  ],
  "distance": 9
}
```

#### Status Codes

- `200 OK`: Successfully found the nearest service.
- `400 Bad Request`: Missing or invalid query parameters.
- `500 Internal Server Error`: Failed to find the nearest service.

---

### 3. **POST /api/services/create**

Creates a new emergency service.

#### Request

```http
POST /api/services/create
Content-Type: application/json
```

```json
{
  "location": { "row": 9, "col": 2 },
  "type": "ambulance",
  "status": "open"
}
```

#### Response

```json
{
    "id": "-OH8BdVcUDvwR4nurr-5",
    "location": {
        "col": 9,
        "row": 2
    },
    "status": "open",
    "type": "ambulance"
},
```

#### Status Codes

- `201 Created`: Successfully created the service.
- `400 Bad Request`: Invalid input data.
- `500 Internal Server Error`: Failed to create the service.

---

### 4. **POST /api/services/update**

Updates an existing emergency service.

#### Request

```http
POST /api/services/update
Content-Type: application/json
```

```json
{
  "serviceId": "-OH8BdVcUDvwR4nurr-5",
  "status": "closed"
}
```

#### Response

```json
{
    "id": "-OH8BdVcUDvwR4nurr-5",
    "location": {
        "col": 9,
        "row": 2
    },
    "status": "open",
    "type": "ambulance"
},
```

#### Status Codes

- `200 OK`: Successfully updated the service.
- `400 Bad Request`: Invalid input data.
- `404 Not Found`: Service with the provided ID not found.
- `500 Internal Server Error`: Failed to update the service.

---

### 5. **GET /api/services/status**

Get the status of a specific emergency service.

#### Request

```http
GET /api/services/status?serviceId=-OH8BdVcUDvwR4nurr-5
```

#### Response

```json
{
  "status": "open"
}
```

#### Status Codes

- `200 OK`: Successfully updated the service status.
- `400 Bad Request`: Invalid input data.
- `404 Not Found`: Service with the provided ID not found.
- `500 Internal Server Error`: Failed to update the service status.

---

## Development

To run the project locally, follow these steps:

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase Admin SDK (as mentioned in the installation section).
4. Start the development server:

   ```bash
   npm run start
   ```

5. The API will be accessible at `http://localhost:3000`.

---

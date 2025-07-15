# CreatorConnect API Documentation

**Version**: 1.0  
**Base URL**: `/api`

This document provides detailed specifications for the CreatorConnect REST API.

---

## Authentication

The API is currently open for simplicity, but production deployments should secure sensitive endpoints (e.g., POST, PUT, DELETE) using a method like API Key authentication, OAuth, or JWT.

---

## Endpoints

### 1. Briefs

#### 1.1 Submit a Brief and Get Matches

-   **Endpoint**: `POST /briefs`
-   **Description**: Submits a new brief, triggers the dual-layer matching algorithm, and returns a list of both traditional and AI-enhanced creator matches.
-   **Request Body**: `application/json`

```json
{
  "title": "string",
  "description": "string",
  "location": {
    "city": "string",
    "country": "string"
  },
  "category": "string",
  "preferredStyles": ["string"],
  "budgetMax": "number",
  "startDate": "Date",
  "endDate": "Date",
  "clientName": "string",
  "clientEmail": "string"
}
```

-   **Success Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "brief": {
      "_id": "60d5f1b3e7b3c2a4e8f4b3a0",
      "title": "Summer Campaign Photoshoot",
      // ... other brief fields
      "enhancedMatches": [
        {
          "creatorId": "60d5f1b3e7b3c2a4e8f4b3a1",
          "totalScore": 23.4,
          "ruleBasedScore": 15,
          "semanticScore": 8.4,
          "explanation": "This creator's vibrant and candid style is a perfect semantic match for your 'authentic moments' brief...",
          "match": {
            "name": "Alice Johnson",
            // ... creator fields
          }
        }
      ],
      "traditionalMatches": [
        {
          "creatorId": "60d5f1b3e7b3c2a4e8f4b3a2",
          "score": 15,
          "explanation": ["Location match", "Category match", "Budget compatible"],
          "match": {
            "name": "Bob Williams",
            // ... creator fields
          }
        }
      ]
    },
    "aiEnabled": true,
    "processingTime": "2.8s"
  }
}
```

-   **Error Responses**:
    -   `400 Bad Request`: If required fields are missing or invalid.
    ```json
    {
      "success": false,
      "error": "Invalid input: 'title' is required."
    }
    ```
    -   `500 Internal Server Error`: If there's a database connection issue or an unexpected error during matching.
    ```json
    {
      "success": false,
      "error": "Failed to connect to the database."
    }
    ```

#### 1.2 Get All Briefs

-   **Endpoint**: `GET /briefs`
-   **Description**: Retrieves a list of all briefs that have been submitted.
-   **Success Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5f1b3e7b3c2a4e8f4b3a0",
      "title": "Summer Campaign Photoshoot",
      // ... other brief fields
    }
  ]
}
```

---

### 2. Creators

#### 2.1 Get All Creators

-   **Endpoint**: `GET /creators`
-   **Description**: Retrieves a list of all creators in the database.
-   **Success Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5f1b3e7b3c2a4e8f4b3a1",
      "name": "Alice Johnson",
      "aiDescription": "A photographer specializing in capturing authentic, candid moments with a vibrant and warm aesthetic.",
      // ... other creator fields
    }
  ]
}
```

#### 2.2 Add a New Creator

-   **Endpoint**: `POST /creators`
-   **Description**: Adds a new creator to the database. If AI is enabled, it automatically generates and stores an `aiDescription` and `embedding` for the new creator.
-   **Request Body**: `application/json`

```json
{
  "name": "string",
  "location": { "city": "string", "country": "string" },
  "categories": ["string"],
  "skills": ["string"],
  "experienceYears": "number",
  "budgetRange": { "min": "number", "max": "number" },
  "portfolio": [{ "url": "string", "tags": ["string"] }],
  "rating": "number",
  "bio": "string"
}
```

-   **Success Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "60d5f1b3e7b3c2a4e8f4b3a3",
    "name": "Charlie Brown",
    "aiDescription": "A versatile videographer with a knack for storytelling...",
    // ... other fields
  }
}
```

---

### 3. System & Data Management

#### 3.1 Submit Feedback

-   **Endpoint**: `POST /feedback`
-   **Description**: Stores user feedback on the quality of matches. (Note: The data is stored but not yet used to retrain the model in v1).
-   **Request Body**: `application/json`

```json
{
  "briefId": "string (ObjectID)",
  "creatorId": "string (ObjectID)",
  "rating": "number (1-5)",
  "comment": "string"
}
```

-   **Success Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "60d5f1b3e7b3c2a4e8f4b3a4",
    // ... feedback fields
  }
}
```

#### 3.2 Seed Sample Data

-   **Endpoint**: `POST /seed`
-   **Description**: Clears the existing database and seeds it with a predefined set of sample creators and briefs. This is a destructive operation intended for development and testing.
-   **Success Response**: `200 OK`

```json
{
  "success": true,
  "message": "Database seeded successfully.",
  "data": {
    "creators": 10,
    "briefs": 5
  }
}
```

#### 3.3 Health Check

-   **Endpoint**: `GET /health`
-   **Description**: Checks the status of critical services (Database and AI) and returns their operational status.
-   **Success Response**: `200 OK`

```json
{
  "status": "ok",
  "services": {
    "database": {
      "status": "ok",
      "message": "Connected successfully."
    },
    "ai": {
      "status": "ok",
      "message": "GEMINI_API_KEY is configured."
    }
  },
  "timestamp": "2025-07-15T12:00:00.000Z"
}
```
-   **Partial Outage Response**: `200 OK` (The endpoint itself is working)
```json
{
  "status": "partial_outage",
  "services": {
    "database": {
      "status": "ok",
      "message": "Connected successfully."
    },
    "ai": {
      "status": "error",
      "message": "GEMINI_API_KEY is not configured. AI features are disabled."
    }
  },
  "timestamp": "2025-07-15T12:00:00.000Z"
}
```

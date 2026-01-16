d# API Endpoints

This document outlines the API endpoints for the Convenio Management App.

## Authentication

### POST /api/login

*   **Description:** Authenticates a user.
*   **Request Body:**
    ```json
    {
        "username": "user",
        "password": "password"
    }
    ```
*   **Response:**
    ```json
    {
        "success": true,
        "token": "jwt_token"
    }
    ```

### POST /api/logout

*   **Description:** Logs out a user.
*   **Request Body:** None
*   **Response:**
    ```json
    {
        "success": true
    }
    ```

## News

### GET /api/news

*   **Description:** Gets a list of news articles.
*   **Response:**
    ```json
    [
        {
            "id": 1,
            "title": "News Title 1",
            "content": "News content..."
        },
        {
            "id": 2,
            "title": "News Title 2",
            "content": "News content..."
        }
    ]
    ```

### POST /api/news

*   **Description:** Creates a new news article.
*   **Request Body:**
    ```json
    {
        "title": "New News Title",
        "content": "New news content..."
    }
    ```
*   **Response:**
    ```json
    {
        "id": 3,
        "title": "New News Title",
        "content": "New news content..."
    }
    ```

### PUT /api/news/:id

*   **Description:** Updates an existing news article.
*   **Request Body:**
    ```json
    {
        "title": "Updated News Title",
        "content": "Updated news content..."
    }
    ```
*   **Response:**
    ```json
    {
        "id": 1,
        "title": "Updated News Title",
        "content": "Updated news content..."
    }
    ```

### DELETE /api/news/:id

*   **Description:** Deletes a news article.
*   **Response:**
    ```json
    {
        "success": true
    }
    ```

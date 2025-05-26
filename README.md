# CatCafeProject

## Project overview
CatCafeProject is an API designed to facilitate automation testing for a Cat Café management system. It provides endpoints for managing cats, their staff, adopters and to register and log in to be able to call the staff endpoints. It features a Swagger documentation for its endpoints.
In the files, you can also find a complete Postman collection for test reference and quick testing.

## Prerequisites for local use
- Node.js
- npm (Node Package Manager)
- PostgreSQL installed with user and password set up

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/CodingRainbowCat/CatCafeProject.git
    ```
2. Navigate to the project directory:
    ```sh
    cd CatCafeProject
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Run PostgreSQL Server from services.msc: Look for a Service called "postgresql-x64-17", right click -> Start.
5. Create a DB called 'cat_cafe_db':
    ```sh
    cd "C:\Program Files\PostgreSQL\17\bin"
    psql.exe -U postgres
    CREATE DATABASE cat_cafe_db
    ```
6. Create an .env file in the CatCafeProject folder and set it up with the following values:
    ```sh
    RDS_HOSTNAME=localhost
    RDS_PORT=5432
    RDS_USERNAME=[username provided on PostreSQL setup, or its default value: "postgres"]
    RDS_PASSWORD=[password provided on PostgreSQL setup]
    RDS_DB_NAME=cat_cafe_db
    ```

## Running the Project
To run the API, open a cmd from the folder where you have the project and run the following command:
```sh
npm run dev
```
You can also open the project in Visual Studio Code and execute the command in the VS terminal.
After the server starts, you can access the Swagger interface by opening [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser.

### Authentication
The staff endpoints have JWT authentication, and uses a JWT secret. A JWT secret is a string used to sign and verify JSON Web Tokens (JWTs).  It's essential for ensuring that your JWTs are secure and can't be tampered with.
When you create a JWT, you use the secret to generate a signature. When a user sends the JWT back, your server uses the same secret to verify the signature.
You'll need to add to the .env file this variable: "JWT_SECRET=". Use a long, random, and unpredictable string for the value.

Using JWT Authentication also means that you'll be working with a Bearer Token that you need to send in the header whenever you want to call an endpoint. You can set the header in the config like this:
```sh
const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
```
The /login endpoint returns an Access Token and a Refresh Token. The Access Token is the one that you need to send in the header of each protected endpoint. The Refresh Token is used to get a new Access Token when it expires, using the /refresh endpoint.
To generate credentials for the /login endpoint you must create an user with the /register endpoint.

To disable authentication (for development purposes), you can run the project with the DISABLE_AUTH environment variable:

Windows (PowerShell):
```sh
$env:DISABLE_AUTH="true"; npm run dev
```

Linux/Mac:
```sh
DISABLE_AUTH=true npm run dev
```

### Rate limit and Token expiration

The Login endpoint is set to accept up to 5 attempts. If you could not log in correctly after 5 attempts, you will be asked to wait 5 minutes.
These settings are set in the routes/authRoutes.ts file, under the loginLimiter constant.

To disable the rate limit, you can run the project with the DISABLE_RATE_LIMIT environment variable:
Windows (PowerShell):
```sh
$env:DISABLE_RATE_LIMIT="true"; npm run dev
```
Linux/Mac:
```sh
DISABLE_RATE_LIMIT=true npm run dev
```
And use the header "x-skip-rate-limit" with the value "true" in your request.

The Access Token expiration is set to 15 minutes, and the expiration of the Refresh Token is set to 7 days.
These settings are set in the middleware/auth.ts file.


## Endpoints

### Auth
- `POST /auth/register` - Let you create a user to authenticate later
- `POST /auth/login` - Logs you in with a user and returns a Token, that you'll need for Staff endpoints
- `POST /auth/refresh` - When your token has expired (after 15 minutes), you can use this to get a new one so you don't need to log in again

### Cats
- `GET /cats` - Retrieve a list of all cats
- `POST /cats` - Add a new cat
- `GET /cats/:id` - Retrieve a specific cat by ID
- `PUT /cats/:id` - Update a specific cat by ID
- `DELETE /cats/:id` - Delete a specific cat by ID
- `PATCH /cats/:id` - Update the cat's staff in charge and/or its adopter by the cat's ID

### Staff (Auth required)
- `GET /staff` - Retrieve a list of all staff members
- `POST /staff` - Add a new staff member
- `GET /staff/:id` - Retrieve a specific staff member by ID
- `DELETE /staff/:id` - Delete a specific staff member by ID

### Adopters
- `GET /adopters` - Retrieve a list of all adopters
- `POST /adopters` - Add a new adopter
- `GET /adopters/:id` - Retrieve a specific adopter by ID
- `DELETE /adopters/:id` - Delete a specific adopter by ID

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

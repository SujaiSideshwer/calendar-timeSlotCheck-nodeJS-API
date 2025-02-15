How to run this Node.js Internal Calendar API:
1. Download all the file under one directory.
2. Based on the sample env file provided(sample.env), create a ".env" file on your root directory where server.js is present with all details about your postgreSQL DB and server port that you would run this in.
3. Give "npm i" in your terminal after moving to the root directory where you've downloaded this file in. This shall install all the relevant npm packages.
4. To run this code in dev mode, just give "nodemon server.js" from your root directory in your terminal.
5. To run this code in production mode, give "npm run start" from your root directory in your terminal.

Note: A postgreSQL DB needs to be created and then is details need to be provided in the aforementioned .env file for running the code

How to get outputs:
1. Use Postman or a similar app for API testing.
2. Give this endpoint initially to signup a user, changing the service port based on your .env file(eg: 5000): http://http://localhost:5000/api/v1/auth/signup
3. Give a user in this JSON format (start and end times are optional, can be given in another login session as well):
    {
    "email": "sujai@iit.com",
    "password": "123456",
    "start_time": "2024-10-16T08:30:00.000Z",
    "end_time": "2024-10-16T09:30:00.000Z"
    }
4. We can logout of the user using this endpoint: http://http://localhost:5000/api/v1/auth/logout
5. Subsequently we can log back in and change your start and end times in this endpoint: http://http://localhost:5000/api/v1/auth/login
    JSON format to give input here:
    {
    "email": "sujai@iit.com",
    "password": "123456",
    "start_time": "2024-10-16T08:30:00.000Z", //optional for changing time slot
    "end_time": "2024-10-16T09:30:00.000Z" //optional for changing time slot
    }
6. We can get a common time slots for the required IDs using this endpoint: http://http://localhost:5000/api/v1/auth/commonslot
    JSON format to give the IDs for those individuals you need to schedule a meeting on:
    {
        "userIds": [1,2,3,4] //change the ID numbers based on your choice to obtain a common slot
    }

How the code is split into different files:
1. config:
    a) db.js:
        This initialises a "db" client from the postges npm package "pg", based on the details given in the environment variables and starts the database
    b) envVars.js:
        This reads the environment variables from the .env file (which you need to create from your details) using the "dotenv" npm package ans assigns it to js variables for exporting to use in other files.
2. controllers:
    a) auth.controller.js:
        Contains all the functions for Login, Logout, Signup, commonSlotForMeeting.
        i) Signup:
            Obtains the email, password, start_time(optional) & end_time(optional) from the user and performs these checks:
                -Checks whether password is above 6 characters
                -Checks if email already exists from the DB & whether its a valid email address
            If all are satisfied:
                -Password is hashed and encrypted using the bcryptjs npm package.
                -User details are added to the DBs (user details and their meeting timings if provided here)
                -Generates and stores a token cookie to store user signing up and logged in data
        ii) Login:
            -Checks if the enterred email exists in our DB
            -Compares the enterred password and the signed up password
            -Logs user in based on this and sends a cookie token to register and store user login data
        iii) Logout:
            Removes the cookie stored for erasing the user login status. user would have to login again to enter data
        iv) commonSlotForMeeting:
            Based on the userIds enterred, the logic obtains the start and end times enterred by the users from the DB table "meetings" that stores all this data.
            Sorts these data in an array based on their start time, earliest first.
            Then uses a logic that compares adjacent values and stores the greater start time in the accumulator.
            Similarly it stores the smaller end time in the accumulator.
            Like this it goes through the whole list and provides a common slot if present for all the userIds.
            Else it provides no common slot for the userIds.
3. middleware:
    a) protectRoute.js:
        Is used for expoting a function that validates whether the user has alread been authenticated using a json web token and verifies if its valid.
        Then lets user enter the next stage.
4. models:
    a) calendar.model.js:
        Stores the SQL code that creates the schema (calendarAPI_schema) and table at the first time when the code runs. It builds 2 tables to store data:
        i) users:
            Stores the user email, password (hashed) and serial ID when signed up
        ii) meetings:
            Stores the userID (foreign key that references the user table), serial ID, start_time and end_time.
5. routes:
    a) api.route.js:
        creates an express router to route the user to the various login/logout/signup/commonSlotForMeeting routes based on the functions got from auth.controller.js
6. utils:
    a) generateToken.js:
        Creates a json web token using the "jwt" npm package and signs it with the user ID. This is designated to expire the jwt token in 15 days.
        This is used for authenticating the user on login and authorizing the user before checking the common slot.    


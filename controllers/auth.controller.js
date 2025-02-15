import db from "../config/db.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export async function signup(req, res) {
  try {
    const { email, password, start_time, end_time } = req.body;

    // If email/password is not enterred give error
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // check if enterred email is valid using standard RegEx method
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }

    // check if password length is above 6
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be atleast 6 characters",
      });
    }

    // check if enterred email already exists
    const existingUseremail = await db.query(
      "SELECT * FROM calendarAPI_schema.users WHERE email = $1;",
      [email]
    );
    if (existingUseremail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // salting & hashing the password for preventing visibility
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // if all conditions are satisfied, then create a new user based on the given data
    // adding to the users table:
    const addUser = await db.query(
      "INSERT INTO calendarAPI_schema.users (email, password) VALUES ($1, $2) RETURNING id;",
      [email, hashedPassword]
    );

    const updatedUserDetails = {
      id: addUser.rows[0].id,
      email: email,
      startingTime: start_time && start_time,
      endingTime: end_time && end_time,
    };

    // if all go well, add the start time and end time to the meetings table, if provided here
    if (start_time) {
      await db.query(
        "INSERT INTO calendarAPI_schema.meetings (user_id, start_time, end_time) VALUES ($1, $2, $3);",
        [addUser.rows[0].id, start_time, end_time]
      );
    }

    // generate cookie token if credentials are valid
    generateTokenAndSetCookie(updatedUserDetails.id, res);

    // return 201 status with user details except password
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: updatedUserDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function loginroute(req, res) {
  try {
    const { email, password, start_time, end_time } = req.body;

    // If email/password is not enterred give error
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // finding the user from email
    const user = await db.query(
      "SELECT * FROM calendarAPI_schema.users WHERE email = $1;",
      [email]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // checking if password is correct
    const isPasswordCorrect = await bcryptjs.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordCorrect) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate cookie token if credentials are valid
    generateTokenAndSetCookie(user.rows[0].id, res);

    // add start time & end time if user enterred them
    if (start_time) {
      await db.query(
        "INSERT INTO calendarAPI_schema.meetings (user_id, start_time, end_time) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET start_time = COALESCE(EXCLUDED.start_time, meetings.start_time), end_time = COALESCE(EXCLUDED.end_time, meetings.end_time);",
        [user.rows[0].id, start_time, end_time]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Logged in",
      user: {
        ...user.rows[0],
        password: "",
        startingTime: start_time && start_time,
        endingTime: end_time && end_time,
      },
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function logoutroute(req, res) {
  try {
    res.clearCookie("jwt-calendar-api");
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    console.log("Error in logout controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function commonSlotForMeeting(req, res) {
  const { userIds } = req.body;
  try {
    const result = await db.query(
      "SELECT user_id, start_time, end_time FROM calendarAPI_schema.meetings WHERE user_id = ANY($1::int[]) ORDER BY start_time;",
      [userIds]
    );

    const availabilitySlots = result.rows;
    console.log(availabilitySlots);

    // Find overlapping time slots
    let commonSlots = availabilitySlots.reduce((acc, slot) => {
      //acc is the accumulator that gets the start time and end time added after each iteration based on comparison with each give slot from the availabilitySlots array
      if (acc == null) {
        return { start: slot.start_time, end: slot.end_time }; //at the start this assigns the first timeslot from your availabilitySlots array to the accumulator
      } else {
        // Find the intersection with the current common slot
        const overlapStart = new Date(
          Math.max(new Date(acc.start), new Date(slot.start_time)) //this compares the start time from the current accumulator value and the next slot, and assign whichever is higher
        );
        const overlapEnd = new Date(
          Math.min(new Date(acc.end), new Date(slot.end_time)) //this performs the same logic as above, but the smaller end time amongs the current accumulator and the next slot
        );

        if (overlapStart < overlapEnd) {
          // If there's an overlap, update the common slot
          return { start: overlapStart, end: overlapEnd };
        } else {
          // If no overlap, return null (no common slot)
          return null;
        }
      }
    }, null);

    // If no common slots found
    if (commonSlots === null) {
      return res.status(404).json({ error: "No common time slot found." });
    }

    // Return the first common slot
    res.json({ commonSlot: commonSlots });
  } catch (error) {
    res.status(400).json({ error: error });
  }
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import db, { auth } from "../db.js";
import { generateOTP, transporter } from "./otpController.js";

const generate6AlphaPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export const fetchAdmins = async (req, res) => {
  try {
    const adminsSnapshot = await getDocs(collection(db, "admin"));
    const admins = adminsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

export const createUser = async (req, res) => {
  const { name, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await getDoc(doc(db, "admin", email));
    if (existingUser.exists()) {
      return res.status(400).json({ message: "User already exists" });
    }
    const password = generate6AlphaPassword();
    console.log(`Generated password for ${email}: ${password}`);
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const userId = user.user.uid;
    await setDoc(doc(db, "admin", userId), {
      name,
      email,
      userId,
      createdAt: new Date(),
    });
    const mailOptions = {
      from: "GemBiz Seller Application <no.reply.gembiz@gmail.com>",
      to: email,
      subject: "Welcome to GemBiz - Your Admin Account Details",
      html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>GemBiz Admin Account Created</title>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 30px 20px;
                  background-color: #ffffff;
                  border-radius: 16px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                .header {
                  text-align: center;
                  padding: 20px 0;
                  position: relative;
                }
                .header:after {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 80%;
                  height: 2px;
                  background: linear-gradient(to right, transparent, #eee, transparent);
                }
                .content {
                  padding: 40px 30px;
                  text-align: center;
                }
                .visit-button {
                  display: inline-block;
                  margin: 20px 0;
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                  color: #fff !important;
                  text-decoration: none;
                  border-radius: 25px;
                  font-weight: 500;
                  transition: transform 0.2s, box-shadow 0.2s;
                  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
                }
                .visit-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
                }
                .credentials-container {
                  margin: 30px 0;
                  padding: 25px;
                  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                  border-radius: 12px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .credentials {
                  font-size: 18px;
                  color: #333;
                  margin: 15px 0;
                }
                .password {
                  font-family: monospace;
                  font-size: 28px;
                  font-weight: bold;
                  letter-spacing: 4px;
                  color: #333;
                  margin: 15px 0;
                  padding: 15px;
                  background: #fff;
                  border-radius: 8px;
                  border: 2px dashed #007bff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .section-title {
                  color: #007bff;
                  font-size: 22px;
                  margin-bottom: 15px;
                  font-weight: 500;
                }
                .footer {
                  text-align: center;
                  color: #666;
                  font-size: 14px;
                  padding: 20px;
                  margin-top: 20px;
                  border-top: 1px solid rgba(0, 0, 0, 0.05);
                }
                .warning {
                  color: #dc3545;
                  font-size: 14px;
                  margin-top: 25px;
                  padding: 10px 15px;
                  background-color: rgba(220, 53, 69, 0.1);
                  border-radius: 6px;
                  display: inline-block;
                }
                @media only screen and (max-width: 480px) {
                  .container {
                    width: 100%;
                    border-radius: 0;
                    padding: 20px 15px;
                  }
                  .content {
                    padding: 30px 20px;
                  }
                  .password {
                    font-size: 24px;
                    letter-spacing: 3px;
                  }
                  .visit-button {
                    width: 100%;
                    text-align: center;
                    padding: 15px 20px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="color: #333; margin: 0;">GemBiz</h1>
                </div>
                <div class="content">
                  <h2 style="color: #2c3e50; margin-bottom: 25px; font-size: 28px;">Welcome to GemBiz Admin</h2>
                  <p style="color: #666; font-size: 16px;">Your admin account has been created successfully.</p>
                  <a href="https://gembiz.aditya-bansal.tech" class="visit-button">Visit GemBiz Platform</a>
                  <div class="credentials-container">
                    <h3 class="section-title">Your Login Credentials</h3>
                    <div class="credentials">
                      <p style="margin: 10px 0;">Email<br><strong>${email}</strong></p>
                      <p style="margin: 15px 0 10px;">Password</p>
                      <div class="password">${password}</div>
                    </div>
                  </div>
                  <p class="warning">Please change your password after logging in for security purposes.</p>
                  <p style="color: #666;">If you didn't request this account, please contact support immediately.</p>
                </div>
                <div class="footer">
                  <p>&copy; 2025 GemBiz. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email", error });
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const usersSnapshot = await getDocs(collection(db, "admin"));
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const verifyEmailAndPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {

    const q = query(collection(db, "admin"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    console.log("Query snapshot:", querySnapshot.docs[0].data());
    if (querySnapshot.empty) {
      return res.status(401).json({ message: "Access denied. Not an admin user." });
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const adminDoc = querySnapshot.docs[0];
    const user = { id: adminDoc.id, ...adminDoc.data() };
    const otp = generateOTP();
    const mailOptions = {
      from: "GemBiz Seller Application <no.reply.gembiz@gmail.com>",
      to: email,
      subject: "Your GemBiz Verification Code",
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GemBiz Verification</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 30px 20px;
                background-color: #ffffff;
                border-radius: 16px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              }
              .header {
                text-align: center;
                padding: 20px 0;
                position: relative;
              }
              .header:after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                height: 2px;
                background: linear-gradient(to right, transparent, #eee, transparent);
              }
              .content {
                padding: 40px 30px;
                text-align: center;
              }
              .otp-container {
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                border-radius: 12px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              }
              .otp-code {
                font-family: monospace;
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 6px;
                color: #333;
                margin: 15px 0;
                padding: 15px;
                background: #fff;
                border-radius: 8px;
                border: 2px dashed #007bff;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 14px;
                padding: 20px;
                margin-top: 20px;
                border-top: 1px solid rgba(0, 0, 0, 0.05);
              }
              .warning {
                color: #dc3545;
                font-size: 14px;
                margin-top: 25px;
                padding: 10px 15px;
                background-color: rgba(220, 53, 69, 0.1);
                border-radius: 6px;
                display: inline-block;
              }
              @media only screen and (max-width: 480px) {
                .container {
                  width: 100%;
                  border-radius: 0;
                  padding: 20px 15px;
                }
                .content {
                  padding: 30px 20px;
                }
                .otp-code {
                  font-size: 32px;
                  letter-spacing: 5px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #333; margin: 0;">GemBiz</h1>
              </div>
              <div class="content">
                <h2 style="color: #2c3e50; margin-bottom: 25px; font-size: 28px;">Two-Step Verification</h2>
                <p style="color: #666; font-size: 16px;">For added security, please enter the following code:</p>
                <div class="otp-container">
                  <div class="otp-code">${otp}</div>
                </div>
                <p class="warning">This code will expire in 5 minutes</p>
                <p style="color: #666;">If you didn't attempt to log in, please contact support immediately.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 GemBiz. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
          `,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email", error });
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({ message: "User verified successfully", user, otp });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error });
  }
};

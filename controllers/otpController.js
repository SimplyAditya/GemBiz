import nodemailer from "nodemailer";

export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "no.reply.gembiz@gmail.com",
    pass: "hwzdexslofmawpnh",
  },
});

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = generateOTP();
  console.log(`OTP for ${email}: ${otp}`);



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
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .content {
          padding: 30px 20px;
          text-align: center;
        }
        .otp-container {
          margin: 25px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #333;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          padding: 20px;
          border-top: 1px solid #eee;
        }
        .warning {
          color: #666;
          font-size: 14px;
          margin-top: 20px;
        }
        @media only screen and (max-width: 480px) {
          .container {
            width: 100%;
            border-radius: 0;
          }
          .content {
            padding: 20px 15px;
          }
          .otp-code {
            font-size: 28px;
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
          <h2 style="color: #444; margin-bottom: 20px;">Verification Code</h2>
          <p style="color: #666;">Please use the following code to verify your account:</p>
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="warning">This code will expire in 5 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 GemBiz. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Error sending OTP" });
  }

  return res.status(200).json({ message: "OTP sent successfully", otp });
};

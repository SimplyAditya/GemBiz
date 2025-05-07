import nodemailer from "nodemailer";

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = generateOTP();
  console.log(`OTP for ${email}: ${otp}`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "no.reply.gembiz@gmail.com",
      pass: "hwzdexslofmawpnh",
    },
  });

  const mailOptions = {
    from: "no.reply.gembiz@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Error sending OTP" });
  }

  return res.status(200).json({ message: "OTP sent successfully", otp });
};

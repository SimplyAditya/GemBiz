import express from "express";
import { sendOTP } from "./controllers/otpController.js";

const app = express();

const PORT = 5501;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
    res.send("Hello World!");
    });


app.post("/send-otp", sendOTP);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

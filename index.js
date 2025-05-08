import express from "express";
import { sendOTP } from "./controllers/otpController.js";
import { approveBusinessCategory, fetchPendingBusinessCategories } from "./controllers/businessCategories.js";
import { approveBusinessCatalogue, fetchPendingBusinessCatalogues } from "./controllers/businessCatalogue.js";
import { approveBusinessSeller, fetchBusinessSellers } from "./controllers/businessSellers.js";
import { createUser } from "./controllers/authController.js";

const app = express();

const PORT = 5501;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get("/", (req, res) => {
    res.send("Hello World!");
    });

app.get("/fetch-pending-business-categories", fetchPendingBusinessCategories);
app.post("/approve-business-category", approveBusinessCategory);
app.get("/fetch-pending-business-catalogues", fetchPendingBusinessCatalogues);
app.post("/approve-business-catalogue", approveBusinessCatalogue);
app.get("/fetch-business-sellers", fetchBusinessSellers);
app.post("/approve-business-seller", approveBusinessSeller);
app.post("/create-user", createUser);


app.post("/send-otp", sendOTP);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

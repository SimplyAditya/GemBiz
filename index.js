import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { sendOTP } from "./controllers/otpController.js";
import { deleteAdmin, deleteCategory, deleteSeller, deleteCatalogue } from "./controllers/deleteController.js";
import { fetchSummaryCounts, getSummaryData, setWssInstance, listenForSummaryChanges } from "./controllers/summaryController.js";
import { fetchAllRegisterBusiness } from "./controllers/registerBusiness.js";
import { approveBusinessCategory, fetchPendingBusinessCategories, fetchAllBusinessCategories } from "./controllers/businessCategories.js";
import { approveBusinessCatalogue, fetchPendingBusinessCatalogues, fetchAllBusinessCatalogue } from "./controllers/businessCatalogue.js";
import { approveBusinessSeller, fetchBusinessSellers } from "./controllers/businessSellers.js";
import { createUser, fetchAdmins, verifyEmailAndPassword } from "./controllers/authController.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
setWssInstance(wss); // Provide wss instance to controller

const PORT = 5501;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



app.get("/", (req, res) => {
    res.send("Hello World!");
    });

app.get("/fetch-pending-business-categories", fetchPendingBusinessCategories);
app.get("/fetch-all-business-categories", fetchAllBusinessCategories);
app.post("/approve-business-category", approveBusinessCategory);
app.get("/fetch-pending-business-catalogues", fetchPendingBusinessCatalogues);
app.get("/fetch-all-business-catalogues", fetchAllBusinessCatalogue);
app.post("/approve-business-catalogue", approveBusinessCatalogue);
app.get("/fetch-business-sellers", fetchBusinessSellers);
app.post("/approve-business-seller", approveBusinessSeller);
app.post("/create-user", createUser);
app.get("/fetch-admins", fetchAdmins);
app.post("/login", verifyEmailAndPassword);

app.post("/send-otp", sendOTP);
app.delete("/delete-admin", deleteAdmin);
app.delete("/delete-category", deleteCategory);
app.delete("/delete-seller", deleteSeller);
app.delete("/delete-catalogue", deleteCatalogue);
app.get("/fetch-summary-counts", fetchSummaryCounts);
app.get("/fetch-all-register-business", fetchAllRegisterBusiness);

wss.on("connection", (ws) => {
  console.log("Client connected for summary counts");

  getSummaryData()
    .then((summary) => {
      console.log("Initial summary data sent to client");
      ws.send(JSON.stringify({ type: "summary", data: summary }));
    })
    .catch((error) => {
      console.error("Error sending initial summary data:", error);
      ws.send(JSON.stringify({ type: "error", message: "Failed to fetch initial summary" }));
    });


  ws.on("close", () => {
    console.log("Client disconnected from summary counts");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error on client connection:", error);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server for summary counts is running on ws://localhost:${PORT}`);
  listenForSummaryChanges();
});

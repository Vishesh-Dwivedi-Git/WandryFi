// Load environment variables from .env file
import dotenv from "dotenv";
import express from "express";
import { ethers } from "ethers";
import cors from "cors";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware for parsing JSON bodies and enabling CORS
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
const VERIFIER_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY;
const SECRET_API_KEY = process.env.API_KEY;

// Ensure essential environment variables are set
if (!VERIFIER_PRIVATE_KEY || !SECRET_API_KEY) {
  console.error("FATAL ERROR: Missing required environment variables.");
  process.exit(1); // Exit the process if the required secrets are not available
}

// Create the wallet instance for our backend verifier
const verifierWallet = new ethers.Wallet(VERIFIER_PRIVATE_KEY);

// Define destinations with latitude, longitude, and country
// Define destinations with latitude, longitude, and country
const destinations = {
  1: { lat: 19.076, lng: 72.8777, country: "IN" }, // Mumbai - Financial Capital
  2: { lat: 27.1751, lng: 78.0421, country: "IN" }, // Taj Mahal - Agra
  3: { lat: 25.3176, lng: 82.9739, country: "IN" }, // Varanasi - Sacred River
  4: { lat: 34.0479, lng: 74.4049, country: "IN" }, // Kashmir - Paradise on Earth
  5: { lat: 13.0827, lng: 80.2707, country: "IN" }, // Chennai - Detroit of India
  6: { lat: 26.93377, lng: 75.9236, country: "IN" }, // LNMIIT Jaipur - Technical Institute
  7: { lat: 22.5726, lng: 88.3639, country: "IN" }, // Kolkata - Cultural Capital
};

/**
 * Function to calculate the distance between two GPS points
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} The distance in meters
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const r = 6371e3; // Radius of Earth in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const deltaP = p2 - p1;
  const deltaL = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c; // Return the distance in meters
}

// --- MAIN API ENDPOINT ---
app.post("/api/verify", async (req, res) => {
  try {
    // --- API Key validation ---
    const receivedApiKey = req.headers["x-api-key"];
    if (receivedApiKey !== SECRET_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract necessary data from the request body
    const { walletAddress, destinationId, userLat, userLon } = req.body;

    if (
      !walletAddress ||
      !destinationId ||
      userLat === undefined ||
      userLon === undefined
    ) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const destination = destinations[destinationId];
    if (!destination) {
      return res.status(404).json({ error: "Destination not found." });
    }

    // --- IP Reputation Check ---
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (userIp && userIp !== "::1") {
      try {
        const ipInfo = await axios.get(
          `http://ip-api.com/json/${userIp}?fields=status,countryCode,proxy,hosting`
        );
        if (ipInfo.data.countryCode !== destination.country) {
          return res.status(403).json({ error: "IP-GPS location mismatch." });
        }
        if (ipInfo.data.proxy || ipInfo.data.hosting) {
          return res.status(403).json({ error: "VPN or Proxy detected." });
        }
      } catch (ipError) {
        console.error("IP lookup service failed:", ipError.message);
        return res
          .status(500)
          .json({ error: "Location integrity verification failed." });
      }
    }

    // --- Distance Check ---
    const distance = getDistance(
      userLat,
      userLon,
      destination.lat,
      destination.lon
    );
    if (distance > 50) {
      return res
        .status(403)
        .json({ error: `You are ${Math.round(distance)} meters away.` });
    }

    // --- Signature Generation ---
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [walletAddress, destinationId]
    );
    console.log(walletAddress, destinationId);
    console.log("Message Hash:", messageHash);

    const signature = await verifierWallet.signMessage(
      ethers.getBytes(messageHash)
    );

    console.log("Generated Signature:", signature);
    // Send the signature back to the client
    res.status(200).json({ signature });
  } catch (error) {
    console.error("Error during verification:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the Express server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

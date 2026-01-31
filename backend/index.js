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
console.log("✅ Verifier wallet initialized:", verifierWallet.address);

// Define destinations with latitude, longitude, and country
// IMPORTANT: These coordinates MUST match frontend/lib/destinations.ts
const destinations = {
  1: { lat: 28.0026, lng: 86.8528, country: "NP" }, // Everest Base Camp
  2: { lat: 33.7898, lng: 76.8112, country: "IN" }, // Chadar Trek
  3: { lat: 30.7268, lng: 79.6081, country: "IN" }, // Valley of Flowers
  4: { lat: 32.3059, lng: 78.0169, country: "IN" }, // Spiti Monastery
  5: { lat: 12.0067, lng: 92.9615, country: "IN" }, // Havelock Island
  6: { lat: 26.9157, lng: 70.9083, country: "IN" }, // Jaisalmer Desert
  7: { lat: 15.3941, lng: 75.0244, country: "IN" }, // IIIT Dharwad (synced with frontend)
  8: { lat: 26.9364, lng: 75.9238, country: "IN" }, // LNMIIT Jaipur
};

/**
 * Function to calculate the distance between two GPS points using Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} The distance in meters
 */
function getDistance(lat1, lon1, lat2, lon2) {
  // Ensure all inputs are numbers (parse if strings)
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  console.log("   📍 Distance Calculation Debug:");
  console.log("      - User Location: (", lat1, ",", lon1, ")");
  console.log("      - Destination:   (", lat2, ",", lon2, ")");

  const r = 6371e3; // Radius of Earth in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const deltaP = p2 - p1;
  const deltaL = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = r * c; // Distance in meters
  console.log("      - Result:", distance.toFixed(2), "meters");

  return distance;
}

//Test-end Point :
app.get("/api", (req, res) => {
  console.log("📡 GET /api - Health check request received");
  res.send("Hello World");
})
// --- MAIN API ENDPOINT ---
app.post("/api/verify", async (req, res) => {
  console.log("\n========================================");
  console.log("📍 POST /api/verify - New verification request");
  console.log("⏰ Timestamp:", new Date().toISOString());

  try {
    // --- API Key validation ---
    const receivedApiKey = req.headers["x-api-key"];
    console.log("🔑 API Key received:", receivedApiKey ? "✅ Present" : "❌ Missing");

    if (receivedApiKey !== SECRET_API_KEY) {
      console.log("❌ API Key validation FAILED - Unauthorized");
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("✅ API Key validated successfully");

    // Extract necessary data from the request body
    const { walletAddress, destinationId, userLat, userLon } = req.body;

    console.log("📦 Request Body:");
    console.log("   - Wallet:", walletAddress);
    console.log("   - Destination ID:", destinationId);
    console.log("   - User Lat:", userLat);
    console.log("   - User Lon:", userLon);

    if (
      !walletAddress ||
      !destinationId ||
      userLat === undefined ||
      userLon === undefined
    ) {
      console.log("❌ Missing required parameters");
      return res.status(400).json({ error: "Missing required parameters." });
    }
    console.log("✅ All required parameters present");

    const destination = destinations[destinationId];
    if (!destination) {
      console.log("❌ Destination not found for ID:", destinationId);
      return res.status(404).json({ error: "Destination not found." });
    }
    console.log("✅ Destination found:", destination);

    // --- IP Reputation Check (BYPASSED FOR TESTING) ---
    // TODO: Uncomment this section for production
    /*
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log("🌐 IP Check:");
    console.log("   - User IP:", userIp);

    if (userIp && userIp !== "::1") {
      try {
        console.log("   - Fetching IP info from ip-api.com...");
        const ipInfo = await axios.get(
          `http://ip-api.com/json/${userIp}?fields=status,countryCode,proxy,hosting`
        );
        console.log("   - IP Info Response:", ipInfo.data);

        if (ipInfo.data.countryCode !== destination.country) {
          console.log("❌ IP-GPS location mismatch. IP country:", ipInfo.data.countryCode, "Expected:", destination.country);
          return res.status(403).json({ error: "IP-GPS location mismatch." });
        }
        if (ipInfo.data.proxy || ipInfo.data.hosting) {
          console.log("❌ VPN or Proxy detected");
          return res.status(403).json({ error: "VPN or Proxy detected." });
        }
        console.log("✅ IP validation passed");
      } catch (ipError) {
        console.error("❌ IP lookup service failed:", ipError.message);
        return res
          .status(500)
          .json({ error: "Location integrity verification failed." });
      }
    } else {
      console.log("⚠️ Localhost detected - skipping IP check");
    }
    */
    console.log("⚠️ IP check BYPASSED for testing");

    // --- Distance Check ---
    console.log("📏 Distance Check:");
    const distance = getDistance(
      userLat,
      userLon,
      destination.lat,
      destination.lng
    );
    console.log("   - Calculated distance:", Math.round(distance), "meters");
    console.log("   - Max allowed: 50 meters");

    if (distance > 50) {
      console.log("❌ User too far from destination");
      return res
        .status(403)
        .json({ error: `You are ${Math.round(distance)} meters away.` });
    }
    console.log("✅ Distance check passed");

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

    console.log("✅ Signature generated successfully:", signature);
    console.log("========================================\n");

    // Send the signature back to the client
    res.status(200).json({ signature });
  } catch (error) {
    console.error("❌ Error during verification:", error);
    console.log("========================================\n");
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the Express server
app.listen(3001, () => {
  console.log("\n🚀 ================================");
  console.log("🚀 WandryFi Backend Server Started");
  console.log("🚀 ================================");
  console.log("📍 Port: 3001");
  console.log("🔗 Health check: http://localhost:3001/api");
  console.log("🔗 Verify endpoint: POST http://localhost:3001/api/verify");
  console.log("================================\n");
});

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { db } = require('../config/database');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
const equipmentFirebaseRouter = require('../routes/equipment-firebase');
app.use('/api/equipment-firebase', equipmentFirebaseRouter);

// Export the api function
exports.api = functions.https.onRequest(app);

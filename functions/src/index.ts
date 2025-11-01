/**
 * Firebase Cloud Functions Entry Point
 */

import * as admin from "firebase-admin";
admin.initializeApp();

// Export auth functions
export * from "./auth";

// Export community functions
export * from "./community";

// Export username functions
export * from "./usernames";


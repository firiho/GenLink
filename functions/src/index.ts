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

// Export team functions
export * from "./team";

// Export notification functions
export * from "./notifications";

// Export support functions
export * from "./support";

// Export testing functions
export * from "./testing";

// Export scheduled functions
export * from "./scheduled";


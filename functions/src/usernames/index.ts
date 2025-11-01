import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {config} from "../config";

/**
 * Validates username format
 * Rules:
 * - 3-20 characters
 * - Only letters, numbers, underscores, and hyphens
 * - Must start with a letter or number
 * - No consecutive special characters
 * - Case insensitive (stored as lowercase)
 */
function validateUsername(username: string): {valid: boolean; error?: string} {
  // Check length
  if (username.length < 3) {
    return {valid: false, error: "Username must be at least 3 characters long"};
  }
  if (username.length > 20) {
    return {valid: false, error: "Username must be 20 characters or less"};
  }

  // Check format
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      error: "Username must start and end with a letter or number, and can only contain letters, numbers, underscores, and hyphens",
    };
  }

  // Check for consecutive special characters
  if (/[_-]{2,}/.test(username)) {
    return {valid: false, error: "Username cannot have consecutive special characters"};
  }

  // Check for reserved/inappropriate usernames
  const reservedUsernames = [
    "admin",
    "administrator",
    "root",
    "system",
    "support",
    "help",
    "info",
    "contact",
    "about",
    "team",
    "staff",
    "mod",
    "moderator",
    "genlink",
    "api",
    "www",
    "mail",
    "ftp",
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return {valid: false, error: "This username is reserved"};
  }

  return {valid: true};
}

/**
 * Check if a username is available
 */
export const checkUsername = onCall({region: config.region}, async (request) => {
  const data = request.data as {username: string};

  if (!data.username) {
    throw new HttpsError("invalid-argument", "Username is required");
  }

  const username = data.username.toLowerCase().trim();

  // Validate format
  const validation = validateUsername(username);
  if (!validation.valid) {
    return {
      success: false,
      available: false,
      error: validation.error,
    };
  }

  try {
    const db = admin.firestore();

    // Check if username exists in profiles collection
    const profilesSnapshot = await db
      .collection(config.collections.profiles)
      .where("username", "==", username)
      .limit(1)
      .get();

    const available = profilesSnapshot.empty;

    return {
      success: true,
      available,
      username,
      error: available ? null : "Username is already taken",
    };
  } catch (error) {
    console.error("Error checking username:", error);
    throw new HttpsError("internal", "Failed to check username availability");
  }
});

/**
 * Reserve a username for the authenticated user
 */
export const reserveUsername = onCall({region: config.region}, async (request) => {
  // Ensure user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const data = request.data as {username: string};

  if (!data.username) {
    throw new HttpsError("invalid-argument", "Username is required");
  }

  const uid = request.auth.uid;
  const username = data.username.toLowerCase().trim();

  // Validate format
  const validation = validateUsername(username);
  if (!validation.valid) {
    throw new HttpsError("invalid-argument", validation.error || "Invalid username");
  }

  const db = admin.firestore();

  try {
    // Use a transaction to ensure atomicity
    const result = await db.runTransaction(async (transaction) => {
      // Check if username is already taken
      const existingUsernameQuery = await db
        .collection(config.collections.profiles)
        .where("username", "==", username)
        .limit(1)
        .get();

      if (!existingUsernameQuery.empty) {
        const existingDoc = existingUsernameQuery.docs[0];
        // Check if it's the same user (updating their profile)
        if (existingDoc.id !== uid) {
          throw new HttpsError("already-exists", "Username is already taken");
        }
      }

      // Get current profile
      const profileRef = db.collection(config.collections.profiles).doc(uid);
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists) {
        throw new HttpsError("not-found", "Profile not found");
      }

      const profileData = profileDoc.data();
      const oldUsername = profileData?.username;

      // Update profile with new username
      transaction.update(profileRef, {
        username: username,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        username,
        oldUsername,
      };
    });

    return {
      success: true,
      username: result.username,
      message: "Username reserved successfully",
    };
  } catch (error: any) {
    console.error("Error reserving username:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to reserve username");
  }
});

/**
 * Get username suggestions based on user's name
 */
export const suggestUsernames = onCall({region: config.region}, async (request) => {
  const data = request.data as {firstName?: string; lastName?: string; baseUsername?: string};

  const {firstName, lastName, baseUsername} = data;

  if (!firstName && !lastName && !baseUsername) {
    throw new HttpsError("invalid-argument", "First name, last name, or base username is required");
  }

  const db = admin.firestore();
  const suggestions: string[] = [];

  try {
    // Generate base suggestions
    const bases: string[] = [];

    if (baseUsername) {
      bases.push(baseUsername.toLowerCase().trim());
    }

    if (firstName && lastName) {
      bases.push(`${firstName}${lastName}`.toLowerCase());
      bases.push(`${firstName}_${lastName}`.toLowerCase());
      bases.push(`${firstName}${lastName[0]}`.toLowerCase());
      bases.push(`${firstName[0]}${lastName}`.toLowerCase());
    } else if (firstName) {
      bases.push(firstName.toLowerCase());
    } else if (lastName) {
      bases.push(lastName.toLowerCase());
    }

    // Check availability and add numbers if taken
    for (const base of bases) {
      // Clean the base
      const cleanBase = base.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 15);

      if (cleanBase.length < 3) continue;

      // Check if base is available
      const baseQuery = await db
        .collection(config.collections.profiles)
        .where("username", "==", cleanBase)
        .limit(1)
        .get();

      if (baseQuery.empty && validateUsername(cleanBase).valid) {
        suggestions.push(cleanBase);
      }

      // Generate variations with numbers
      for (let i = 1; i <= 999; i++) {
        if (suggestions.length >= 10) break;

        const variant = `${cleanBase}${i}`;
        if (variant.length > 20) break;

        const variantQuery = await db
          .collection(config.collections.profiles)
          .where("username", "==", variant)
          .limit(1)
          .get();

        if (variantQuery.empty && validateUsername(variant).valid) {
          suggestions.push(variant);
        }

        if (suggestions.length >= 10) break;
      }

      if (suggestions.length >= 10) break;
    }

    return {
      success: true,
      suggestions: suggestions.slice(0, 10),
    };
  } catch (error) {
    console.error("Error generating username suggestions:", error);
    throw new HttpsError("internal", "Failed to generate username suggestions");
  }
});


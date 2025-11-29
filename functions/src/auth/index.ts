/**
 * Authentication Cloud Functions
 */

import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { config } from "../config";
import { validateRequired, sanitizeString, isValidEmail } from "../utils/validation";
import { v4 as uuidv4 } from "uuid";

// Define the secret for the Firebase Web API key
const webApiKey = defineSecret("WEB_API_KEY");

interface SignUpData {
  email: string;
  uid: string;
  firstName: string;
  lastName: string;
  userType: "participant" | "partner";
  organization?: string;
  organizationType?: string;
  position?: string;
}

interface SignInData {
  uid: string;
}

interface CreateStaffData {
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  permissions: string[];
  organizationId: string;
}

/**
 * Sign Up - Creates user profile and related documents after Firebase Auth
 * Call this immediately after createUserWithEmailAndPassword
 */
export const signUp = onCall({ region: config.region }, async (request) => {
  const data = request.data as SignUpData;
  
  // Validate required fields
  validateRequired(data, ["email", "uid", "firstName", "lastName", "userType"]);
  
  // Validate email format
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }
  
  // Validate partner fields
  if (data.userType === "partner") {
    validateRequired(data, ["organization", "position"]);
  }
  
  const db = admin.firestore();
  const timestamp = new Date().toISOString();
  
  try {
    let organizationId: string | undefined;
    
    // Handle partner signup
    if (data.userType === "partner" && data.organization) {
      organizationId = uuidv4();
      
      // Create organization document
      await db.collection(config.collections.organizations).doc(organizationId).set({
        id: organizationId,
        name: sanitizeString(data.organization),
        type: data.organizationType || "Company",
        address: "",
        email: data.email,
        phone: "",
        status: "pending",
        created_at: timestamp,
        updated_at: timestamp,
        created_by: data.uid,
      });
      
      // Create staff document for partner
      await db
        .collection(config.collections.organizations)
        .doc(organizationId)
        .collection("staff")
        .doc(data.uid)
        .set({
          userId: data.uid,
          firstName: sanitizeString(data.firstName),
          lastName: sanitizeString(data.lastName),
          email: data.email,
          phone: "",
          position: data.position ? sanitizeString(data.position) : "",
          permissions: [
            "manage_challenges",
            "manage_submissions",
            "manage_events",
            "view_analytics",
            "manage_team",
            "manage_organization",
          ],
          status: "active",
          created_at: timestamp,
          updated_at: timestamp,
        });
    }
    
    // Create user document
    const userData: any = {
      user_type: data.userType,
      status: data.userType === "partner" ? "pending" : "approved",
      created_at: timestamp,
      updated_at: timestamp,
    };
    
    if (organizationId) {
      userData.organization_id = organizationId;
    }
    
    if (data.userType === "participant") {
      userData.onboardingComplete = false;
    }
    
    await db.collection(config.collections.users).doc(data.uid).set(userData);
    
    // Create public profile for participants
    if (data.userType === "participant") {
      await db.collection(config.collections.profiles).doc(data.uid).set({
        userId: data.uid,
        firstName: sanitizeString(data.firstName),
        lastName: sanitizeString(data.lastName),
        email: data.email,
        photo: "",
        title: "",
        location: "",
        about: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        social: {
          github: "",
          twitter: "",
          linkedin: "",
        },
        // Stats fields
        total_active_challenges: 0,
        total_submissions: 0,
        total_active_team_members: 0,
        projectsCount: 0,
        contributions: 0,
        success_rate: 0,
        badges: [],
        submissions: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    
    console.log(`User signup completed for: ${data.uid} (${data.userType})`);
    
    return {
      success: true,
      userType: data.userType,
      organizationId,
      message: "User profile created successfully",
    };
  } catch (error) {
    console.error("Error in signUp:", error);
    
    // Return user-friendly error messages
    if (error instanceof Error) {
      throw new HttpsError("internal", error.message);
    }
    throw new HttpsError("internal", "Failed to complete signup. Please try again.");
  }
});

/**
 * Sign In - Retrieves user data and validates access
 * Call this after signInWithEmailAndPassword to get user profile
 */
export const signIn = onCall({ region: config.region }, async (request) => {
  const data = request.data as SignInData;
  
  // Validate required fields
  validateRequired(data, ["uid"]);
  
  const db = admin.firestore();
  
  try {
    // Get user document
    const userDoc = await db.collection(config.collections.users).doc(data.uid).get();
    
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found. Please contact support.");
    }
    
    const userData = userDoc.data();
    
    if (!userData) {
      throw new HttpsError("not-found", "User data is empty. Please contact support.");
    }
    
    // Get Firebase Auth user to check email verification
    const authUser = await admin.auth().getUser(data.uid);
    
    // Check email verification status
    if (!authUser.emailVerified) {
      return {
        success: false,
        emailVerified: false,
        message: "Please verify your email before signing in.",
        userData: null,
      };
    }
    
    // Get additional profile data based on user type
    let profileData: any = {};
    
    if (userData.user_type === "participant") {
      const profileDoc = await db.collection(config.collections.profiles).doc(data.uid).get();
      if (profileDoc.exists) {
        const profile = profileDoc.data();
        profileData = {
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          phone: profile?.phone,
          fieldType: profile?.fieldType,
          photo: profile?.photo,
        };
      }
    } else if (userData.user_type === "partner" && userData.organization_id) {
      const staffDoc = await db
        .collection(config.collections.organizations)
        .doc(userData.organization_id)
        .collection("staff")
        .doc(data.uid)
        .get();
        
      if (staffDoc.exists) {
        const staff = staffDoc.data();
        profileData = {
          firstName: staff?.firstName,
          lastName: staff?.lastName,
          phone: staff?.phone,
          position: staff?.position,
        };
      }
      
      // Get organization data
      const orgDoc = await db
        .collection(config.collections.organizations)
        .doc(userData.organization_id)
        .get();
        
      if (orgDoc.exists) {
        profileData.organization = orgDoc.data();
      }
    }
    
    console.log(`User signed in: ${data.uid} (${userData.user_type})`);
    
    return {
      success: true,
      emailVerified: true,
      userData: {
        id: data.uid,
        email: authUser.email,
        userType: userData.user_type,
        status: userData.status,
        organizationId: userData.organization_id,
        onboardingComplete: userData.onboardingComplete,
        ...profileData,
      },
      message: "Sign in successful",
    };
  } catch (error) {
    console.error("Error in signIn:", error);
    
    // Handle specific errors
    if (error instanceof HttpsError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new HttpsError("internal", error.message);
    }
    
    throw new HttpsError("internal", "Failed to sign in. Please try again.");
  }
});

/**
 * Admin Sign In - Validates admin access
 * Call this after signInWithEmailAndPassword for admin users
 */
export const adminSignIn = onCall({ region: config.region }, async (request) => {
  const data = request.data as SignInData;
  
  validateRequired(data, ["uid"]);
  
  const db = admin.firestore();
  
  try {
    // Get user document
    const userDoc = await db.collection(config.collections.users).doc(data.uid).get();
    
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }
    
    const userData = userDoc.data();
    
    // Verify admin role
    if (userData?.user_type !== "admin") {
      throw new HttpsError("permission-denied", "Unauthorized access. Admin privileges required.");
    }
    
    // Get Firebase Auth user
    const authUser = await admin.auth().getUser(data.uid);
    
    console.log(`Admin signed in: ${data.uid}`);
    
    return {
      success: true,
      userData: {
        id: data.uid,
        email: authUser.email,
        userType: userData.user_type,
      },
      message: "Admin sign in successful",
    };
  } catch (error) {
    console.error("Error in adminSignIn:", error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new HttpsError("permission-denied", error.message);
    }
    
    throw new HttpsError("permission-denied", "Unauthorized access.");
  }
});

/**
 * Get User - Fetches ONLY the authenticated user's own data
 * Security: Users can ONLY access their own data, never another user's data
 */
export const getUser = onCall({ region: config.region }, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  // SECURITY: User can only get their own data
  const uid = request.auth.uid;
  
  const db = admin.firestore();
  
  try {
    // Get user document
    const userDoc = await db.collection(config.collections.users).doc(uid).get();
    
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "User profile not found.");
    }
    
    const userData = userDoc.data();
    
    if (!userData) {
      throw new HttpsError("not-found", "User data is empty.");
    }
    
    // Get Firebase Auth user
    const authUser = await admin.auth().getUser(uid);
    
    // Get additional profile data based on user type
    let profileData: any = {};
    
    // Get ONLY necessary profile data based on user type
    if (userData.user_type === "participant") {
      const profileDoc = await db.collection(config.collections.profiles).doc(uid).get();
      if (profileDoc.exists) {
        const profile = profileDoc.data();
        // Only return necessary fields
        profileData = {
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          phone: profile?.phone,
          photo: profile?.photo,
          title: profile?.title,
          location: profile?.location,
          skills: profile?.skills,
          total_active_challenges: profile?.total_active_challenges,
          total_submissions: profile?.total_submissions,
          profileVisibility: profile?.visibility || "private",
        };
      }
    } else if (userData.user_type === "partner" && userData.organization_id) {
      const staffDoc = await db
        .collection(config.collections.organizations)
        .doc(userData.organization_id)
        .collection("staff")
        .doc(uid)
        .get();
        
      if (staffDoc.exists) {
        const staff = staffDoc.data();
        // Only return necessary fields
        profileData = {
          firstName: staff?.firstName,
          lastName: staff?.lastName,
          position: staff?.position,
          role: staff?.role,
          permissions: staff?.permissions,
        };
      }
      
      // Get minimal organization data
      const orgDoc = await db
        .collection(config.collections.organizations)
        .doc(userData.organization_id)
        .get();
        
      if (orgDoc.exists) {
        const org = orgDoc.data();
        profileData.organization = {
          id: org?.id,
          name: org?.name,
          type: org?.type,
          logo: org?.logo,
          industry: org?.industry,
          website: org?.website,
          description: org?.description,
          status: org?.status,
          active_challenges: org?.active_challenges || 0,
          total_participants: org?.total_participants || 0,
          total_prize_pool: org?.total_prize_pool || 0,
          completion_rate: org?.completion_rate || 0,
        };
      }
    }
    
    console.log(`User data fetched: ${uid} (${userData.user_type})`);
    
    // Return ONLY necessary fields
    return {
      success: true,
      userData: {
        id: uid,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        userType: userData.user_type,
        status: userData.status,
        organizationId: userData.organization_id,
        onboardingComplete: userData.onboardingComplete,
        ...profileData,
      },
      message: "User data retrieved successfully",
    };
  } catch (error) {
    console.error("Error in getUser:", error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new HttpsError("internal", error.message);
    }
    
    throw new HttpsError("internal", "Failed to retrieve user data.");
  }
});

/**
 * Create Staff User - Adds a new staff member to an organization
 * Only accessible by owners and admins
 */
export const createStaffUser = onCall({ region: config.region, secrets: [webApiKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const data = request.data as CreateStaffData;
  validateRequired(data, ["email", "firstName", "lastName", "permissions", "organizationId"]);

  const db = admin.firestore();
  const callerUid = request.auth.uid;

  // Verify caller permissions
  // We check the staff record of the caller
  const callerStaffDoc = await db.collection(config.collections.organizations)
    .doc(data.organizationId)
    .collection("staff")
    .doc(callerUid)
    .get();

  if (!callerStaffDoc.exists) {
      throw new HttpsError("permission-denied", "Caller staff profile not found or not part of this organization");
  }
  
  const callerStaffData = callerStaffDoc.data();
  const hasPermission = callerStaffData?.permissions?.includes("manage_team");
  
  if (!hasPermission) {
    throw new HttpsError("permission-denied", "Insufficient permissions to add staff members");
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email,
      emailVerified: false,
      displayName: `${data.firstName} ${data.lastName}`,
      disabled: false,
    });

    const timestamp = new Date().toISOString();

    // Create user document in "users" collection
    const userDocData = {
      user_type: "partner",
      status: "approved",
      organization_id: data.organizationId,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await db.collection(config.collections.users).doc(userRecord.uid).set(userDocData);

    // Add to organization's staff subcollection
    await db.collection(config.collections.organizations)
      .doc(data.organizationId)
      .collection("staff")
      .doc(userRecord.uid)
      .set({
        userId: userRecord.uid,
        firstName: sanitizeString(data.firstName),
        lastName: sanitizeString(data.lastName),
        email: data.email,
        phone: "",
        position: data.position ? sanitizeString(data.position) : "",
        permissions: data.permissions,
        status: "active",
        created_at: timestamp,
        updated_at: timestamp,
        addedBy: callerUid,
      });

    // Send password reset email via REST API
    // This ensures the email is sent directly to the user
    const apiKey = webApiKey.value();
    const resetUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=${apiKey}`;
    
    try {
      const response = await fetch(resetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: data.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.error("Failed to send password reset email:", errorData);
      } else {
        console.log(`Password reset email sent to ${data.email}`);
      }
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
    }

    return {
      success: true,
      message: "Staff member created and invitation sent",
      userId: userRecord.uid
    };

  } catch (error: any) {
    console.error("Error creating staff member:", error);
    if (error.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "A user with this email already exists.");
    }
    throw new HttpsError("internal", error.message);
  }
});

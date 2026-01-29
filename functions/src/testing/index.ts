/**
 * Testing Cloud Functions
 * 
 * Generates and deletes test data following the exact Firestore schema.
 * All test documents have IDs prefixed with "test_" for easy identification and cleanup.
 */

import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { config } from "../config";
import {
  FIRST_NAMES,
  LAST_NAMES,
  ORGANIZATION_NAMES,
  ORGANIZATION_TYPES,
  INDUSTRIES,
  CHALLENGE_TITLES,
  CHALLENGE_DESCRIPTIONS,
  CHALLENGE_REQUIREMENTS,
  EVALUATION_CRITERIA,
  SUBMISSION_FORMATS,
  CHALLENGE_CATEGORIES,
  YOUTUBE_VIDEO_IDS,
  PROJECT_TITLES,
  PROJECT_DESCRIPTIONS,
  TEAM_NAMES,
  TEAM_DESCRIPTIONS,
  TEAM_TAGS,
  EVENT_TITLES,
  EVENT_DESCRIPTIONS,
  EVENT_TYPES,
  EVENT_CATEGORIES,
  SKILLS,
  LOCATIONS,
  PROFESSIONAL_TITLES,
  IMAGES,
  getRandomItem,
  getRandomItems,
  getRandomInt,
  generateId,
  getRandomBoolean,
  generateUsername,
  getISODate,
  getFutureDate,
  getAvatarUrl,
  getLogoUrl
} from "./testData";

// ============================================================================
// INTERFACES
// ============================================================================

interface TestingRequest {
  action: "generate" | "delete" | "stats";
  counts?: {
    participants?: number;
    partners?: number;
    challenges?: number;
    teams?: number;
    projects?: number;
    events?: number;
  };
}

interface GenerationResults {
  users: number;
  profiles: number;
  organizations: number;
  challenges: number;
  teams: number;
  projects: number;
  events: number;
}

// ============================================================================
// MAIN CLOUD FUNCTION
// ============================================================================

export const testing = onCall(
  { region: config.region, timeoutSeconds: 540 },
  async (request) => {
    const data = request.data as TestingRequest;
    const { action, counts } = data;
    const db = admin.firestore();

    try {
      if (action === "generate") {
        return await generateTestData(db, counts || {});
      } else if (action === "delete") {
        return await deleteTestData(db);
      } else if (action === "stats") {
        return await getTestStats(db);
      } else {
        throw new HttpsError("invalid-argument", "Invalid action. Use: generate, delete, or stats");
      }
    } catch (error) {
      console.error("Testing function error:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "An error occurred processing the request");
    }
  }
);

// ============================================================================
// GENERATE TEST DATA
// ============================================================================

async function generateTestData(db: admin.firestore.Firestore, counts: any) {
  const results: GenerationResults = {
    users: 0,
    profiles: 0,
    organizations: 0,
    challenges: 0,
    teams: 0,
    projects: 0,
    events: 0
  };

  // Store created IDs for relationships
  const participantIds: string[] = [];
  const partnerUserIds: string[] = [];
  const organizationIds: string[] = [];
  const challengeData: Array<{ id: string; title: string; organizationId: string }> = [];
  const teamData: Array<{ id: string; challengeId: string; memberIds: string[] }> = [];

  const now = new Date();
  const nowISO = getISODate(now);

  // ========================================
  // 1. CREATE PARTICIPANTS (users + profiles)
  // ========================================
  const numParticipants = counts.participants || 0;
  console.log(`Creating ${numParticipants} participants...`);

  for (let i = 0; i < numParticipants; i++) {
    const id = generateId("test_user_");
    participantIds.push(id);

    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    const username = generateUsername(firstName, lastName);
    const email = `${username}@testmail.com`;

    // Create user document (follows /users schema)
    await db.collection("users").doc(id).set({
      user_type: "participant",
      status: "approved",
      onboardingComplete: getRandomBoolean(0.8),
      created_at: nowISO,
      updated_at: nowISO
    });

    // Create profile document (follows /profiles schema)
    const skills = getRandomItems(SKILLS, getRandomInt(3, 10));
    await db.collection("profiles").doc(id).set({
      userId: id,
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email,
      photo: getAvatarUrl(id),
      title: getRandomItem(PROFESSIONAL_TITLES),
      location: getRandomItem(LOCATIONS),
      about: `Passionate ${getRandomItem(PROFESSIONAL_TITLES)} with expertise in ${skills.slice(0, 3).join(", ")}. Looking to collaborate on innovative projects.`,
      skills: skills,
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      social: {
        github: `https://github.com/${username}`,
        twitter: getRandomBoolean(0.5) ? `https://twitter.com/${username}` : "",
        linkedin: `https://linkedin.com/in/${username}`
      },
      visibility: getRandomBoolean(0.8) ? "public" : "private",
      total_active_challenges: 0,
      total_submissions: 0,
      total_active_team_members: 0,
      projectsCount: 0,
      contributions: getRandomInt(0, 500),
      success_rate: getRandomInt(0, 100),
      badges: [],
      submissions: [],
      createdAt: nowISO,
      updatedAt: nowISO
    });

    results.users++;
    results.profiles++;
  }

  // ========================================
  // 2. CREATE PARTNERS (users + organizations)
  // ========================================
  const numPartners = counts.partners || 0;
  console.log(`Creating ${numPartners} partners...`);

  for (let i = 0; i < numPartners; i++) {
    const userId = generateId("test_partner_");
    const orgId = generateId("test_org_");
    partnerUserIds.push(userId);
    organizationIds.push(orgId);

    const orgName = getRandomItem(ORGANIZATION_NAMES);
    const orgType = getRandomItem(ORGANIZATION_TYPES);
    const industry = getRandomItem(INDUSTRIES);
    const location = getRandomItem(LOCATIONS);

    // Create partner user document (follows /users schema)
    await db.collection("users").doc(userId).set({
      user_type: "partner",
      status: "approved",
      organization_id: orgId,
      created_at: nowISO,
      updated_at: nowISO
    });

    // Create organization document (follows /organizations schema)
    await db.collection("organizations").doc(orgId).set({
      id: orgId,
      name: orgName,
      type: orgType,
      address: `${getRandomInt(1, 999)} ${getRandomItem(["Main", "Tech", "Innovation", "Business"])} Street, ${location}`,
      email: `contact@${orgName.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: `+27${getRandomInt(10, 99)}${getRandomInt(1000000, 9999999)}`,
      status: "approved",
      logo: getLogoUrl(orgId),
      logoUrl: getLogoUrl(orgId),
      website: `https://${orgName.toLowerCase().replace(/\s+/g, "")}.com`,
      industry: industry,
      description: `${orgName} is a leading ${orgType.toLowerCase()} in the ${industry} sector, driving innovation across Africa.`,
      location: location,
      active_challenges: 0,
      total_participants: 0,
      total_prize_pool: 0,
      completion_rate: getRandomInt(70, 100),
      created_at: nowISO,
      updated_at: nowISO,
      created_by: userId
    });

    results.users++;
    results.organizations++;
  }

  // ========================================
  // 3. CREATE CHALLENGES
  // ========================================
  const numChallenges = counts.challenges || 0;
  console.log(`Creating ${numChallenges} challenges...`);

  // Ensure we have at least one organization
  if (numChallenges > 0 && organizationIds.length === 0) {
    const userId = generateId("test_partner_auto_");
    const orgId = generateId("test_org_auto_");
    partnerUserIds.push(userId);
    organizationIds.push(orgId);

    await db.collection("users").doc(userId).set({
      user_type: "partner",
      status: "approved",
      organization_id: orgId,
      created_at: nowISO,
      updated_at: nowISO
    });

    await db.collection("organizations").doc(orgId).set({
      id: orgId,
      name: "Auto-Generated Partner",
      type: "Startup",
      address: "123 Test Street",
      email: "auto@test.com",
      phone: "+27000000000",
      status: "approved",
      created_at: nowISO,
      updated_at: nowISO,
      created_by: userId
    });

    results.users++;
    results.organizations++;
  }

  for (let i = 0; i < numChallenges; i++) {
    const id = generateId("test_challenge_");
    const orgId = getRandomItem(organizationIds);
    const title = getRandomItem(CHALLENGE_TITLES);

    // Get organization data for companyInfo
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    const orgData = orgDoc.data() || {};

    const startDate = getFutureDate(getRandomInt(1, 30));
    const endDate = getFutureDate(getRandomInt(45, 120));
    const prizeFirst = getRandomInt(5, 50) * 1000;
    const prizeSecond = Math.floor(prizeFirst * 0.5);
    const prizeThird = Math.floor(prizeFirst * 0.25);

    // Create challenge document (follows /challenges schema)
    await db.collection("challenges").doc(id).set({
      id: id,
      title: title,
      description: getRandomItem(CHALLENGE_DESCRIPTIONS),
      prize: `$${prizeFirst.toLocaleString()} in prizes`,
      prizeDistribution: {
        first: prizeFirst,
        second: prizeSecond,
        third: prizeThird,
        additional: []
      },
      total_prize: prizeFirst + prizeSecond + prizeThird,
      deadline: getISODate(endDate),
      requirements: getRandomItems(CHALLENGE_REQUIREMENTS, getRandomInt(3, 6)).join("\n"),
      categories: getRandomItems(CHALLENGE_CATEGORIES, getRandomInt(2, 5)),
      skills: getRandomItems(SKILLS, getRandomInt(4, 8)),
      status: getRandomItem(["draft", "active", "active", "active", "completed"]),
      maxParticipants: String(getRandomInt(50, 500)),
      submissionFormat: getRandomItem(SUBMISSION_FORMATS),
      evaluationCriteria: EVALUATION_CRITERIA.join("\n"),
      termsAndConditions: "By participating, you agree to the challenge rules and terms of service.",
      coverImageUrl: getRandomItem(IMAGES.covers),
      companyInfo: {
        name: orgData.name || "Test Organization",
        logoUrl: orgData.logoUrl || getLogoUrl(orgId),
        website: orgData.website || "https://example.com",
        contactEmail: orgData.email || "contact@example.com"
      },
      timeline: [
        { phase: "Registration", startDate: getISODate(startDate), endDate: getISODate(new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)) },
        { phase: "Development", startDate: getISODate(new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)), endDate: getISODate(new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)) },
        { phase: "Judging", startDate: getISODate(new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)), endDate: getISODate(endDate) }
      ],
      visibility: "public",
      allowTeams: true,
      maxTeamSize: getRandomInt(3, 6),
      judges: [],
      resources: [],
      faq: [],
      participants: 0,
      teamSubmissions: 0,
      organizationId: orgId,
      createdBy: getRandomItem(partnerUserIds),
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now)
    });

    challengeData.push({ id, title, organizationId: orgId });
    results.challenges++;
  }

  // ========================================
  // 4. CREATE TEAMS
  // ========================================
  const numTeams = counts.teams || 0;
  console.log(`Creating ${numTeams} teams...`);

  // Ensure we have participants
  if (numTeams > 0 && participantIds.length === 0) {
    const id = generateId("test_user_auto_");
    participantIds.push(id);
    await db.collection("users").doc(id).set({
      user_type: "participant",
      status: "approved",
      created_at: nowISO,
      updated_at: nowISO
    });
    await db.collection("profiles").doc(id).set({
      userId: id,
      firstName: "Auto",
      lastName: "User",
      email: "auto@test.com",
      visibility: "public",
      skills: [],
      createdAt: nowISO,
      updatedAt: nowISO
    });
    results.users++;
    results.profiles++;
  }

  for (let i = 0; i < numTeams; i++) {
    const id = generateId("test_team_");
    const teamSize = getRandomInt(2, Math.min(5, participantIds.length));
    const memberIds = getRandomItems(participantIds, teamSize);
    const leaderId = memberIds[0];
    const challenge = challengeData.length > 0 ? getRandomItem(challengeData) : null;

    // Create team document (follows /teams schema)
    await db.collection("teams").doc(id).set({
      id: id,
      name: getRandomItem(TEAM_NAMES),
      description: getRandomItem(TEAM_DESCRIPTIONS),
      avatar: getAvatarUrl(id),
      challengeId: challenge?.id || "",
      challengeTitle: challenge?.title || "",
      maxMembers: getRandomInt(4, 8),
      currentMembers: memberIds.length,
      status: "active",
      visibility: getRandomBoolean(0.7) ? "public" : "invite-only",
      joinableLink: `https://genlink.app/join/${id}`,
      joinableCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      joinableEnabled: getRandomBoolean(0.6),
      autoApprove: getRandomBoolean(0.3),
      createdBy: leaderId,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
      lastActivity: admin.firestore.Timestamp.fromDate(now),
      hasSubmitted: false,
      tags: getRandomItems(TEAM_TAGS, getRandomInt(2, 5)),
      admins: [leaderId]
    });

    // Create team members subcollection (follows /teams/{teamId}/members schema)
    for (let j = 0; j < memberIds.length; j++) {
      const memberId = memberIds[j];
      const memberRole = j === 0 ? "owner" : (j === 1 && getRandomBoolean(0.3) ? "admin" : "member");

      await db.collection("teams").doc(id).collection("members").doc(memberId).set({
        userId: memberId,
        role: memberRole,
        joinedAt: admin.firestore.Timestamp.fromDate(now),
        status: "active",
        skills: getRandomItems(SKILLS, getRandomInt(2, 5)),
        contribution: getRandomInt(0, 100),
        lastActive: admin.firestore.Timestamp.fromDate(now)
      });

      // Update user's teams subcollection (follows /users/{userId}/teams schema)
      await db.collection("users").doc(memberId).collection("teams").doc(id).set({
        teamId: id,
        role: memberRole,
        joinedAt: admin.firestore.Timestamp.fromDate(now),
        status: "active"
      });
    }

    teamData.push({ id, challengeId: challenge?.id || "", memberIds });
    results.teams++;
  }

  // ========================================
  // 5. CREATE PROJECTS
  // ========================================
  const numProjects = counts.projects || 0;
  console.log(`Creating ${numProjects} projects...`);

  for (let i = 0; i < numProjects; i++) {
    const id = generateId("test_project_");
    const team = teamData.length > 0 ? getRandomItem(teamData) : null;
    const challenge = challengeData.length > 0 ? getRandomItem(challengeData) : null;
    const title = getRandomItem(PROJECT_TITLES);
    const status = getRandomItem(["draft", "in-progress", "in-progress", "submitted"]);

    // Determine userId for the project
    const projectUserId = team ? (team.memberIds.length > 0 ? team.memberIds[0] : "") : (participantIds.length > 0 ? getRandomItem(participantIds) : "");
    const projectChallengeId = challenge?.id || team?.challengeId || "";

    // Create project document (follows /projects schema)
    await db.collection("projects").doc(id).set({
      id: id,
      title: title,
      description: getRandomItem(PROJECT_DESCRIPTIONS),
      readme: `# ${title}\n\n## Overview\n${getRandomItem(PROJECT_DESCRIPTIONS)}\n\n## Features\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Tech Stack\n- React\n- TypeScript\n- Firebase`,
      youtubeVideoId: getRandomBoolean(0.4) ? getRandomItem(YOUTUBE_VIDEO_IDS) : "",
      challengeId: projectChallengeId,
      challengeTitle: challenge?.title || "",
      categories: getRandomItems(CHALLENGE_CATEGORIES, getRandomInt(1, 3)),
      teamId: team?.id || "",
      userId: team ? "" : projectUserId,
      status: status,
      visibility: "public",
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
      submittedAt: status === "submitted" ? admin.firestore.Timestamp.fromDate(now) : null
    });

    results.projects++;

    // Create corresponding submission document for submitted projects
    if (status === "submitted" && projectChallengeId) {
      const submissionId = generateId("test_submission_");
      const submissionStatus = getRandomItem(["pending", "pending", "pending", "reviewed"]);
      const hasScore = submissionStatus === "reviewed";

      await db.collection("submissions").doc(submissionId).set({
        id: submissionId,
        projectId: id,
        challengeId: projectChallengeId,
        teamId: team?.id || null,
        userId: projectUserId,
        status: submissionStatus,
        score: hasScore ? getRandomInt(50, 100) : null,
        feedback: hasScore ? getRandomItem([
          "Great work on this project! The implementation is solid and well-documented.",
          "Innovative approach to the problem. Consider improving the UI/UX in future iterations.",
          "Strong technical execution. The code quality is excellent.",
          "Good effort overall. Some areas could use more polish but the core functionality works well.",
          "Excellent submission! This project demonstrates a deep understanding of the challenge requirements."
        ]) : "",
        note: getRandomBoolean(0.3) ? "This submission looks promising." : "",
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
        reviewedAt: hasScore ? admin.firestore.Timestamp.fromDate(now) : null
      });
    }
  }

  // ========================================
  // 6. CREATE EVENTS
  // ========================================
  const numEvents = counts.events || 0;
  console.log(`Creating ${numEvents} events...`);

  for (let i = 0; i < numEvents; i++) {
    const id = generateId("test_event_");
    const eventDate = getFutureDate(getRandomInt(1, 90));
    const organizerId = partnerUserIds.length > 0 ? getRandomItem(partnerUserIds) : (participantIds.length > 0 ? getRandomItem(participantIds) : "");
    const orgId = organizationIds.length > 0 ? getRandomItem(organizationIds) : "";
    const location = getRandomItem(LOCATIONS);
    const eventType = getRandomItem(EVENT_TYPES);

    // Create event document (follows /events schema)
    await db.collection("events").doc(id).set({
      id: id,
      title: getRandomItem(EVENT_TITLES),
      description: getRandomItem(EVENT_DESCRIPTIONS),
      thumbnail: getRandomItem(IMAGES.thumbnails),
      location: eventType === "Online" ? "Online" : location,
      locationDetails: eventType === "Online" ? "Link will be shared before event" : `${getRandomItem(["Conference Room A", "Main Hall", "Tech Hub", "Innovation Center"])}, ${location}`,
      date: getISODate(eventDate),
      time: `${getRandomInt(9, 18)}:00`,
      type: eventType,
      category: getRandomItem(EVENT_CATEGORIES),
      organizerName: getRandomItem(ORGANIZATION_NAMES),
      organizationId: orgId,
      organizerId: organizerId,
      organizerInfo: {
        name: getRandomItem(ORGANIZATION_NAMES),
        email: "events@example.com",
        photo: getLogoUrl(id)
      },
      maxAttendees: getRandomInt(20, 200),
      attendees: getRandomInt(0, 50),
      attendeeIds: [],
      createdAt: admin.firestore.Timestamp.fromDate(now),
      updatedAt: admin.firestore.Timestamp.fromDate(now),
      status: getRandomItem(["published", "published", "upcoming", "draft"]),
      visibility: "public",
      coordinates: eventType !== "Online" ? {
        lat: -33.9249 + (Math.random() - 0.5) * 10,
        lng: 18.4241 + (Math.random() - 0.5) * 10
      } : null
    });

    results.events++;
  }

  console.log("Generation complete:", results);
  return {
    success: true,
    message: `Generated: ${results.users} users, ${results.profiles} profiles, ${results.organizations} organizations, ${results.challenges} challenges, ${results.teams} teams, ${results.projects} projects, ${results.events} events`,
    results
  };
}

// ============================================================================
// DELETE TEST DATA
// ============================================================================

async function deleteTestData(db: admin.firestore.Firestore) {
  const collections = ["users", "profiles", "organizations", "challenges", "teams", "projects", "submissions", "events"];
  const deleted: Record<string, number> = {};
  let totalDeleted = 0;

  for (const collectionName of collections) {
    deleted[collectionName] = 0;

    // Query documents with test_ prefix
    const snapshot = await db.collection(collectionName)
      .where(admin.firestore.FieldPath.documentId(), ">=", "test_")
      .where(admin.firestore.FieldPath.documentId(), "<=", "test_\uf8ff")
      .limit(500)
      .get();

    if (snapshot.empty) continue;

    // Delete in batches
    const batch = db.batch();
    for (const doc of snapshot.docs) {
      // Delete subcollections for teams
      if (collectionName === "teams") {
        const membersSnap = await doc.ref.collection("members").get();
        for (const member of membersSnap.docs) {
          batch.delete(member.ref);
        }
        const invitesSnap = await doc.ref.collection("invitations").get();
        for (const invite of invitesSnap.docs) {
          batch.delete(invite.ref);
        }
        const appsSnap = await doc.ref.collection("applications").get();
        for (const app of appsSnap.docs) {
          batch.delete(app.ref);
        }
      }

      // Delete subcollections for users
      if (collectionName === "users") {
        const teamsSnap = await doc.ref.collection("teams").get();
        for (const team of teamsSnap.docs) {
          batch.delete(team.ref);
        }
        const challengesSnap = await doc.ref.collection("challenges").get();
        for (const challenge of challengesSnap.docs) {
          batch.delete(challenge.ref);
        }
        const invitesSnap = await doc.ref.collection("invitations").get();
        for (const invite of invitesSnap.docs) {
          batch.delete(invite.ref);
        }
      }

      batch.delete(doc.ref);
      deleted[collectionName]++;
      totalDeleted++;
    }

    await batch.commit();
  }

  return {
    success: true,
    message: `Deleted ${totalDeleted} test documents`,
    deleted
  };
}

// ============================================================================
// GET TEST STATS
// ============================================================================

async function getTestStats(db: admin.firestore.Firestore) {
  const collections = ["users", "profiles", "organizations", "challenges", "teams", "projects", "submissions", "events"];
  const stats: Record<string, number> = {};

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName)
      .where(admin.firestore.FieldPath.documentId(), ">=", "test_")
      .where(admin.firestore.FieldPath.documentId(), "<=", "test_\uf8ff")
      .count()
      .get();

    stats[collectionName] = snapshot.data().count;
  }

  // Map to expected format
  return {
    success: true,
    stats: {
      participants: stats.profiles || 0,
      partners: stats.organizations || 0,
      challenges: stats.challenges || 0,
      teams: stats.teams || 0,
      projects: stats.projects || 0,
      events: stats.events || 0
    }
  };
}

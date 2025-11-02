import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { config } from "../config/index";

/**
 * Get paginated list of people (profiles)
 * Optimized with indexed queries and cursor-based pagination
 */
export const people = onCall({ region: config.region }, async (request) => {
  const data = request.data as {
    limit?: number;
    cursor?: string;
    searchQuery?: string;
    locationFilter?: string;
    skillFilter?: string;
    badgeFilter?: string;
  };

  try {
    const limit = Math.min(data.limit || 24, 50);
    const db = admin.firestore();
    let query = db.collection(config.collections.profiles)
      .orderBy("contributions", "desc");

    // Apply cursor for pagination
    if (data.cursor) {
      const cursorDoc = await db.collection(config.collections.profiles)
        .doc(data.cursor)
        .get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc) as any;
      }
    }

    query = query.limit(limit + 1) as any;

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    const profiles = docs.map(doc => {
      const data = doc.data();
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || data.name || "Anonymous User";

      return {
        id: doc.id,
        username: data.username || null,
        firstName,
        lastName,
        name: fullName,
        title: data.title || "Community Member",
        photo: data.photo || "",
        location: data.location || "",
        badges: data.badges || [],
        contributions: data.contributions || 0,
        skills: data.skills || [],
        social: data.social || {},
      };
    });

    // Apply filters
    let filteredProfiles = profiles;

    // Search filter
    if (data.searchQuery && data.searchQuery.trim()) {
      const query = data.searchQuery.toLowerCase();
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.name.toLowerCase().includes(query) ||
        profile.title?.toLowerCase().includes(query) ||
        profile.location?.toLowerCase().includes(query) ||
        profile.skills?.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (data.locationFilter && data.locationFilter !== "All") {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.location?.toLowerCase().includes(data.locationFilter!.toLowerCase())
      );
    }

    // Skill filter
    if (data.skillFilter && data.skillFilter !== "All") {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.skills?.some((skill: string) =>
          skill.toLowerCase() === data.skillFilter!.toLowerCase()
        )
      );
    }

    // Badge filter
    if (data.badgeFilter && data.badgeFilter !== "All") {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.badges?.some((badge: string) =>
          badge.toLowerCase() === data.badgeFilter!.toLowerCase()
        )
      );
    }

    return {
      success: true,
      profiles: filteredProfiles,
      hasMore,
      nextCursor: hasMore && docs.length > 0 ? docs[docs.length - 1].id : null,
      total: filteredProfiles.length,
    };
  } catch (error) {
    console.error("Error fetching people:", error);
    throw new HttpsError("internal", "Failed to fetch people");
  }
});

/**
 * Get paginated list of teams
 * Optimized with indexed queries and cursor-based pagination
 */
export const teams = onCall({ region: config.region }, async (request) => {
  const data = request.data as {
    limit?: number;
    cursor?: string;
    searchQuery?: string;
    challengeFilter?: string;
    availabilityFilter?: "All" | "Available" | "Full";
    submissionFilter?: "All" | "Submitted" | "Not Submitted";
  };

  try {
    const limit = Math.min(data.limit || 24, 50);
    const db = admin.firestore();
    
    // Query public active teams
    let query = db.collection("teams")
      .where("status", "==", "active")
      .where("visibility", "==", "public")
      .orderBy("lastActivity", "desc");

    // Apply challenge filter at query level if provided
    if (data.challengeFilter && data.challengeFilter !== "All") {
      query = query.where("challengeId", "==", data.challengeFilter) as any;
    }

    if (data.cursor) {
      const cursorDoc = await db.collection("teams").doc(data.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc) as any;
      }
    }

    query = query.limit(limit + 1) as any;

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    const teamsList = docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        name: data.name,
        description: data.description || "",
        challengeId: data.challengeId,
        challengeTitle: data.challengeTitle,
        maxMembers: data.maxMembers,
        currentMembers: data.currentMembers || 0,
        status: data.status,
        visibility: data.visibility,
        tags: data.tags || [],
        lastActivity: data.lastActivity?.toDate?.() || new Date(data.lastActivity),
        hasSubmitted: data.hasSubmitted || false,
      };
    });

    // Apply filters
    let filteredTeams = teamsList;

    // Search filter
    if (data.searchQuery && data.searchQuery.trim()) {
      const query = data.searchQuery.toLowerCase();
      filteredTeams = filteredTeams.filter(team =>
        team.name.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query) ||
        team.challengeTitle?.toLowerCase().includes(query) ||
        team.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Availability filter
    if (data.availabilityFilter && data.availabilityFilter !== "All") {
      if (data.availabilityFilter === "Available") {
        filteredTeams = filteredTeams.filter(team =>
          team.currentMembers < team.maxMembers
        );
      } else if (data.availabilityFilter === "Full") {
        filteredTeams = filteredTeams.filter(team =>
          team.currentMembers >= team.maxMembers
        );
      }
    }

    // Submission filter
    if (data.submissionFilter && data.submissionFilter !== "All") {
      if (data.submissionFilter === "Submitted") {
        filteredTeams = filteredTeams.filter(team => team.hasSubmitted);
      } else if (data.submissionFilter === "Not Submitted") {
        filteredTeams = filteredTeams.filter(team => !team.hasSubmitted);
      }
    }

    return {
      success: true,
      teams: filteredTeams,
      hasMore,
      nextCursor: hasMore && docs.length > 0 ? docs[docs.length - 1].id : null,
      total: filteredTeams.length,
    };
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw new HttpsError("internal", "Failed to fetch teams");
  }
});

/**
 * Get paginated list of events
 * Optimized with indexed queries and cursor-based pagination
 */
export const events = onCall({ region: config.region }, async (request) => {
  const data = request.data as {
    limit?: number;
    cursor?: string;
    searchQuery?: string;
    typeFilter?: "All" | "In-Person" | "Online" | "Hybrid";
    categoryFilter?: string;
    dateFilter?: "All" | "Upcoming" | "This Week" | "This Month";
  };

  try {
    const limit = Math.min(data.limit || 24, 50);
    const db = admin.firestore();
    
    // Query only public published events (unlisted events are not shown on community page)
    let query = db.collection("events")
      .where("status", "==", "published")
      .where("visibility", "==", "public")
      .orderBy("date", "asc");

    // Apply date filter at query level for better performance
    if (data.dateFilter && data.dateFilter !== "All") {
      const now = new Date();
      let startDate = now;

      if (data.dateFilter === "Upcoming") {
        // Events from today onwards
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (data.dateFilter === "This Week") {
        // Events in the next 7 days
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (data.dateFilter === "This Month") {
        // Events in the current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      query = query.where("date", ">=", startDate.toISOString()) as any;
    }

    if (data.cursor) {
      const cursorDoc = await db.collection("events").doc(data.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc) as any;
      }
    }

    query = query.limit(limit + 1) as any;

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    const eventsList = docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        title: data.title,
        description: data.description || "",
        date: data.date,
        time: data.time,
        location: data.location,
        type: data.type,
        attendees: data.attendees || 0,
        maxAttendees: data.maxAttendees,
        category: data.category,
        thumbnail: data.thumbnail || null,
      };
    });

    // Apply filters
    let filteredEvents = eventsList;

    // Type filter
    if (data.typeFilter && data.typeFilter !== "All") {
      filteredEvents = filteredEvents.filter(event => event.type === data.typeFilter);
    }

    // Category filter
    if (data.categoryFilter && data.categoryFilter !== "All") {
      filteredEvents = filteredEvents.filter(event =>
        event.category?.toLowerCase() === data.categoryFilter!.toLowerCase()
      );
    }

    // Additional date filtering for "This Week"
    if (data.dateFilter === "This Week") {
      const now = new Date();
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= weekFromNow;
      });
    }

    // Search filter
    if (data.searchQuery && data.searchQuery.trim()) {
      const query = data.searchQuery.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query)
      );
    }

    return {
      success: true,
      events: filteredEvents,
      hasMore,
      nextCursor: hasMore && docs.length > 0 ? docs[docs.length - 1].id : null,
      total: filteredEvents.length,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new HttpsError("internal", "Failed to fetch events");
  }
});

/**
 * Get paginated list of projects
 * Returns projects that are submitted and public
 * Optimized with indexed queries and cursor-based pagination
 */
export const projects = onCall({ region: config.region }, async (request) => {
  const data = request.data as {
    limit?: number;
    cursor?: string;
    searchQuery?: string;
    categoryFilter?: string;
  };

  try {
    const limit = Math.min(data.limit || 24, 50);
    const db = admin.firestore();
    
    // Query public submitted projects
    let query = db.collection("projects")
      .where("status", "==", "submitted")
      .where("visibility", "==", "public")
      .orderBy("submittedAt", "desc");

    if (data.cursor) {
      const cursorDoc = await db.collection("projects").doc(data.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc) as any;
      }
    }

    query = query.limit(limit + 1) as any;

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    // Fetch challenge data for each project to get categories
    const projectsList = await Promise.all(
      docs.map(async (doc) => {
        const projectData = doc.data();
        
        // Get challenge data for category info
        let challengeCategories = [];
        let challengeTitle = "";
        if (projectData.challengeId) {
          try {
            const challengeDoc = await db.collection("challenges").doc(projectData.challengeId).get();
            if (challengeDoc.exists) {
              const challengeData = challengeDoc.data();
              challengeCategories = challengeData?.categories || [];
              challengeTitle = challengeData?.title || "";
            }
          } catch (error) {
            console.error("Error fetching challenge:", error);
          }
        }
        
        return {
          id: doc.id,
          title: projectData.title || "",
          description: projectData.description || "",
          readme: projectData.readme || "",
          youtubeVideoId: projectData.youtubeVideoId || null,
          challengeId: projectData.challengeId || null,
          challengeTitle: challengeTitle || projectData.challengeTitle || "",
          categories: challengeCategories,
          userId: projectData.userId || null,
          teamId: projectData.teamId || null,
          status: projectData.status,
          visibility: projectData.visibility,
          createdAt: projectData.createdAt?.toDate?.() || new Date(projectData.createdAt),
          updatedAt: projectData.updatedAt?.toDate?.() || new Date(projectData.updatedAt),
          submittedAt: projectData.submittedAt?.toDate?.() || new Date(projectData.submittedAt),
        };
      })
    );

    // Apply filters
    let filteredProjects = projectsList;

    // Category filter - check if project's challenge has matching category
    if (data.categoryFilter && data.categoryFilter !== "All") {
      filteredProjects = filteredProjects.filter(project =>
        project.categories?.some((cat: string) =>
          cat.toLowerCase() === data.categoryFilter!.toLowerCase()
        )
      );
    }

    // Search filter
    if (data.searchQuery && data.searchQuery.trim()) {
      const query = data.searchQuery.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.challengeTitle?.toLowerCase().includes(query)
      );
    }

    return {
      success: true,
      projects: filteredProjects,
      hasMore,
      nextCursor: hasMore && docs.length > 0 ? docs[docs.length - 1].id : null,
      total: filteredProjects.length,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new HttpsError("internal", "Failed to fetch projects");
  }
});


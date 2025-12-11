import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle,
  Database,
  FlaskConical,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  Building2,
  Trophy,
  Users2,
  FolderOpen,
  Calendar,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  generateTestData,
  deleteAllTestData,
  getTestDataStats,
  type GenerateTestDataRequest,
  type TestDataStats,
} from "@/services/testDataService";

export default function Testing() {
  const { actualTheme } = useTheme();

  // Form state - using strings to allow empty input
  const [participantCount, setParticipantCount] = useState("10");
  const [partnerCount, setPartnerCount] = useState("5");
  const [challengeCount, setChallengeCount] = useState("10");
  const [teamCount, setTeamCount] = useState("20");
  const [projectCount, setProjectCount] = useState("15");
  const [eventCount, setEventCount] = useState("10");

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Stats state
  const [stats, setStats] = useState<TestDataStats>({
    participants: 0,
    partners: 0,
    challenges: 0,
    teams: 0,
    projects: 0,
    events: 0,
  });

  // Parse input to number, default to 0
  const parseCount = (value: string): number => {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await getTestDataStats();
      setStats(data);
      toast.success("Stats refreshed");
    } catch (error) {
      console.error("Error fetching test data stats:", error);
      toast.error("Failed to fetch stats - make sure the function is deployed");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGenerate = async () => {
    const counts = {
      participants: parseCount(participantCount),
      partners: parseCount(partnerCount),
      challenges: parseCount(challengeCount),
      teams: parseCount(teamCount),
      projects: parseCount(projectCount),
      events: parseCount(eventCount),
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      toast.error("Please specify at least one item to generate");
      return;
    }

    setIsGenerating(true);
    try {
      const request: GenerateTestDataRequest = counts;
      const result = await generateTestData(request);

      if (result.success) {
        toast.success(result.message);
        await fetchStats();
      } else {
        toast.error("Failed to generate test data");
      }
    } catch (error) {
      console.error("Error generating test data:", error);
      toast.error("Failed to generate test data - check console for details");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAllTestData();

      if (result.success) {
        toast.success(result.message);
        await fetchStats();
      } else {
        toast.error("Failed to delete test data");
      }
    } catch (error) {
      console.error("Error deleting test data:", error);
      toast.error("Failed to delete test data");
    } finally {
      setIsDeleting(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
  }) => (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border",
        actualTheme === "dark"
          ? "bg-slate-800/50 border-slate-700"
          : "bg-slate-50 border-slate-200"
      )}
    >
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            actualTheme === "dark" ? "text-slate-400" : "text-slate-600"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-2xl font-bold",
            actualTheme === "dark" ? "text-white" : "text-slate-900"
          )}
        >
          {isLoadingStats ? "..." : value.toLocaleString()}
        </p>
      </div>
    </div>
  );

  const inputClassName = cn(
    "text-center font-medium",
    actualTheme === "dark"
      ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
  );

  const labelClassName = cn(
    "flex items-center gap-2 text-sm font-medium",
    actualTheme === "dark" ? "text-slate-300" : "text-slate-700"
  );

  const totalItems =
    parseCount(participantCount) +
    parseCount(partnerCount) +
    parseCount(challengeCount) +
    parseCount(teamCount) +
    parseCount(projectCount) +
    parseCount(eventCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={cn(
              "text-2xl font-semibold flex items-center gap-2",
              actualTheme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            <FlaskConical className="h-6 w-6" />
            Testing & Data Generation
          </h1>
          <p
            className={cn(
              "text-sm mt-1",
              actualTheme === "dark" ? "text-slate-400" : "text-slate-600"
            )}
          >
            Generate realistic test data following your Firestore schema
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStats}
          disabled={isLoadingStats}
          className={cn(
            "w-full sm:w-auto",
            actualTheme === "dark"
              ? "border-slate-700 hover:bg-slate-800"
              : "border-slate-200 hover:bg-slate-50"
          )}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoadingStats && "animate-spin")} />
          Refresh Stats
        </Button>
      </div>

      {/* Current Stats */}
      <Card
        className={cn(
          actualTheme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}
      >
        <CardHeader>
          <CardTitle
            className={cn(
              "flex items-center gap-2",
              actualTheme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            <Database className="h-5 w-5" />
            Current Test Data
          </CardTitle>
          <CardDescription
            className={actualTheme === "dark" ? "text-slate-400" : "text-slate-600"}
          >
            Test data currently in the database (documents with test_ prefix)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard icon={Users} label="Participants" value={stats.participants} color="bg-blue-500" />
            <StatCard icon={Building2} label="Partners" value={stats.partners} color="bg-indigo-500" />
            <StatCard icon={Trophy} label="Challenges" value={stats.challenges} color="bg-purple-500" />
            <StatCard icon={Users2} label="Teams" value={stats.teams} color="bg-cyan-500" />
            <StatCard icon={FolderOpen} label="Projects" value={stats.projects} color="bg-green-500" />
            <StatCard icon={Calendar} label="Events" value={stats.events} color="bg-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Generate Test Data */}
      <Card
        className={cn(
          actualTheme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}
      >
        <CardHeader>
          <CardTitle
            className={cn(
              "flex items-center gap-2",
              actualTheme === "dark" ? "text-white" : "text-slate-900"
            )}
          >
            <Plus className="h-5 w-5" />
            Generate Test Data
          </CardTitle>
          <CardDescription
            className={actualTheme === "dark" ? "text-slate-400" : "text-slate-600"}
          >
            Enter the number of items to generate for each category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="participants" className={labelClassName}>
                <Users className="h-4 w-4" /> Participants
              </Label>
              <Input
                id="participants"
                type="text"
                inputMode="numeric"
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partners" className={labelClassName}>
                <Building2 className="h-4 w-4" /> Partners
              </Label>
              <Input
                id="partners"
                type="text"
                inputMode="numeric"
                value={partnerCount}
                onChange={(e) => setPartnerCount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenges" className={labelClassName}>
                <Trophy className="h-4 w-4" /> Challenges
              </Label>
              <Input
                id="challenges"
                type="text"
                inputMode="numeric"
                value={challengeCount}
                onChange={(e) => setChallengeCount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teams" className={labelClassName}>
                <Users2 className="h-4 w-4" /> Teams
              </Label>
              <Input
                id="teams"
                type="text"
                inputMode="numeric"
                value={teamCount}
                onChange={(e) => setTeamCount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projects" className={labelClassName}>
                <FolderOpen className="h-4 w-4" /> Projects
              </Label>
              <Input
                id="projects"
                type="text"
                inputMode="numeric"
                value={projectCount}
                onChange={(e) => setProjectCount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="events" className={labelClassName}>
                <Calendar className="h-4 w-4" /> Events
              </Label>
              <Input
                id="events"
                type="text"
                inputMode="numeric"
                value={eventCount}
                onChange={(e) => setEventCount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={inputClassName}
              />
            </div>
          </div>

          <div
            className={cn(
              "p-4 rounded-lg border",
              actualTheme === "dark"
                ? "bg-slate-800/50 border-slate-700"
                : "bg-slate-50 border-slate-200"
            )}
          >
            <p
              className={cn(
                "text-sm",
                actualTheme === "dark" ? "text-slate-400" : "text-slate-600"
              )}
            >
              <strong>Summary:</strong> Will generate{" "}
              <span className="font-semibold text-blue-500">{parseCount(participantCount)}</span> participants,{" "}
              <span className="font-semibold text-indigo-500">{parseCount(partnerCount)}</span> partners,{" "}
              <span className="font-semibold text-purple-500">{parseCount(challengeCount)}</span> challenges,{" "}
              <span className="font-semibold text-cyan-500">{parseCount(teamCount)}</span> teams,{" "}
              <span className="font-semibold text-green-500">{parseCount(projectCount)}</span> projects, and{" "}
              <span className="font-semibold text-orange-500">{parseCount(eventCount)}</span> events.
              <br />
              <span className="text-xs opacity-75">
                Total: {totalItems} items • Documents will follow your Firestore schema with test_ prefix
              </span>
            </p>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || totalItems === 0} className="w-full sm:w-auto">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating... (this may take a while)
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Generate Test Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Test Data */}
      <Card
        className={cn(
          "border-red-200 dark:border-red-900/50",
          actualTheme === "dark" ? "bg-slate-900" : "bg-white"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Delete All Test Data
          </CardTitle>
          <CardDescription
            className={actualTheme === "dark" ? "text-slate-400" : "text-slate-600"}
          >
            Remove all documents with test_ prefix from the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border",
              actualTheme === "dark"
                ? "bg-red-900/20 border-red-900/50"
                : "bg-red-50 border-red-200"
            )}
          >
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className={cn(
                  "font-medium",
                  actualTheme === "dark" ? "text-red-400" : "text-red-700"
                )}
              >
                Warning: This action is irreversible
              </p>
              <p
                className={cn(
                  "text-sm mt-1",
                  actualTheme === "dark" ? "text-red-400/80" : "text-red-600"
                )}
              >
                All test data (participants, partners, organizations, challenges, teams, projects, events)
                with test_ prefix will be permanently deleted including their subcollections.
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting} className="w-full sm:w-auto">
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Test Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className={cn(actualTheme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white")}
            >
              <AlertDialogHeader>
                <AlertDialogTitle
                  className={cn(
                    "flex items-center gap-2",
                    actualTheme === "dark" ? "text-white" : "text-slate-900"
                  )}
                >
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription
                  className={actualTheme === "dark" ? "text-slate-400" : "text-slate-600"}
                >
                  This will permanently delete all test data including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>{stats.participants} participants (users + profiles)</li>
                    <li>{stats.partners} partners (users + organizations)</li>
                    <li>{stats.challenges} challenges</li>
                    <li>{stats.teams} teams (+ members, invitations, applications)</li>
                    <li>{stats.projects} projects</li>
                    <li>{stats.events} events</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className={cn(
                    actualTheme === "dark"
                      ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                      : ""
                  )}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAll}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

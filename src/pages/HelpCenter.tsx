import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSupportNotifications } from "@/hooks/useSupportNotifications";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  MessageCircle,
  BookOpen,
  Users,
  Trophy,
  Shield,
  HelpCircle,
  Mail,
  Zap,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Code,
  Video,
  Upload,
  UserPlus,
  Award,
  Star,
  FileText,
} from "lucide-react";
import SupportChat from "@/components/support/SupportChat";

const HelpCenter = () => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const { unreadCount, hasUnread } = useSupportNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // User Guide content
  const userGuideSteps = [
    {
      icon: UserPlus,
      title: "1. Create Your Account",
      description: "Sign up as a Participant to join challenges or as a Partner to host them.",
      details: [
        "Click 'Sign Up' in the top navigation",
        "Choose your account type (Participant or Partner)",
        "Fill in your details and verify your email",
        "Complete your profile to showcase your skills",
      ],
    },
    {
      icon: Search,
      title: "2. Discover Challenges",
      description: "Browse active challenges that match your interests and skills.",
      details: [
        "Visit the Challenges page to see all available challenges",
        "Filter by category, prize, or deadline",
        "Read challenge descriptions and requirements carefully",
        "Check the timeline and judging criteria",
      ],
    },
    {
      icon: Users,
      title: "3. Build Your Team",
      description: "Collaborate with others or participate solo - it's your choice.",
      details: [
        "Create a new team from your dashboard",
        "Invite members via email or shareable link",
        "Set team roles and permissions",
        "Use team chat to coordinate with members",
      ],
    },
    {
      icon: Code,
      title: "4. Build Your Project",
      description: "Develop your solution using the tools and technologies of your choice.",
      details: [
        "Create a new project linked to your challenge",
        "Track progress with project milestones",
        "Add team members as collaborators",
        "Document your approach and technical decisions",
      ],
    },
    {
      icon: Upload,
      title: "5. Submit Your Work",
      description: "Package and submit your project before the deadline.",
      details: [
        "Add your GitHub repository or upload files",
        "Record a demo video explaining your solution",
        "Write a compelling project description",
        "Submit before the deadline - All submissions are projects",
      ],
    },
    {
      icon: Award,
      title: "6. Win & Celebrate",
      description: "Get feedback, win prizes, and showcase your work.",
      details: [
        "Judges evaluate submissions based on criteria",
        "Winners are announced after evaluation",
        "Showcase your project in your portfolio",
        "Connect with partners and opportunities",
      ],
    },
  ];

  // Challenge Rules content
  const challengeRules = [
    {
      icon: CheckCircle,
      category: "Eligibility",
      rules: [
        "Valid account with verified email required",
        "One submission per participant/team per challenge",
        "Partners and organizers cannot participate in their own challenges",
      ],
    },
    {
      icon: Clock,
      category: "Deadlines & Timing",
      rules: [
        "All submissions must be received before the deadline",
        "Late submissions will not be considered for judging",
        "You can update your submission until the deadline closes",
        "Timezone is displayed on each challenge page",
      ],
    },
    {
      icon: FileText,
      category: "Submission Requirements",
      rules: [
        "All code must be original or properly attributed",
        "Open source libraries must be credited",
        "Projects must be created during the challenge period",
        "Demo video must clearly show the working solution",
      ],
    },
    {
      icon: AlertTriangle,
      category: "Prohibited Actions",
      rules: [
        "Plagiarism or copying others' work",
        "Submitting pre-existing projects",
        "Harassment of judges, organizers, or participants",
        "Manipulation of voting or judging systems",
      ],
    },
    {
      icon: Trophy,
      category: "Judging & Prizes",
      rules: [
        "Judges' decisions are final",
        "Evaluation criteria are listed on each challenge",
        "Prizes are distributed within 30 days of announcement",
        "Winners may be required to provide additional verification",
      ],
    },
    {
      icon: Shield,
      category: "Intellectual Property",
      rules: [
        "You retain ownership of your submitted work",
        "Partners may request demo rights for promotional purposes",
        "By submitting, you grant GenLink rights to showcase your project",
        "Confidential challenge information must not be shared publicly",
      ],
    },
  ];

  // Quick Tips content
  const quickTips = [
    {
      icon: Lightbulb,
      tip: "Start Early",
      description: "Don't wait until the last minute. Give yourself time to iterate and polish your submission.",
    },
    {
      icon: Video,
      tip: "Make a Great Demo Video",
      description: "A 2-3 minute video showing your solution in action can make a huge difference in judging.",
    },
    {
      icon: FileText,
      tip: "Document Everything",
      description: "Clear documentation helps judges understand your approach and technical decisions.",
    },
    {
      icon: Users,
      tip: "Leverage Team Diversity",
      description: "Build a team with diverse skills - designers, developers, and domain experts work great together.",
    },
    {
      icon: Target,
      tip: "Focus on the Problem",
      description: "Judges value solutions that clearly address the challenge problem over flashy but irrelevant features.",
    },
    {
      icon: Star,
      tip: "Polish the Basics",
      description: "A working demo beats a broken feature-rich app. Focus on core functionality first.",
    },
    {
      icon: MessageCircle,
      tip: "Ask Questions",
      description: "Use the Q&A section or support chat if you're unsure about requirements.",
    },
    {
      icon: Code,
      tip: "Write Clean Code",
      description: "Well-organized, commented code shows professionalism and makes evaluation easier.",
    },
  ];

  const popularFaqs = [
    {
      question: "How do I join a challenge?",
      answer:
        "To join a challenge, navigate to the Challenges page, find a challenge that interests you, and click 'Join Challenge'. You'll need to be signed in with a participant account. Once joined, you can either work individually or create/join a team to collaborate with others.",
    },
    {
      question: "How do I create or join a team?",
      answer:
        "You can create a team by going to your Dashboard and clicking 'Create Team' in the Teams section. Give your team a name, add a description, and invite members via email or shareable link. To join an existing team, you can either accept an invitation or use a team's join link.",
    },
    {
      question: "What are the submission requirements?",
      answer:
        "Submission requirements vary by challenge. Generally, you'll need to provide: a project title and description, GitHub repository link or file upload, a demo video (optional but recommended), and documentation. Check each challenge's specific requirements on its detail page.",
    },
    {
      question: "How is the judging process?",
      answer:
        "Projects are evaluated by a panel of judges based on criteria specified in each challenge. Common criteria include innovation, technical implementation, user experience, and impact. Winners are announced after the evaluation period ends.",
    },
    {
      question: "Can I participate in multiple challenges?",
      answer:
        "Yes! You can participate in as many challenges as you'd like. However, make sure you can dedicate enough time to each challenge to submit quality work before the deadlines.",
    },
    {
      question: "How do I become a partner/sponsor?",
      answer:
        "Organizations can become partners by signing up with a Partner account. After registration, your application will be reviewed by our team. Once approved, you can create and manage your own challenges on the platform.",
    },
    {
      question: "What happens if I miss a deadline?",
      answer:
        "Unfortunately, submissions after the deadline are not accepted for judging. Make sure to submit your project before the deadline. We recommend submitting early as you can update your submission until the deadline closes.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot Password' on the sign-in page, enter your email address, and we'll send you a password reset link. The link expires after 24 hours. If you don't receive the email, check your spam folder.",
    },
  ];

  const quickLinks = [
    { icon: BookOpen, label: "User Guide", href: "#guide" },
    { icon: Target, label: "Challenge Rules", href: "#rules" },
    { icon: Zap, label: "Quick Tips", href: "#tips" },
    { icon: Mail, label: "Contact Us", href: "#contact" },
  ];

  // Search functionality - search across all content
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const results: { type: string; title: string; content: string; section: string }[] = [];

    // Search FAQs
    popularFaqs.forEach((faq) => {
      if (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      ) {
        results.push({
          type: "faq",
          title: faq.question,
          content: faq.answer.slice(0, 150) + "...",
          section: "faq",
        });
      }
    });

    // Search User Guide
    userGuideSteps.forEach((step) => {
      if (
        step.title.toLowerCase().includes(query) ||
        step.description.toLowerCase().includes(query) ||
        step.details.some((d) => d.toLowerCase().includes(query))
      ) {
        results.push({
          type: "guide",
          title: step.title,
          content: step.description,
          section: "guide",
        });
      }
    });

    // Search Challenge Rules
    challengeRules.forEach((rule) => {
      if (
        rule.category.toLowerCase().includes(query) ||
        rule.rules.some((r) => r.toLowerCase().includes(query))
      ) {
        results.push({
          type: "rules",
          title: rule.category,
          content: rule.rules.slice(0, 2).join(". "),
          section: "rules",
        });
      }
    });

    // Search Quick Tips
    quickTips.forEach((tip) => {
      if (
        tip.tip.toLowerCase().includes(query) ||
        tip.description.toLowerCase().includes(query)
      ) {
        results.push({
          type: "tips",
          title: tip.tip,
          content: tip.description,
          section: "tips",
        });
      }
    });

    return results;
  }, [searchQuery]);

  const filteredFaqs = popularFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col", actualTheme === "dark" ? "dark" : "")}>
      <div className="bg-background text-foreground flex-1">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-30" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <HelpCircle className="h-4 w-4" />
                Help Center
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How can we help you?
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Find answers to common questions, learn how to use GenLink, or get in touch
                with our support team.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto z-50">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
                />

                {/* Search Results Dropdown */}
                {searchResults && searchResults.length > 0 && (
                  <div
                    className={cn(
                      "absolute left-0 right-0 mt-2 rounded-xl border shadow-xl max-h-96 overflow-y-auto",
                      actualTheme === "dark"
                        ? "bg-slate-900 border-slate-700"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-3 py-2">
                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                      </p>
                      {searchResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            scrollToSection(result.section);
                            setSearchQuery("");
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors",
                            "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                result.type === "faq" && "bg-blue-500/20 text-blue-500",
                                result.type === "guide" && "bg-green-500/20 text-green-500",
                                result.type === "rules" && "bg-yellow-500/20 text-yellow-500",
                                result.type === "tips" && "bg-purple-500/20 text-purple-500"
                              )}
                            >
                              {result.type === "faq"
                                ? "FAQ"
                                : result.type === "guide"
                                  ? "Guide"
                                  : result.type === "rules"
                                    ? "Rules"
                                    : "Tip"}
                            </span>
                            <span className="font-medium text-sm">{result.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults && searchResults.length === 0 && searchQuery && (
                  <div
                    className={cn(
                      "absolute left-0 right-0 mt-2 rounded-xl border shadow-xl p-6 text-center",
                      actualTheme === "dark"
                        ? "bg-slate-900 border-slate-700"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No results for "{searchQuery}"
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setIsChatOpen(true)}
                      className="mt-2"
                    >
                      Contact Support
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {quickLinks.map((link, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToSection(link.href.replace("#", ""))}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      "bg-card border border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Guide Section */}
        <section className="py-16 border-t border-border" id="guide">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4">
                  <BookOpen className="h-4 w-4" />
                  User Guide
                </div>
                <h2 className="text-3xl font-bold mb-4">Getting Started with GenLink</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Follow these steps to go from sign-up to submitting your first winning project.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGuideSteps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-6 rounded-xl border transition-all",
                      actualTheme === "dark"
                        ? "bg-slate-800/50 border-slate-700 hover:border-green-500/50"
                        : "bg-white border-slate-200 hover:border-green-500/50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <step.icon className="h-5 w-5 text-green-500" />
                      </div>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Challenge Rules Section */}
        <section className="py-16 border-t border-border" id="rules">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium mb-4">
                  <Target className="h-4 w-4" />
                  Challenge Rules
                </div>
                <h2 className="text-3xl font-bold mb-4">Rules & Guidelines</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Fair play is essential. Please review these rules before participating in any challenge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challengeRules.map((ruleSet, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-6 rounded-xl border transition-all",
                      actualTheme === "dark"
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <ruleSet.icon className="h-5 w-5 text-yellow-500" />
                      </div>
                      <h3 className="font-semibold">{ruleSet.category}</h3>
                    </div>
                    <ul className="space-y-3">
                      {ruleSet.rules.map((rule, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-16 border-t border-border" id="tips">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-4">
                  <Zap className="h-4 w-4" />
                  Quick Tips
                </div>
                <h2 className="text-3xl font-bold mb-4">Pro Tips for Success</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Learn from experienced participants and increase your chances of winning.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickTips.map((tip, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-5 rounded-xl border transition-all group hover:border-purple-500/50",
                      actualTheme === "dark"
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-white border-slate-200"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
                      <tip.icon className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-purple-500 transition-colors">
                      {tip.tip}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-border" id="faq">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className={cn(
                      "border border-border rounded-xl px-6",
                      "bg-card data-[state=open]:border-primary/50"
                    )}
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFaqs.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try searching with different keywords or contact our support team.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="py-16 border-t border-border" id="contact">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>

              <p className="text-muted-foreground mb-8">
                {user
                  ? "Our support team is here to help. Start a conversation and we'll get back to you as soon as possible."
                  : "Sign in to your account to start a support conversation with our team."}
              </p>

              {user ? (
                <Button
                  size="lg"
                  onClick={() => setIsChatOpen(true)}
                  className="gap-2 relative"
                >
                  <MessageCircle className="h-5 w-5" />
                  {hasUnread ? "View Messages" : "Start Support Chat"}
                  {hasUnread && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link to="/signin">Sign In to Get Support</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="mailto:support@genlink.africa">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Us
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Floating chat button with notification badge when chat is closed */}
      {user && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all hover:scale-110",
            actualTheme === "dark"
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          <MessageCircle className="h-6 w-6" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Support Chat Component */}
      {user && <SupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default HelpCenter;

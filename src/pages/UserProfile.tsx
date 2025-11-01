import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter,
  Award,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  photo: string;
  location: string;
  about: string;
  skills: string[];
  badges: string[];
  contributions: number;
  email?: string;
  phone?: string;
  social?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  experience?: Array<{
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        let profileDoc;
        let profileId = id;
        
        // First, try to find by username
        const usernameQuery = query(
          collection(db, 'profiles'),
          where('username', '==', id)
        );
        const usernameSnapshot = await getDocs(usernameQuery);
        
        if (!usernameSnapshot.empty) {
          // Found by username
          profileDoc = usernameSnapshot.docs[0];
          profileId = profileDoc.id;
        } else {
          // Try to find by document ID
          profileDoc = await getDoc(doc(db, 'profiles', id));
          if (!profileDoc.exists()) {
            setError(true);
            setLoading(false);
            return;
          }
        }
        
        if (profileDoc && profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile({
            id: profileId,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            title: data.title || 'Community Member',
            photo: data.photo || '/placeholder user.svg',
            location: data.location || '',
            about: data.about || '',
            skills: data.skills || [],
            badges: data.badges || [],
            contributions: data.contributions || 0,
            email: data.email,
            phone: data.phone,
            social: data.social || {},
            experience: data.experience || [],
            education: data.education || [],
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The profile you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/community')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Anonymous User';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/community')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>

          {/* Header Card */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10" />
            
            {/* Profile Info */}
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 -mt-16">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={profile.photo}
                    alt={fullName}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-card shadow-lg object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 mt-14 md:mt-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{fullName}</h1>
                      <p className="text-base md:text-lg text-muted-foreground mt-1">{profile.title}</p>
                      {profile.location && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-4 md:gap-6">
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-primary">{profile.contributions}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Contributions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-primary">{profile.badges.length}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">Badges</div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  {profile.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.badges.map((badge, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                        >
                          <Award className="h-3 w-3" />
                          <span>{badge}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Social */}
          {(profile.email || profile.phone || Object.keys(profile.social || {}).length > 0) && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Contact & Social</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">{profile.email}</span>
                  </a>
                )}
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{profile.phone}</span>
                  </a>
                )}
                {profile.social?.website && (
                  <a
                    href={profile.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">Website</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                )}
                {profile.social?.linkedin && (
                  <a
                    href={profile.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <Linkedin className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">LinkedIn</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                )}
                {profile.social?.github && (
                  <a
                    href={profile.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <Github className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">GitHub</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                )}
                {profile.social?.twitter && (
                  <a
                    href={profile.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-primary/20"
                  >
                    <Twitter className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">Twitter</span>
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* About */}
          {profile.about && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">About</h2>
              <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{profile.about}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-accent/50 border border-border text-sm font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                <Briefcase className="h-5 w-5 text-primary" />
                Experience
              </h2>
              <div className="space-y-6">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4">
                    <h3 className="font-semibold text-base md:text-lg text-foreground">{exp.role}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{exp.company}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -{' '}
                      {exp.current ? 'Present' : new Date(exp.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.education && profile.education.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Education</h2>
              <div className="space-y-6">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4">
                    <h3 className="font-semibold text-base md:text-lg text-foreground">{edu.degree}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{edu.institution}</p>
                    {edu.field && <p className="text-xs md:text-sm text-muted-foreground">{edu.field}</p>}
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} -{' '}
                      {edu.current ? 'Present' : new Date(edu.endDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;


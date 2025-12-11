import StatsCard from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { 
    Users, MessagesSquare, Building2, Timer,
    ChevronRight, ArrowUpRight, CheckCircle, XCircle
  } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { parseStatValue, formatStatNumber, StatValue } from '@/types/stats';

interface SupportTicket {
  id: string;
  subject: string;
  userEmail: string;
  userName: string;
  status: string;
  priority: string;
  createdAt: Date;
}

interface AdminStatsData {
  pendingApplications: number;
  activePartners: number;
  openTickets: number;
  totalUsers: StatValue | null;
}

export default function Overview({ setActiveView }) {
  const { actualTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [openTickets, setOpenTickets] = useState<SupportTicket[]>([]);
  const [statsData, setStatsData] = useState<AdminStatsData>({
    pendingApplications: 0,
    activePartners: 0,
    openTickets: 0,
    totalUsers: null
  });

  useEffect(() => {
    // Fetch counts directly from collections
    const fetchCounts = async () => {
      try {
        // Count pending applications
        const pendingQuery = query(
          collection(db, 'organizations'),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        
        // Count active partners
        const activeQuery = query(
          collection(db, 'organizations'),
          where('status', 'in', ['approved', 'active'])
        );
        const activeSnapshot = await getCountFromServer(activeQuery);
        
        // Count open tickets
        const ticketsQuery = query(
          collection(db, 'support_tickets'),
          where('status', 'in', ['open', 'in-progress'])
        );
        const ticketsSnapshot = await getCountFromServer(ticketsQuery);
        
        // Get total users from public stats
        const publicStatsRef = doc(db, 'stats', 'public');
        const publicStatsSnap = await getDoc(publicStatsRef);
        const publicStats = publicStatsSnap.data();
        
        setStatsData({
          pendingApplications: pendingSnapshot.data().count,
          activePartners: activeSnapshot.data().count,
          openTickets: ticketsSnapshot.data().count,
          totalUsers: publicStats?.developers || null
        });
      } catch (err) {
        console.error('Error fetching counts:', err);
      }
    };

    const fetchPendingApplications = async () => {
      try {
        const q = query(
          collection(db, 'organizations'),
          where('status', '==', 'pending'),
          orderBy('created_at', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const partners = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          type: doc.data().type,
          appliedDate: new Date(doc.data().created_at).toLocaleDateString()
        }));
        setPendingPartners(partners);
      } catch (err) {
        console.error('Error fetching pending applications:', err);
        setError(err.message);
        toast.error(err.message);
      }
    };

    // Fetch open support tickets
    const fetchOpenTickets = async () => {
      try {
        const q = query(
          collection(db, 'support_tickets'),
          where('status', 'in', ['open', 'in-progress']),
          orderBy('updatedAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const tickets = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            subject: data.subject,
            userEmail: data.userEmail,
            userName: data.userName,
            status: data.status,
            priority: data.priority,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setOpenTickets(tickets);
      } catch (err) {
        console.error('Error fetching support tickets:', err);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCounts(),
        fetchPendingApplications(),
        fetchOpenTickets()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  // Parse total users from public stats (has prev for change calculation)
  const totalUsers = parseStatValue(statsData.totalUsers);

  const stats = [
    { 
      label: 'Pending Applications', 
      value: formatStatNumber(statsData.pendingApplications), 
      change: '',
      isPositive: true,
      icon: Timer,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      onClick: () => setActiveView('partners')
    },
    { 
      label: 'Active Partners', 
      value: formatStatNumber(statsData.activePartners), 
      change: '',
      isPositive: true,
      icon: Building2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      label: 'Open Tickets', 
      value: formatStatNumber(statsData.openTickets), 
      change: '',
      isPositive: true,
      icon: MessagesSquare,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      onClick: () => setActiveView('support')
    },
    { 
      label: 'Total Users', 
      value: formatStatNumber(totalUsers.value), 
      change: totalUsers.changeText,
      isPositive: totalUsers.isPositive,
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className={cn(
        actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
      )}>Loading...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <StatsCard 
                  key={stat.label} 
                  stat={stat} 
                  index={index} 
                />
              ))}
            </div>

            {/* Recent Partner Applications */}
            <div className={cn(
              "rounded-xl shadow-sm p-6",
              actualTheme === 'dark' ? "bg-slate-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn(
                  "text-lg font-semibold",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>Recent Partner Applications</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveView('partners')}
                >
                  View all applications
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                {pendingPartners.length === 0 ? (
                  <div className="text-center py-8">
                    <Timer className={cn(
                      "h-12 w-12 mx-auto mb-4",
                      actualTheme === 'dark' ? "text-slate-400" : "text-gray-400"
                    )} />
                    <h3 className={cn(
                      "text-lg font-medium",
                      actualTheme === 'dark' ? "text-white" : "text-gray-900"
                    )}>No pending applications</h3>
                    <p className={cn(
                      "mt-2 text-sm",
                      actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                    )}>
                      New partner applications will appear here when they are submitted.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className={cn(
                        "border-b text-xs uppercase",
                        actualTheme === 'dark' 
                          ? "border-slate-700 text-slate-400" 
                          : "border-gray-200 text-gray-500"
                      )}>
                        <th className="px-6 py-3 text-left">Organization</th>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Applied Date</th>
                        <th className="px-6 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className={cn(
                      "divide-y",
                      actualTheme === 'dark' ? "divide-slate-700" : "divide-gray-200"
                    )}>
                      {pendingPartners.map((partner) => (
                        <tr key={partner.id} className={cn(
                          "hover:bg-opacity-50",
                          actualTheme === 'dark' ? "hover:bg-slate-700" : "hover:bg-gray-50"
                        )}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold">{partner.name[0]}</span>
                              </div>
                              <div className="ml-4">
                                <div className={cn(
                                  "font-medium",
                                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                                )}>{partner.name}</div>
                                <div className={cn(
                                  "text-sm",
                                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                                )}>{partner.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className={cn(
                            "px-6 py-4 text-sm",
                            actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
                          )}>{partner.type}</td>
                          <td className={cn(
                            "px-6 py-4 text-sm",
                            actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
                          )}>
                            {partner.appliedDate}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-500 bg-yellow-50">
                              <Timer className="mr-1 h-3 w-3" />
                              Pending
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Support Tickets Overview */}
            <div className={cn(
              "rounded-xl shadow-sm p-6",
              actualTheme === 'dark' ? "bg-slate-800" : "bg-white"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn(
                  "text-lg font-semibold",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>Recent Support Tickets</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveView('support')}
                >
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className={cn(
                "divide-y",
                actualTheme === 'dark' ? "divide-slate-700" : "divide-gray-100"
              )}>
                {openTickets.length === 0 ? (
                  <div className={cn(
                    "py-8 text-center",
                    actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    No open support tickets
                  </div>
                ) : (
                  openTickets.map((ticket) => (
                    <div key={ticket.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          ticket.priority === 'high' || ticket.priority === 'urgent' 
                            ? "bg-red-50" 
                            : "bg-purple-50"
                        )}>
                          <MessagesSquare className={cn(
                            "h-5 w-5",
                            ticket.priority === 'high' || ticket.priority === 'urgent' 
                              ? "text-red-500" 
                              : "text-purple-500"
                          )} />
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-medium",
                            actualTheme === 'dark' ? "text-white" : "text-gray-900"
                          )}>{ticket.subject}</h3>
                          <p className={cn(
                            "text-sm",
                            actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                          )}>From: {ticket.userName || ticket.userEmail}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveView('support')}
                      >
                        View Details
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
  )
}
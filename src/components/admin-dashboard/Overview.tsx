import StatsCard from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { 
    Users, MessagesSquare, Building2, Timer,
    ChevronRight, ArrowUpRight, CheckCircle, XCircle
  } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

export default function Overview({ setActiveView }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingPartners, setPendingPartners] = useState([]);

  useEffect(() => {
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
        console.log('Fetched pending applications:', partners);
        setPendingCount(querySnapshot.size);
      } catch (err) {
        console.error('Error fetching pending applications:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApplications();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

  const stats = [
    { 
      label: 'Pending Applications', 
      value: loading ? '...' : String(pendingCount), 
      change: 'View applications',
      icon: Timer,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      onClick: () => setActiveView('partners')
    },
    { 
      label: 'Active Partners', 
      value: '156', 
      change: '+12 this month',
      icon: Building2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      label: 'Open Tickets', 
      value: '28', 
      change: '-5 this week',
      icon: MessagesSquare,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    { 
      label: 'Total Users', 
      value: '2.4k', 
      change: '+240 this month',
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    }
  ];

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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Partner Applications</h2>
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
                    <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No pending applications</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      New partner applications will appear here when they are submitted.
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs uppercase text-gray-500">
                        <th className="px-6 py-3 text-left">Organization</th>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Applied Date</th>
                        <th className="px-6 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pendingPartners.map((partner) => (
                        <tr key={partner.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold">{partner.name[0]}</span>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium">{partner.name}</div>
                                <div className="text-sm text-gray-500">{partner.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{partner.type}</td>
                          <td className="px-6 py-4 text-sm">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Support Tickets</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveView('support')}
                >
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MessagesSquare className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Payment Issue</h3>
                        <p className="text-sm text-gray-500">From: john@example.com</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
  )
}
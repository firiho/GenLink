import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { collection, getDocs, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Search,
  Filter,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MoreVertical,
  Eye
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PartnerDetailsModal from './partners/PartnerDetailsModal';


const Partners = () => {
  const { actualTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'organizations'));
        const partnersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            status: data.status || 'pending',
            type: data.type || '',
            appliedDate: data.created_at,
            location: data.location || '',
            description: data.description || '',
            owner: data.created_by || ''
          };
        });
        setPartners(partnersData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching partners:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPartners();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className={cn(
        actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
      )}>Loading...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  const statusColors = {
    pending: 'text-yellow-500 bg-yellow-50',
    approved: 'text-green-500 bg-green-50',
    rejected: 'text-red-500 bg-red-50',
    suspended: 'text-gray-500 bg-gray-50'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    suspended: AlertCircle
  };

  const handlePartnerSelect = (partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (partnerId: string, newStatus: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        // Get organization doc
        const orgRef = doc(db, 'organizations', partnerId);
        const orgDoc = await transaction.get(orgRef);
        
        if (!orgDoc.exists()) {
          throw new Error('Organization not found');
        }
  
        // Get profile doc using created_by
        const createdBy = orgDoc.data().created_by;
        const profileRef = doc(db, 'users', createdBy);
        const profileDoc = await transaction.get(profileRef);
  
        if (!profileDoc.exists()) {
          throw new Error('Profile not found');
        }
  
        // Update both documents
        transaction.update(orgRef, { 
          status: newStatus,
          updated_at: new Date()
        });
  
        transaction.update(profileRef, { 
          status: newStatus,
          updated_at: new Date()
        });
      });
  
      // Update local state
      setPartners(partners.map(partner => 
        partner.id === partnerId ? { ...partner, status: newStatus } : partner
      ));
  
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className={cn(
          "text-2xl font-semibold",
          actualTheme === 'dark' ? "text-white" : "text-gray-900"
        )}>Partner Management</h1>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
            actualTheme === 'dark' ? "text-slate-400" : "text-gray-400"
          )} />
          <Input
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Partners List */}
      <div className={cn(
        "rounded-xl shadow-sm overflow-hidden",
        actualTheme === 'dark' ? "bg-slate-800" : "bg-white"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(
                "border-b",
                actualTheme === 'dark' 
                  ? "border-slate-700 bg-slate-800" 
                  : "border-gray-200 bg-gray-50"
              )}>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Partner</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Type</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Status</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Applied Date</th>
                <th className={cn(
                  "px-6 py-4 text-right text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Actions</th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y",
              actualTheme === 'dark' ? "divide-slate-700" : "divide-gray-200"
            )}>
              {filteredPartners.map((partner) => {
                const StatusIcon = statusIcons[partner.status];
                return (
                  <tr
                    key={partner.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "hover:bg-opacity-50",
                      actualTheme === 'dark' ? "hover:bg-slate-700" : "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
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
                      "px-6 py-4 whitespace-nowrap text-sm",
                      actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
                    )}>{partner.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[partner.status]}`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm",
                      actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                    )}>
                      {new Date(partner.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePartnerSelect(partner)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                          {partner.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'approved')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {partner.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(partner.id, 'suspended')}>
                              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedPartner && (
        <PartnerDetailsModal
          partner={selectedPartner}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          statusColors={statusColors}
        />
      )}
    </div>
  );
};

export default Partners;
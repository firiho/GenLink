import { 
   FileText, Search, Download, Filter, Eye, CheckCircle,
  } from 'lucide-react';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";
import WelcomeSection from '../dashboard/WelcomeSection';

export default function SubmissionsView({ submissions, challenges }) {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
        <WelcomeSection title={'Submissions'} subtitle={'Review and manage challenge submissions'} />
        {/* <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto justify-center" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
            </div>
        </div> */}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
            { label: 'Total Submissions', value: '97', change: '+12 today', color: 'blue' },
            { label: 'Pending Review', value: '24', change: '4 urgent', color: 'yellow' },
            { label: 'Approved', value: '45', change: '86% rate', color: 'green' },
            { label: 'Rejected', value: '28', change: '14% rate', color: 'red' }
            ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className={`text-xs text-${stat.color}-500 mt-1`}>{stat.change}</p>
            </div>
            ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Search submissions..."
                className="pl-9 w-full"
            />
            </div>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto">
            <option value="all">All Challenges</option>
            {challenges.map(challenge => (
                <option key={challenge.id} value={challenge.id}>{challenge.title}</option>
            ))}
            </select>
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto">
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            </select>
        </div>

        {/* Submissions Table/Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                    Submission Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Actions
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="flex items-start">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3 mt-1">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{submission.title}</div>
                            <p className="text-sm text-gray-500 mb-1">{submission.challenge}</p>
                            <div className="flex flex-wrap gap-1">
                            {submission.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                                </span>
                            ))}
                            </div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                        <img 
                            src={submission.participant.avatar} 
                            alt={submission.participant.name}
                            className="h-8 w-8 rounded-full mr-3"
                        />
                        <div>
                            <div className="font-medium text-gray-900">{submission.participant.name}</div>
                            <div className="text-sm text-gray-500">{submission.participant.email}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <Badge
                        variant="secondary"
                        className={cn(
                            submission.status === 'approved' && "bg-green-100 text-green-700",
                            submission.status === 'rejected' && "bg-red-100 text-red-700",
                            submission.status === 'pending' && "bg-yellow-100 text-yellow-700",
                            submission.status === 'reviewed' && "bg-blue-100 text-blue-700"
                        )}
                        >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        {/* {submission.score && (
                        <div className="text-sm text-gray-500 mt-1">
                            Score: {submission.score}/100
                        </div>
                        )} */}
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                        </Button>
                        {submission.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-primary">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Review
                        </Button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden divide-y divide-gray-200">
            {submissions.map((submission) => (
                <div key={submission.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{submission.title}</p>
                        <p className="text-sm text-gray-500">{submission.challenge}</p>
                        <div className="flex items-center gap-2 mt-2">
                        <img 
                            src={submission.participant.avatar} 
                            alt={submission.participant.name}
                            className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{submission.participant.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                        {submission.tags?.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                            </span>
                        ))}
                        </div>
                    </div>
                    </div>
                    <Badge
                    variant="secondary"
                    className={cn(
                        "ml-2",
                        submission.status === 'approved' && "bg-green-100 text-green-700",
                        submission.status === 'rejected' && "bg-red-100 text-red-700",
                        submission.status === 'pending' && "bg-yellow-100 text-yellow-700"
                    )}
                    >
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                    </Button>
                    {submission.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-primary">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Review
                        </Button>
                    )}
                    </div>
                </div>
                </div>
            ))}
            </div>

            {/* Pagination */}
            <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-600 text-center sm:text-left">
                Showing 1 to 10 of 97 submissions
                </p>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button variant="outline" size="sm" className="w-24" disabled>
                    Previous
                </Button>
                <Button variant="outline" size="sm" className="w-24">
                    Next
                </Button>
                </div>
            </div>
            </div>
        </div>
    </div>
  )
}

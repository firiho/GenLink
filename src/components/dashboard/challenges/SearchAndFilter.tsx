import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>
        <Input
          type="text"
          placeholder="Search challenges..."
          className="pl-10 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          value={selectedFilter}
          onValueChange={setSelectedFilter}
        >
          <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Challenges</SelectItem>
            <SelectItem value="in-progress" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">In Progress</SelectItem>
            <SelectItem value="submitted" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Submitted</SelectItem>
            <SelectItem value="completed" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
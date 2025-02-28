import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SearchAndFilter = ({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter }) => (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 py-2 text-sm"
        />
      </div>
      
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
      </select>
    </div>
);

export default SearchAndFilter;
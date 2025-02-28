import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
    <select
      value={selectedFilter}
      onChange={(e) => setSelectedFilter(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="draft">Draft</option>
      <option value="completed">Completed</option>
    </select>
  </div>
);

export default SearchBar;
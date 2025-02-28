import { cn } from "@/lib/utils";
import NotificationsDropdown from '@/components/dashboard/NotificationsDropdown';
import ProfileDropdown from '@/components/dashboard/ProfileDropdown';
import Logo from "../Logo";

const MobileHeader = ({ user, onSignOut }) => (
    <div className={cn(
      "lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md",
      "border-b border-gray-200 px-3 py-2"
    )}>
      <div className="flex items-center justify-between gap-2">
        <Logo class_name=""/>
        
        <div className="flex items-center gap-1">
          <NotificationsDropdown />
          <ProfileDropdown user={user} onSignOut={onSignOut} />
        </div>
      </div>
    </div>
);
export default MobileHeader;
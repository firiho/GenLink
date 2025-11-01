import NotificationsDropdown from "./NotificationsDropdown";

const WelcomeSection = ({ title, subtitle }) => (
    <div className="flex flex-row justify-between items-start mb-8 lg:pt-0">
      <div
        className="space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base font-medium max-w-2xl">
          {subtitle}
        </p>
      </div>

      <div 
        className="ml-auto hidden lg:block"
      >
        <NotificationsDropdown />
      </div>
    </div>
  );

export default WelcomeSection;
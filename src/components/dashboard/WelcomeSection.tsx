import { motion } from "framer-motion";
import NotificationsDropdown from "./NotificationsDropdown";

const WelcomeSection = ({ title, subtitle }) => (
    <div className="flex flex-row justify-between items-center mb-6 lg:pt-0">
      <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      >
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
        {title}
      </h1>
      <p className="text-gray-600 text-sm lg:text-base">
        {subtitle}
      </p>
      </motion.div>

      <div className="ml-auto hidden lg:block">
        <NotificationsDropdown />
      </div>
    </div>
  );

export default WelcomeSection;
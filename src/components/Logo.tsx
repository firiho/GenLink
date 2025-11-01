// import { Sparkles } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';

// const Logo = () => {
//   return (
//     <Link to="/">
//       <motion.div 
//         className="flex items-center space-x-3 group"
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         <motion.div
//           whileHover={{ rotate: 5 }}
//           className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300"
//         >
//           <motion.div
//             animate={{ 
//               rotate: [0, 5, 0],
//               scale: [1, 1.1, 1]
//             }}
//             transition={{
//               duration: 5,
//               repeat: Infinity,
//               ease: "easeInOut"
//             }}
//           >
//             <Sparkles className="h-5 w-5 text-white transform group-hover:rotate-12 transition-transform" />
//           </motion.div>
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="flex flex-col"
//         >
//           <motion.span 
//             className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-gray-500 to-gray-200"
//           >
//             GenLink
//           </motion.span>
//         </motion.div>
//       </motion.div>
//     </Link>
//   );
// };

// export default Logo; 


import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({class_name=''}) => {
  return (
     <Link 
          to="/"
          className={`flex items-center space-x-3 group ${class_name}`}
        >
          <div
          className="h-30 w-auto flex items-center justify-center group-hover:scale-105 transition-all duration-300"
          >
          <img 
            src="/logo1.png" 
            alt="Logo" 
            className="h-8 w-auto"
          />
          </div>
          
          <div 
            className="flex flex-col"
          >
            <span 
              className="text-xl font-bold text-foreground group-hover:text-accent transition-colors duration-200"
            >
              GenLink
            </span>
          </div>
        </Link>
  );
};

export default Logo;
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ArrowLeft, Building2, Clock, Mail, 
  ArrowRight, Shield, Users, Trophy 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/services/auth';
import Logo from '@/components/Logo';

const steps = [
  {
    icon: CheckCircle2,
    title: 'Application Submitted',
    description: 'Your partner application has been received',
    status: 'completed'
  },
  {
    icon: Clock,
    title: 'Under Review',
    description: 'Our team is reviewing your application',
    status: 'current'
  },
  {
    icon: Mail,
    title: 'Approval Notice',
    description: 'You will receive an email within 2-3 business days',
    status: 'upcoming'
  }
];

const benefits = [
  {
    icon: Trophy,
    title: 'Launch Challenges',
    description: 'Create and manage innovation challenges'
  },
  {
    icon: Users,
    title: 'Access Talent Pool',
    description: 'Connect with skilled innovators'
  },
  {
    icon: Shield,
    title: 'Dedicated Support',
    description: 'Get priority partner assistance'
  }
];

const PartnerPending = () => {

  const handleLogOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="relative bg-gray-50/50 flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        {/* Logo */}
        <Logo class_name="absolute top-8 left-8 flex items-center space-x-2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-8 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-0">
                  Partner Registration
                </Badge>
                <h1 className="text-2xl font-bold">Application Submitted!</h1>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className="flex items-start space-x-4 relative"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                      ${step.status === 'completed' ? 'bg-primary text-white' :
                        step.status === 'current' ? 'bg-primary/10 text-primary' :
                        'bg-gray-100 text-gray-400'}`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-gray-500">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t">
              <Link to="/">
                <Button variant="outline" className="w-full group"
                onClick={() => handleLogOut()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Dark Background */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          
          {/* Animated Blobs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white max-w-md"
            >
              <Sparkles className="h-12 w-12 mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Partner Benefits</h2>
              <p className="text-gray-400 mb-8">
                Get ready to unlock these exclusive features:
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-white">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-400">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="font-semibold mb-2 text-white">Need Assistance?</h3>
                <p className="text-gray-400 mb-4">
                  Our partner success team is ready to help you get started.
                </p>
                <div className="flex items-center space-x-4">
                  <a 
                    href="mailto:partners@qiesta.com" 
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    partners@qiesta.com
                  </a>
                  <span className="text-gray-600">|</span>
                  <a 
                    href="#" 
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                  >
                    View Documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPending; 
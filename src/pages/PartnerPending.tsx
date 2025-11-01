import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, Building2, Clock, Mail, 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="relative flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 dark:from-slate-800/50 to-transparent" />
        
        {/* Logo */}
        <Logo class_name="absolute top-8 left-8 flex items-center space-x-2" />

        <div
          className="w-full max-w-md z-10"
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-8 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  Partner Registration
                </Badge>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Submitted!</h1>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div
                    className="flex items-start space-x-4 relative"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                      ${step.status === 'completed' ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900' :
                        step.status === 'current' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-lg mb-1 text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <Link to="/">
                <Button variant="outline" className="w-full group border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => handleLogOut()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Dark Background */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          
          {/* Animated Blobs */}
          <div
            className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-slate-600/30 rounded-full blur-3xl"
          />
          <div
            className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-slate-500/20 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8">
            <div
              className="text-white max-w-md"
            >
              <div className="mb-6">
                <Logo class_name="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">Partner Benefits</h2>
              <p className="text-slate-300 mb-8">
                Get ready to unlock these exclusive features:
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div
                    className="flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-white">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-300">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="font-semibold mb-2 text-white">Need Assistance?</h3>
                <p className="text-slate-300 mb-4">
                  Our partner success team is ready to help you get started.
                </p>
                <div className="flex items-center space-x-4">
                  <a 
                    href="mailto:info@genlink.africa" 
                    className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    info@genlink.africa
                  </a>
                  <span className="text-slate-500">|</span>
                  <a 
                    href="https://genlink.africa/contact" 
                    className="inline-flex items-center text-slate-300 hover:text-white transition-colors"
                  >
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPending; 
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2, 
  Users, Trophy, Building2, Briefcase, Eye, EyeOff 
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signUp, SignUpCredentials } from '@/services/auth';
import Logo from '@/components/Logo';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'participant',
    organization: '',
    organizationType: 'Company',
    position: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (!hasUpperCase || !hasLowerCase) {
      toast.error('Password must contain both uppercase and lowercase letters');
      return false;
    }
    if (!hasNumbers) {
      toast.error('Password must contain at least one number');
      return false;
    }
    if (!hasSpecialChar) {
      toast.error('Password must contain at least one special character');
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      throw new Error('All fields are required');
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!validatePassword(formData.password)) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Please enter a valid email address');
    }
    if (formData.userType === 'partner') {
      if (!formData.organization || !formData.position) {
        throw new Error('Organization and position are required for partners');
      }
    }
    return true;
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      validateForm();

      const credentials: SignUpCredentials = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userType: formData.userType as 'participant' | 'partner',
        ...(formData.userType === 'partner' && {
          organization: formData.organization.trim(),
          organizationType: formData.organizationType,
          position: formData.position.trim()
        })
      };

      console.log('Starting signup process...');
      const user = await signUp(credentials);
      
      if (!user) {
        throw new Error('Sign up failed - no user returned');
      }

      console.log('Signup successful, user:', user);
      toast.success('Account created successfully!');

      // Add delay before navigation
      setTimeout(() => {
        // All users go to email verification first
        navigate('/email-verification');
      }, 100);

    } catch (error) {
      console.error('Sign up error:', error);
      const err = error as Error;
      toast.error(err.message || 'Failed to create account. Please try again.');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const userTypes = [
    {
      value: 'participant',
      title: 'Join Challenges',
      description: 'Participate in innovation challenges',
      icon: Users,
      benefits: [
        'Access exclusive challenges',
        'Showcase your solutions',
        'Win prizes and recognition',
        'Connect with innovators'
      ]
    },
    {
      value: 'partner',
      title: 'Create Challenges',
      description: 'Launch innovation challenges',
      icon: Trophy,
      benefits: [
        'Launch custom challenges',
        'Access top talent',
        'Track submissions',
        'Drive innovation'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="relative flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          {/* Logo */}
          <Logo class_name="flex items-center space-x-2 mb-12" />

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">Create an account</h2>
            <p className="text-muted-foreground">
              Join our community of innovators today
            </p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  I want to
                </label>
                <RadioGroup
                  defaultValue="participant"
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, userType: value }))
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  {userTypes.map((type) => (
                    <div key={type.value}>
                      <RadioGroupItem
                        value={type.value}
                        id={type.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={type.value}
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-card p-4 hover:bg-accent/5 peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent cursor-pointer transition-all"
                      >
                        <type.icon className="mb-2 h-6 w-6 text-accent" />
                        <p className="font-medium text-foreground">{type.title}</p>
                        <p className="text-sm text-muted-foreground text-center">
                          {type.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Personal Information */}
              <div className="space-y-4 pt-4">
                {/* First Name and Last Name on same row on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-card border-border"
                        placeholder="First name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="pl-10 bg-card border-border"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 bg-card border-border"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-10 bg-card border-border"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-10 bg-card border-border"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Partner-specific fields */}
                {formData.userType === 'partner' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Organization Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          required
                          className="pl-10 bg-card border-border"
                          placeholder="Enter your organization name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Organization Type
                      </label>
                      <Select
                        value={formData.organizationType}
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, organizationType: value }))
                        }
                      >
                        <SelectTrigger className="bg-card border-border">
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          <SelectItem value="Company">Company</SelectItem>
                          <SelectItem value="Startup">Startup</SelectItem>
                          <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                          <SelectItem value="Educational Institution">Educational Institution</SelectItem>
                          <SelectItem value="Research Organization">Research Organization</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Your Position
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          required
                          className="pl-10 bg-card border-border"
                          placeholder="Enter your position"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors rounded-xl h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  {formData.userType === 'partner' ? 'Submitting...' : 'Creating account...'}
                </div>
              ) : (
                <span className="flex items-center">
                  {formData.userType === 'partner' ? 'Submit Application' : 'Create Account'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/15">
          <div className="absolute inset-0 bg-tech-grid opacity-[0.03]" />
          
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
            className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-accent/30 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-foreground max-w-md"
            >
              <Sparkles className="h-12 w-12 mb-6 text-accent" />
              <h2 className="text-3xl font-bold mb-8">
                {formData.userType === 'partner' 
                  ? 'Partner with Us' 
                  : 'Join Our Innovation Community'}
              </h2>
              <div className="space-y-4">
                {userTypes.find(type => type.value === formData.userType)?.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 
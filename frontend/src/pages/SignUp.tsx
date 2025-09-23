import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import * as auth from '@/services/auth';
import { z } from 'zod';
import { notifyError, notifySuccess, notifyInfo } from '@/lib/notify';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const SignUp = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">API Builder</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>
              Start building APIs from your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  className="w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  className="w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com"
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Create a strong password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm your password"
                className="w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" size="lg" onClick={async () => {
              setErrors({});
              const parsed = signupSchema.safeParse({ firstName, lastName, email, password, confirmPassword });
              if (!parsed.success) {
                const fieldErrors: Record<string,string> = {};
                parsed.error.errors.forEach(e => { if (e.path[0]) fieldErrors[e.path[0] as string] = e.message });
                setErrors(fieldErrors);
                return;
              }
              setLoading(true);
              try {
                const payload = await auth.signup({ firstName, lastName, email, password });
                const user = payload.user;
                if (user && user.is_active) {
                  notifySuccess('Account created successfully!');
                  navigate('/setup');
                } else {
                  // account pending activation
                  notifyInfo('Account created. Pending activation by admin. Please wait for activation before signing in.');
                }
              } catch (err: any) {
                // map server field errors (details) into form state when available
                if (err?.details && typeof err.details === 'object') {
                  const fieldErrors: Record<string,string> = {};
                  Object.entries(err.details).forEach(([k,v]) => fieldErrors[k] = String((v as any)?.message || v));
                  setErrors(fieldErrors);
                } else {
                  notifyError(err?.message || err);
                }
              } finally { setLoading(false); }
            }} disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
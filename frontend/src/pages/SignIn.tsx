import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import * as auth from '@/services/auth';
import { z } from 'zod';
import { notifyError, notifySuccess } from '@/lib/notify';

const signinSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to manage your API projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" size="lg" onClick={async () => {
              setErrors({});
              const parsed = signinSchema.safeParse({ email, password });
              if (!parsed.success) {
                const fieldErrors: Record<string,string> = {};
                parsed.error.errors.forEach(e => { if (e.path[0]) fieldErrors[e.path[0] as string] = e.message });
                setErrors(fieldErrors);
                return;
              }
              setLoading(true);
              try {
                const payload = await auth.signin({ email, password });
                const user = payload.user;
                if (user && !user.is_active) {
                  notifyError('Account not active. Please wait for activation.');
                } else {
                  notifySuccess('Welcome back!');
                  navigate('/dashboard');
                }
              } catch (err: any) {
                if (err?.details && typeof err.details === 'object') {
                  const fieldErrors: Record<string,string> = {};
                  Object.entries(err.details).forEach(([k,v]) => fieldErrors[k] = String((v as any)?.message || v));
                  setErrors(fieldErrors);
                } else {
                  notifyError(err?.message || err);
                }
              } finally { setLoading(false); }
            }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
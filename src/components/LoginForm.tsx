
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock } from 'lucide-react';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to Living Goods Commodity Tracker!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-orange-50 font-comic">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/7334be09-684d-43d3-9eb3-3180f308eae4.png" 
              alt="Living Goods Logo" 
              className="w-20 sm:w-24 h-auto mx-auto mb-3"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-primary mb-1">
              Living Goods
            </h1>
            <p className="text-sm sm:text-base text-orange-600 font-semibold">
              Commodity Tracker App
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="space-y-1 px-4 sm:px-6 pb-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-center text-gray-800">
                Sign In
              </CardTitle>
              <p className="text-center text-gray-600 text-xs sm:text-sm">
                Access your community health inventory
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 text-sm">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-primary text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-primary text-sm"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-sm mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-gray-600 bg-white/50">
        <p>&copy; 2025 Living Goods. All rights reserved.</p>
      </footer>
    </div>
  );
};

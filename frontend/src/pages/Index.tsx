import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, Code, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">API Builder</span>
            </div>
            <div className="flex gap-2">
              <Link to="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Build APIs from your{" "}
              <span className="text-primary">database</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create powerful APIs with dedicated Postgres + PostgREST instances. 
              Write SQL, map endpoints, and deploy instantly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="px-8">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Dedicated Database
              </h3>
              <p className="text-muted-foreground">
                Each project gets its own Postgres + PostgREST runtime
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                SQL Editor
              </h3>
              <p className="text-muted-foreground">
                Write SQL to create tables, functions, and manage your schema
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                API Designer  
              </h3>
              <p className="text-muted-foreground">
                Map tables and functions to REST endpoints with visual tools
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

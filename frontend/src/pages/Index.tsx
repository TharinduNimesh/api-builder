import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Code, 
  Zap, 
  Shield, 
  Layers, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  Globe,
  Lock,
  Settings,
  Table,
  GitBranch,
  Play,
  Users,
  Rocket
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">API Builder</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
            </nav>
            <div className="flex gap-3">
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/20" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              No-Code API Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Build Production-Ready{" "}
              <span className="text-primary relative">
                APIs
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary/30"/>
                </svg>
              </span>{" "}
              Without Writing Code
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Visual database management, automatic API generation, built-in authentication & authorization. 
              Stop wrestling with backend frameworks — just plug and build.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="px-8 py-6 text-lg group">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="https://wa.me/917994576991" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg group">
                  <Phone className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Book a Demo
                </Button>
              </a>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Free tier available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Deploy in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Build APIs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete backend platform that handles databases, APIs, and security — all from one intuitive interface.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Database className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Visual Database Designer
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Create tables, define relationships, and manage your schema visually. Each project gets its own dedicated PostgreSQL instance.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Automatic REST APIs
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                APIs are automatically generated from your tables. Map custom endpoints, add filters, and configure responses — all without code.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Built-in Authentication
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                JWT-based auth with user registration, login, and role management. Secure your endpoints with granular permissions.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Row-Level Security
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Fine-grained access control at the database level. Define who can read, write, or modify each row of data.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Code className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                SQL Editor & Functions
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Write custom SQL when needed. Create stored procedures and database functions to extend your API capabilities.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Instant Deployment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your APIs are live the moment you create them. No build steps, no deployment pipelines — just instant access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Zero to API in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to build your complete backend infrastructure
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                    1
                  </div>
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Table className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Design Your Database</h3>
                  <p className="text-muted-foreground">
                    Create tables and relationships using our visual designer or SQL editor. Your schema, your way.
                  </p>
                </div>
                <div className="hidden md:block absolute top-20 right-0 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent translate-x-1/2" />
              </div>
              
              {/* Step 2 */}
              <div className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                    2
                  </div>
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Settings className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Configure Endpoints</h3>
                  <p className="text-muted-foreground">
                    Map tables to REST endpoints, set up authentication rules, and define access permissions.
                  </p>
                </div>
                <div className="hidden md:block absolute top-20 right-0 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent translate-x-1/2" />
              </div>
              
              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Go Live Instantly</h3>
                <p className="text-muted-foreground">
                  Your API is ready! Get your endpoints, test them in-browser, and integrate with your frontend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 md:py-28 bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Why Developers Choose API Builder
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Stop spending weeks building backend infrastructure. Focus on what makes your product unique.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">10x Faster Development</h4>
                      <p className="text-muted-foreground">Build in days what used to take months. No backend code to write or maintain.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">No Framework Lock-in</h4>
                      <p className="text-muted-foreground">Standard REST APIs work with any frontend — React, Vue, mobile apps, or anything else.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Enterprise-Grade Security</h4>
                      <p className="text-muted-foreground">JWT authentication, role-based access, and row-level security built-in from day one.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Full SQL Power</h4>
                      <p className="text-muted-foreground">Visual tools for simplicity, raw SQL when you need control. Best of both worlds.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-card rounded-2xl border border-border shadow-2xl p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="font-mono text-sm space-y-2">
                    <div className="text-muted-foreground">// Your API endpoints</div>
                    <div>
                      <span className="text-green-500">GET</span>
                      <span className="text-foreground ml-2">/api/users</span>
                    </div>
                    <div>
                      <span className="text-blue-500">POST</span>
                      <span className="text-foreground ml-2">/api/users</span>
                    </div>
                    <div>
                      <span className="text-yellow-500">PUT</span>
                      <span className="text-foreground ml-2">/api/users/:id</span>
                    </div>
                    <div>
                      <span className="text-red-500">DELETE</span>
                      <span className="text-foreground ml-2">/api/users/:id</span>
                    </div>
                    <div className="pt-4 text-muted-foreground">// Auto-generated from 'users' table</div>
                    <div className="text-muted-foreground">// Auth: JWT required</div>
                    <div className="text-muted-foreground">// RLS: enabled</div>
                  </div>
                </div>
                <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 bg-primary/20 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Build Your API?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join developers who've ditched boilerplate backend code. Start building in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="px-10 py-6 text-lg">
                  Start Building Free
                </Button>
              </Link>
              <a href="https://wa.me/917994576991" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="px-10 py-6 text-lg">
                  <Phone className="mr-2 h-5 w-5" />
                  Book a Demo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">API Builder</span>
              </div>
              <p className="text-background/70 mb-6">
                The no-code platform for building production-ready APIs. Design, deploy, and scale without writing backend code.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-background/20 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-background/70 hover:text-background transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-background/70 hover:text-background transition-colors">How It Works</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">Pricing</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">Documentation</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">About Us</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">Careers</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">Blog</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-background/70 hover:text-background transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <ul className="space-y-4">
                <li>
                  <a href="https://wa.me/917994576991" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                    +91 79945 76991 (WhatsApp)
                  </a>
                </li>
                <li>
                  <a href="mailto:datafusion@zohomail.com" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    datafusion@zohomail.com
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-background/70">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Kochi, India</span>
                  </div>
                </li>
              </ul>
              
              <div className="mt-6">
                <a href="https://wa.me/917994576991" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Book a Demo Call
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="pt-8 border-t border-background/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-background/60 text-sm">
                © 2026 API Builder. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-background/60 hover:text-background transition-colors">Privacy</a>
                <a href="#" className="text-background/60 hover:text-background transition-colors">Terms</a>
                <a href="#" className="text-background/60 hover:text-background transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

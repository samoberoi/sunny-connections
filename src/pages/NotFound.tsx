import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
          <MapPin className="h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist</p>
        <Button asChild className="gradient-blue text-primary-foreground rounded-2xl shadow-blue h-12 px-8">
          <a href="/">Go Home</a>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;

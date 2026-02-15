import { Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/30 bg-card/40 backdrop-blur-sm mt-12 sm:mt-16">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left"
        >
          <span className="text-xs sm:text-sm text-muted-foreground">
            Made by{' '}
            <span className="text-foreground font-medium">Amey</span>
          </span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <motion.a
            href="https://twitter.com/ameytwtcorp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors group"
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
            <span>@ameytwtcorp</span>
          </motion.a>
        </motion.div>
      </div>
    </footer>
  );
}


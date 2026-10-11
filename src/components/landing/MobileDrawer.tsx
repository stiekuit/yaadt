import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Briefcase, FolderOpen, Mail, Search, Github, Linkedin, Twitter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";

interface DrawerItem {
  icon: React.ElementType;
  label: string;
  href: string;
  description?: string;
}

const navigationItems: DrawerItem[] = [
  { icon: Home, label: "Home", href: "/", description: "Back to landing" },
  { icon: Briefcase, label: "Services", href: "#services", description: "Our offerings" },
  { icon: FolderOpen, label: "Projects", href: "#projects", description: "Case studies" },
  { icon: Mail, label: "Contact", href: "#contact", description: "Get in touch" },
];

const socialLinks: { icon: React.ElementType; label: string; href: string }[] = [
  { icon: Github, label: "GitHub", href: "https://github.com/yaadt" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/yaadt" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/yaadt" },
];

interface MobileDrawerProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MobileDrawer = ({ children, open, onOpenChange }: MobileDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-[88vw] max-w-sm p-0"
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                YAADT
              </SheetTitle>
              <p className="text-sm text-muted-foreground">Your AI-Assisted Dev Team</p>
            </SheetHeader>

            {/* Search */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.label}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-6 pt-0 space-y-4">
              <Separator />
              
              {/* Social links */}
              <div>
                <p className="text-xs text-muted-foreground mb-3">Follow us</p>
                <div className="flex gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Button
                        key={social.label}
                        variant="outline"
                        size="icon"
                        asChild
                        className="hover:bg-gradient-to-br hover:from-violet-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all"
                      >
                        <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                          <Icon className="w-4 h-4" />
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Version */}
              <p className="text-xs text-muted-foreground text-center">
                YAADT v1.0.0 • Built with ❤️
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

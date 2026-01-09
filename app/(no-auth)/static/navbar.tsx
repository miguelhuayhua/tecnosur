'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Menu, Facebook, Youtube, Instagram, Linkedin, Phone, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { useSession } from 'next-auth/react';
import { UserNav } from '@/components/dashboard/user-nav';
import InputSearch from './input-search';
import Image from 'next/image';
import { useTheme } from 'next-themes';
// Types
export interface Navbar02NavItem {
  href?: string;
  label: string;
  submenu?: boolean;
  type?: 'description' | 'simple' | 'icon';
  items?: Array<{
    href: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
}

export interface Navbar02Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar02NavItem[];
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
}

// Default navigation links
const defaultNavigationLinks: Navbar02NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/nexus', label: 'Nexus Educa' },
  {
    label: 'Cursos',
    href: '/cursos',
  },
  {
    label: 'En vivo',
    href: '/#en-vivo',
  },
  {
    label: 'Certificaciones',
    href: '/certificaciones',
  },
];

// Social media links - Actualizado para Nexus Educa
const socialLinks = [
  { href: 'https://facebook.com/nexuseduca', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com/nexus_educa', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/nexuseduca', icon: Youtube, label: 'YouTube' },
  { href: 'https://linkedin.com/company/nexus-educa', icon: Linkedin, label: 'LinkedIn' },
];

export const Navbar = React.forwardRef<HTMLElement, Navbar02Props>(
  (
    {
      className,
      logoHref = '#',
      navigationLinks = defaultNavigationLinks,
      signInText = 'Sign In',
      signInHref = '#signin',
      ctaText = 'Iniciar sesión',
      ctaHref = '#get-started',
      onSignInClick,
      onCtaClick,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { resolvedTheme, forcedTheme } = useTheme()
    const { status } = useSession();

    useEffect(() => {
      setMounted(true);
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    useEffect(() => {
      const checkWidth = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      if (typeof window !== 'undefined') {
        checkWidth();
        const mediaQuery = window.matchMedia('(max-width: 1023px)');

        const handleResize = () => {
          setIsMobile(mediaQuery.matches);
        };

        mediaQuery.addEventListener('change', handleResize);

        return () => {
          mediaQuery.removeEventListener('change', handleResize);
        };
      }
    }, []);

    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const navItems = [
      {
        name: "Cursos",
        link: "/cursos",
      },
      {
        name: "Certificaciones",
        link: "/certificaciones",
      },
      {
        name: "En Vivo",
        link: "/en-vivo",
      },
      {
        name: "Nosotros",
        link: "/sobre-nosotros",
      },
      {
        name: "Contacto",
        link: "/contacto",
      },
    ];
    return (
      <>
        {/* Top Bar - Contact and Social Media */}
        <div className={cn(
          "fixed top-0 left-0 right-0 z-[60] py-2 bg-gradient-to-r from-primary/95 to-secondary/95 transition-all duration-500 ease-in-out lg:flex hidden",
          scrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}>
          <div className="container mx-auto h-full px-4">
            <div className="flex items-center justify-between h-full">
              {/* Contact Info */}
              <div className="flex items-center gap-6 text-sm text-white/90">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <a href="tel:+51123456789" className="hover:text-white">
                    +51 1 234-5678
                  </a>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <a href="mailto:info@nexuseduca.com" className="hover:text-white">
                    info@nexuseduca.com
                  </a>
                </motion.div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/80">Conéctate con nosotros:</span>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/80 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={social.label}
                      >
                        <Icon className='size-4' />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <header
          ref={combinedRef}
          className={cn(
            'fixed left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out backdrop-blur-md bg-background/80 [&_*]:no-underline px-4 md:px-10 lg:px-5 xl:px-20 2xl:px-50',
            scrolled ? 'top-0 shadow-sm' : 'top-0 lg:top-10',
            className
          )}
          {...(props as any)}
        >
          <div className="mx-auto flex h-16 items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex items-center gap-2">
              {/* Mobile menu trigger */}
              <div className='lg:hidden'>
                <Sheet open={isMobileMenuOpen && isMobile} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} >
                      <Button variant="ghost" size="icon" aria-label="Abrir menú">
                        <Menu />
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="w-[calc(100%-1em)] z-[1000] shadow-none mx-auto rounded-lg backdrop-blur-sm bg-background overflow-hidden mb-[0.5em] h-[calc(100%-1em)] px-5">
                    <SheetHeader className="pb-0">
                      <SheetTitle>Nexus Educa</SheetTitle>
                      <SheetDescription>
                        Tu puente hacia el conocimiento del futuro
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-1">
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                          <Link
                            href={item.link}
                            className="flex items-center py-3 px-4 rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <SheetFooter>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="flex flex-col gap-3"
                      >
                        {status == 'authenticated' ? (
                          <Link href="/dashboard">
                            <Button className="w-full">Ir al Dashboard</Button>
                          </Link>
                        ) : (
                          <>
                            <Button asChild size="sm" className="w-full">
                              <Link href={'/login'}>
                                Iniciar Sesión
                              </Link>
                            </Button>
                            <Button
                              variant={'secondary'}
                              size="sm"
                              className="w-full"
                              asChild
                            >
                              <Link href="/cursos">
                                Buscar Cursos
                              </Link>
                            </Button>
                          </>
                        )}
                      </motion.div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo y navegación */}
              <div className="flex items-center gap-8">
                <Link href={'/'}>
                  {mounted ? (
                    <Image
                      alt='logo'
                      width={100}
                      height={100}
                      src={resolvedTheme === 'dark' ? '/dark_logo.png' : '/light.png'}
                      priority
                    />
                  ) : (
                    <div className="w-[100px] h-[100px]" />
                  )}
                </Link>
                <InputSearch />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-6 hidden lg:flex mr-6">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={index}
                    className='font-medium text-sm hover:text-primary transition-colors'
                    href={link.href || "#"}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Button variant='ghost' className='rounded-full lg:hidden' size='icon'>
                <Search />
              </Button>

              <CurrencySelector />

              {status == 'authenticated' ? (
                <UserNav />
              ) : (
                <Button asChild variant="default">
                  <Link href='/login'>
                    Acceder
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </header>
      </>
    );
  }
);

Navbar.displayName = 'Navbar';
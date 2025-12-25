'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Menu, Facebook, Youtube, Instagram, Linkedin, Phone, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion"


import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { useSession } from 'next-auth/react';
import { UserNav } from '@/components/dashboard/user-nav';


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
  { href: '/tecsur', label: 'Tecsur' },
  {
    label: 'Cursos',
    href: '/cursos',
  },
  {
    label: 'En vivo',
    submenu: true,
    type: 'simple',
    items: [
      { href: '#product-a', label: 'Product A' },
      { href: '#product-b', label: 'Product B' },
      { href: '#product-c', label: 'Product C' },
      { href: '#product-d', label: 'Product D' },
    ],
  },
];

// Social media links
const socialLinks = [
  { href: 'https://facebook.com/tecsurperu', icon: Facebook, label: 'Facebook' },
  { href: 'https://instagram.com/tecsurperu', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/tecsurperu', icon: Youtube, label: 'YouTube' },
  { href: 'https://linkedin.com/company/tecsurperu', icon: Linkedin, label: 'LinkedIn' },
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
    const containerRef = useRef<HTMLElement>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { status } = useSession();

    // Reemplaza tu useEffect actual con esto:
    useEffect(() => {
      const checkWidth = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      // Establecer valor inicial basado en user-agent o media query
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
    // Combine refs
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
        name: "Certificados",
        link: "/certificados",
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
          "hidden lg:flex py-2  bg-gradient-to-r from-primary/90 to-primary transition-all duration-300",
        )}>
          <div className="container mx-auto h-full px-4 ">
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
                  <a href="mailto:contacto@tecsurperu.edu.pe" className="hover:text-white">
                    contacto@tecsurperu.edu.pe
                  </a>
                </motion.div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/80">Síguenos:</span>
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
            'sticky top-0 z-50 w-full border-b px-4 md:px-10 lg:px-20 xl:px-50 backdrop-blur bg-background/95  [&_*]:no-underline',
            className
          )}
          {...(props as any)}
        >
          <div className="mx-auto flex h-16  items-center justify-between gap-4">
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
                  <SheetContent side="bottom" className="w-[calc(100%-1em)] z-[1000] shadow-none mx-auto rounded-lg backdrop-blur-sm bg-background/80 overflow-hidden mb-[0.5em] h-[calc(100%-1em)] px-5">
                    <SheetHeader className="pb-0">
                      <SheetTitle>Navegación</SheetTitle>
                      <SheetDescription className="px-4 text-foreground/60">
                        Explora todas las secciones de TecSur
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
                            className="flex items-center py-3 px-4 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <SheetFooter>
                      <Separator className="my-4" />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="flex flex-col gap-3"
                      >
                        {status == 'authenticated' ? (
                          <Link href="/dashboard">
                            <Button className="w-full">Ir a dashboard</Button>
                          </Link>
                        ) : (
                          <>
                            <Button asChild size="sm" className="w-full">
                              <Link href={'/login'}>
                                Iniciar Sesión
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant={'secondary'}
                              size="sm"
                              className="w-full"
                            >
                              <Link
                                href={'https://wa.me/59169848691?text=Hola%20TecSur,%20quiero%20más%20información'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Comenzar ahora
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </>
                        )}
                      </motion.div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
              {/* Main nav */}
              <div className="flex items-center gap-8">
                <Link href={'/'}>
                  <span className="mr-8 font-bold text-xl">TecSur</span>
                </Link>
                <InputGroup className='rounded-full hidden lg:flex'>
                  <InputGroupInput placeholder='¿Qué estás buscando?' className='w-xs' />
                  <InputGroupAddon align={'inline-end'}>
                    <InputGroupButton >
                      <Search />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                {/* Navigation menu */}

              </div>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-6 hidden lg:flex mr-6">
                {
                  navigationLinks.map((link, index) => (

                    <Link key={index} className='font-medium text-sm' href={link.href || "#"}>
                      {link.label}
                    </Link>
                  ))
                }
              </div>
              <Button variant='ghost' className='rounded-full lg:hidden' size='icon'>
                <Search>/</Search>
              </Button>
              <CurrencySelector />
              {
                status == 'authenticated' ?
                  <UserNav /> :
                  <Button asChild>
                    <Link href='/login'>
                      Acceder
                    </Link>
                  </Button>
              }
            </div>
          </div>
        </header>
      </>
    );
  }
);
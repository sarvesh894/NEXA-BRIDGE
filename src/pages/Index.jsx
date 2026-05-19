import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence
} from 'framer-motion';

import {
  Users,
  Briefcase,
  MessageSquare,
  Calendar,
  ArrowRight,
  Shield,
  GraduationCap,
  Globe,
  Sun,
  Moon,
  Star,
  Link2,
  BarChart3,
  UserCheck,
  Rocket,
  Handshake,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  Sparkles,
  Play,
  Building2,
  DollarSign,
  Heart,
  ChevronRight
} from 'lucide-react';

import hero3d from '@/assets/hero-3d.png';
import problem3d from '@/assets/problem-3d.png';
import solution3d from '@/assets/solution-3d.png';

import previewDashboard from '@/assets/preview-dashboard.jpg';
import previewChat from '@/assets/preview-chat.jpg';
import previewDirectory from '@/assets/preview-directory.jpg';

/* ── Animations ── */

const ease = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  hidden: {
    opacity: 0,
    y: 40
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.8,
      ease
    }
  }
});

function Reveal({
  children,
  className = '',
  delay = 0
}) {
  const ref = useRef(null);

  const inView = useInView(ref, {
    once: true,
    margin: '-60px'
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={
        inView
          ? 'visible'
          : 'hidden'
      }
      variants={fadeUp(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ── */

const features = [
  {
    icon: Shield,
    title:
      'Secure OTP Login',
    desc: 'Fast & secure authentication'
  },

  {
    icon: Link2,
    title:
      'Smart Connections',
    desc: 'AI-powered alumni matching'
  },

  {
    icon: MessageSquare,
    title:
      'Real-Time Chat',
    desc: 'Instant messaging & media'
  },

  {
    icon: Calendar,
    title:
      'Mentorship Sessions',
    desc: 'Book 1-on-1 sessions'
  },

  {
    icon: Briefcase,
    title: 'Job Board',
    desc: 'Exclusive opportunities'
  },

  {
    icon: BarChart3,
    title:
      'Admin Analytics',
    desc: 'Full platform control'
  }
];

const stats = [
  {
    value: '10K+',
    label:
      'Alumni Connected',
    icon: Users
  },

  {
    value: '500+',
    label: 'Opportunities',
    icon: Briefcase
  },

  {
    value: '200+',
    label: 'Events Hosted',
    icon: Calendar
  },

  {
    value: '98%',
    label: 'Satisfaction',
    icon: Star
  }
];

const demoTabs = [
  {
    label: 'Dashboard',
    img: previewDashboard,
    icon: BarChart3
  },

  {
    label: 'Chat',
    img: previewChat,
    icon: MessageSquare
  },

  {
    label: 'Directory',
    img: previewDirectory,
    icon: Users
  }
];

export default function Index() {
  const navigate =
    useNavigate();

  const {
    theme,
    toggleTheme
  } = useTheme();

  const [
    activeDemo,
    setActiveDemo
  ] = useState(0);

  const heroRef =
    useRef(null);

  const {
    scrollYProgress
  } = useScroll({
    target: heroRef,
    offset: [
      'start start',
      'end start'
    ]
  });

  const heroY =
    useTransform(
      scrollYProgress,
      [0, 1],
      [0, 200]
    );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(
        ({
          data: {
            session
          }
        }) => {
          if (
            session?.user
          ) {
            navigate(
              '/dashboard',
              {
                replace: true
              }
            );
          }
        }
      );
  }, [navigate]);

  useEffect(() => {
    const t =
      setInterval(() => {
        setActiveDemo(
          (p) =>
            (p + 1) %
            demoTabs.length
        );
      }, 5000);

    return () =>
      clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* NAVBAR */}

      <motion.nav
        initial={{
          y: -30,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        transition={{
          duration: 0.6
        }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-border/30"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          <h1
            className="text-xl font-extrabold tracking-tight cursor-pointer"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior:
                  'smooth'
              })
            }
          >
            Nexa
            <span className="text-primary">
              Bridge
            </span>
          </h1>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">

            <button
              className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              Features
            </button>

            <button
              className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              Preview
            </button>

            <button
              onClick={() =>
                navigate(
                  '/institutions'
                )
              }
              className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full flex items-center gap-1"
            >
              <Building2 className="h-4 w-4" />

              For Institutions
            </button>
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={
                toggleTheme
              }
            >
              {theme ===
              'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() =>
                navigate(
                  '/auth'
                )
              }
            >
              Login
            </Button>

            <Button
              className="bg-gradient-to-r from-primary to-accent"
              onClick={() =>
                navigate(
                  '/auth'
                )
              }
            >
              Get Started

              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}

      <header
        ref={heroRef}
        className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden"
      >
        <motion.div
          style={{
            y: heroY
          }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-8">
                <Sparkles className="h-4 w-4" />

                The Alumni
                Connection
                Engine
              </div>

              <h2 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight">
                Reconnect.
                Grow.
                <br />

                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Succeed
                  Together.
                </span>
              </h2>

              <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
                One platform
                for mentorship,
                internships,
                career growth &
                lifelong alumni
                connections.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <Button
                  size="lg"
                  onClick={() =>
                    navigate(
                      '/auth'
                    )
                  }
                >
                  Get Started
                  Free

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                >
                  <Play className="mr-2 h-4 w-4" />

                  Watch Demo
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-8">
                {stats
                  .slice(0, 3)
                  .map((s) => (
                    <div
                      key={
                        s.label
                      }
                    >
                      <p className="text-xl font-extrabold">
                        {
                          s.value
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          s.label
                        }
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* RIGHT */}

            <div className="hidden lg:block relative">

              <img
                src={hero3d}
                alt="Hero"
                className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl"
              />

            </div>
          </div>
        </motion.div>
      </header>

      {/* FEATURES */}

      <section className="py-20">

        <div className="container mx-auto px-4">

          <Reveal className="text-center mb-16">

            <h3 className="text-3xl md:text-5xl font-extrabold">
              Everything
              You Need
            </h3>

          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">

            {features.map(
              (f, i) => (
                <Reveal
                  key={i}
                >
                  <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500">

                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>

                    <h4 className="font-bold text-lg mb-2">
                      {f.title}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </Reveal>
              )
            )}

          </div>
        </div>
      </section>

      {/* DEMO */}

      <section className="py-20 bg-muted/20">

        <div className="container mx-auto px-4">

          <Reveal className="text-center mb-12">

            <h3 className="text-3xl md:text-5xl font-extrabold">
              See It In
              Action
            </h3>

          </Reveal>

          <div className="max-w-5xl mx-auto">

            <div className="flex justify-center gap-2 mb-8">

              {demoTabs.map(
                (
                  tab,
                  i
                ) => (
                  <button
                    key={i}
                    onClick={() =>
                      setActiveDemo(
                        i
                      )
                    }
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      activeDemo ===
                      i
                        ? 'bg-primary text-white'
                        : 'bg-card border border-border/50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />

                    {
                      tab.label
                    }
                  </button>
                )
              )}

            </div>

            <AnimatePresence mode="wait">

              <motion.div
                key={
                  activeDemo
                }
                initial={{
                  opacity: 0,
                  y: 30
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0
                }}
                transition={{
                  duration: 0.5
                }}
                className="rounded-2xl overflow-hidden border border-border/40 shadow-2xl bg-card"
              >

                <img
                  src={
                    demoTabs[
                      activeDemo
                    ].img
                  }
                  alt="Preview"
                  className="w-full"
                />

              </motion.div>

            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="py-16 border-t border-border/30 bg-card/30">

        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            <div className="md:col-span-2">

              <h2 className="text-2xl font-extrabold">
                Nexa
                <span className="text-primary">
                  Bridge
                </span>
              </h2>

              <p className="text-sm text-muted-foreground mt-3 max-w-sm">
                Bridging the
                gap between
                students and
                alumni.
              </p>
            </div>

            <div>

              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-muted-foreground">
                Navigation
              </h4>

              <ul className="space-y-3">

                <li
                  onClick={() =>
                    navigate(
                      '/auth'
                    )
                  }
                  className="text-sm text-foreground/70 hover:text-primary cursor-pointer"
                >
                  Login
                </li>

                <li
                  onClick={() =>
                    navigate(
                      '/institutions'
                    )
                  }
                  className="text-sm text-foreground/70 hover:text-primary cursor-pointer"
                >
                  For
                  Institutions
                </li>

              </ul>
            </div>

            <div>

              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-muted-foreground">
                Contact
              </h4>

              <ul className="space-y-3">

                <li className="flex items-center gap-3 text-sm text-foreground/70">
                  <Mail className="h-4 w-4 text-primary/50" />

                  contact@nexabridge.com
                </li>

                <li className="flex items-center gap-3 text-sm text-foreground/70">
                  <MapPin className="h-4 w-4 text-primary/50" />

                  India
                </li>

                <li className="flex items-center gap-3 text-sm text-foreground/70">
                  <Phone className="h-4 w-4 text-primary/50" />

                  +91 XXXXX
                  XXXXX
                </li>

              </ul>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-sm text-muted-foreground">
              ©{' '}
              {new Date().getFullYear()}

              {' '}
              NexaBridge.
              All rights
              reserved.
            </p>

          </div>
        </div>
      </footer>
    </div>
  );
}

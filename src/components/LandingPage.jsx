import { useState, useRef, useEffect } from 'react';
import {
    Shield, Mic, Hammer, ChevronRight, Lock,
    Activity, ArrowRight, Wallet, Users, CheckCircle,
    Menu, X, TrendingUp, Zap, Smartphone, FileText,
    Globe, BarChart3, ShieldCheck,
    LayoutDashboard, PieChart, Bell, GraduationCap, FolderClock,
    Github, Twitter, Linkedin, Mail, Phone, MapPin, ExternalLink,
    Sliders, Calculator, Receipt, Landmark
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LandingPage = ({ onLogin, onSignup }) => {
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // We'll track the scroll position of the entire sticky wrapper
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });


    // Determine active section based on scroll progress
    // Plateau mapping: [0, 0.15] -> 0, [0.20, 0.40] -> 1, [0.45, 0.65] -> 2, [0.70, 0.95] -> 3
    const activeSection = useTransform(scrollYProgress,
        [0, 0.15, 0.20, 0.40, 0.45, 0.65, 0.70, 0.95],
        [0, 0, 1, 1, 2, 2, 3, 3]
    );

    const smoothSection = useSpring(activeSection, { stiffness: 200, damping: 30 });

    useEffect(() => {
        const handleScroll = () => {
            setNavScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            title: "Smart Voice Notepad",
            desc: "Logging expenses shouldn't be a chore. Just speak, and our AI categorizes everything instantly.",
            icon: Mic,
            benefits: [
                "Natural Language Processing",
                "Instant receipt scanning",
                "Multi-currency support",
                "Recurring expense detection"
            ]
        },
        {
            title: "Expenditure Sandbox",
            desc: "Simulate major purchases. See how buying a new car or home affects your long-term wealth.",
            icon: Hammer,
            benefits: [
                "Monte Carlo simulations",
                "Impact analysis",
                "Stress testing",
                "Visual timeline"
            ]
        },
        {
            title: "Nominee Vault",
            desc: "Ensure your family is protected. Securely store insurance policies and legal documents.",
            icon: Lock,
            benefits: [
                "Dead man's switch protocol",
                "Multi-sig access",
                "Zero-knowledge storage",
                "Automated check-ins"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-muted">
            {/* Navigation Bar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <img src="/src/assets/finbox-icon.png" alt="FinBox" className="w-8 h-8 object-contain rounded-full" />
                        <span className="font-bold text-xl tracking-tight">FinBox</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features-list" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
                        <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Security</a>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" onClick={onLogin}>Sign In</Button>
                        <Button onClick={onSignup}>Get Started</Button>
                    </div>

                    <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-background pt-24 px-6 flex flex-col gap-6">
                    <a href="#features-list" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Features</a>
                    <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">How it Works</a>
                    <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Security</a>
                    <Button onClick={onSignup} className="w-full">Get Started</Button>
                </div>
            )}

            {/* MAIN CONTENT WRAPPER */}
            <div ref={containerRef} className="relative w-full">
                {/* STICKY BACKGROUND LAYER (Phone & Morphing Cards) */}
                <div className="hidden lg:block sticky top-0 h-screen w-full pointer-events-none z-0">
                    <div className="max-w-7xl mx-auto h-full relative">
                        <UnifiedStickyCard activeSection={smoothSection} scrollYProgress={scrollYProgress} features={features} />
                    </div>
                </div>

                {/* FOREGROUND CONTENT LAYER */}
                <div className="relative z-10 w-full max-w-7xl mx-auto -mt-[100vh]">
                    <div className="grid lg:grid-cols-2 gap-10 px-4 relative">
                        {/* LEFT COLUMN: SCROLLABLE SECTIONS */}
                        <div className="flex flex-col">
                            {/* HERO TEXT SECTION */}
                            <div id="hero" className="min-h-screen flex items-center py-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="max-w-xl pointer-events-auto"
                                >
                                    <Badge variant="outline" className="mb-6 px-3 py-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                        Live Beta Available
                                    </Badge>

                                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
                                        Master Your <br />
                                        Financial Legacy
                                    </h1>
                                    <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                                        The all-in-one platform for family finance. Track expenses, forecast your future, and secure your assets for the next generation.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Button size="lg" onClick={onLogin} className="group">
                                            Start For Free
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>

                                    </div>

                                    {/* Mouse animation removed */}
                                </motion.div>
                            </div>

                            {/* FEATURE ANCHORS (Invisible targets for scroll tracking) */}
                            {features.map((_, i) => (
                                <div id={`feature-${i}`} key={i} className="min-h-[140vh]" />
                            ))}
                        </div>

                        {/* RIGHT COLUMN (Empty spacer for the sticky phone) */}
                        <div className="hidden lg:block h-screen" />
                    </div>
                </div>
            </div>

            {/* FEATURES LIST SECTION */}
            <div id="features-list" className="py-24 bg-background border-t relative z-50">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4">Complete Financial Ecosystem</h2>
                        <p className="text-muted-foreground">Access all your financial tools in one unified interface.</p>
                    </motion.div>

                    {/* Infinite Scrolling Marquee */}
                    <div className="relative w-full overflow-hidden mask-linear-fade">
                        {/* Gradient Masks for edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>

                        <motion.div
                            className="flex gap-6 w-max py-4"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                repeat: Infinity,
                                ease: "linear",
                                duration: 20
                            }}
                        >
                            {[...Array(2)].map((_, setIndex) => (
                                [
                                    { name: "Home", icon: LayoutDashboard },
                                    { name: "Analytics", icon: PieChart },
                                    { name: "Entry", icon: Mic },
                                    { name: "Notifications", icon: Bell },
                                    { name: "Sandbox", icon: Hammer },
                                    { name: "Learn", icon: GraduationCap },
                                    { name: "Legacy", icon: FolderClock },
                                    // Add a few more to ensure smooth loop if screen is wide
                                    { name: "Settings", icon: Activity },
                                    { name: "Vault", icon: ShieldCheck }
                                ].map((item, i) => (
                                    <div
                                        key={`${setIndex}-${i}`}
                                        className="flex flex-col items-center justify-center min-w-[160px] h-[160px] bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-default group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors text-primary">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{item.name}</span>
                                    </div>
                                ))
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div id="how-it-works" className="py-24 bg-background relative z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold mb-4">Simple, Powerful Workflow</h2>
                        <p className="text-muted-foreground">From chaos to clarity in three simple steps.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Connect",
                                desc: "Sync your accounts or enter data manually with our smart voice logger.",
                                icon: Smartphone
                            },
                            {
                                step: "02",
                                title: "Analyze",
                                desc: "Our AI processes your spending patterns to find savings opportunities.",
                                icon: BarChart3
                            },
                            {
                                step: "03",
                                title: "Prosper",
                                desc: "Follow personalized recommendations to grow your net worth.",
                                icon: TrendingUp
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative p-8 rounded-3xl border border-border/50 bg-card hover:bg-secondary/20 transition-colors group"
                            >
                                <div className="absolute top-6 right-8 text-6xl font-black text-muted/20 select-none group-hover:text-primary/10 transition-colors">
                                    {item.step}
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BENTO GRID SECTION (Move outside containerRef to end sticky behavior) */}
            <div id="bento" className="py-32 px-4 relative z-50 bg-background">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-4"
                    >
                        Everything you need. <br />
                        Nothing you don't.
                    </motion.h2>
                    <p className="text-muted-foreground text-lg">
                        Built for speed, security, and clarity. No clutter, just control.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Large Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2"
                    >
                        <Card className="h-full bg-secondary/30">
                            <CardHeader>
                                <Globe className="w-8 h-8 mb-2" />
                                <CardTitle>Global Sync</CardTitle>
                                <CardDescription>Real-time synchronization across all your devices.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Start on your phone, finish on your desktop. Works offline and syncs when you're back.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Tall Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="row-span-2"
                    >
                        <Card className="h-full bg-secondary/30 flex flex-col justify-between">
                            <CardHeader>
                                <ShieldCheck className="w-8 h-8 mb-2" />
                                <CardTitle>Bank-Grade Audit</CardTitle>
                                <CardDescription>Full audit trails for every transaction.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mt-4">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background border">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <div className="h-2 w-20 bg-muted rounded-full"></div>
                                            <div className="h-2 w-8 bg-muted rounded-full ml-auto"></div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Small Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full bg-secondary/30">
                            <CardHeader>
                                <Zap className="w-8 h-8 mb-2" />
                                <CardTitle>Instant OCR</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Scan receipts in 0.2s</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Small Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="h-full bg-secondary/30">
                            <CardHeader>
                                <BarChart3 className="w-8 h-8 mb-2" />
                                <CardTitle>AI Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Weekly spending analysis.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Trust & Security Section */}
            <section id="security" className="py-24 border-t bg-secondary/10 relative z-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16">Bank-Grade Security</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: "AES-256 Encryption", desc: "Your data is encrypted at rest and in transit." },
                            { icon: Lock, title: "Zero Knowledge", desc: "We cannot see your personal financial details." },
                            { icon: CheckCircle, title: "Biometric Ready", desc: "Compatible with device-level authentication." }
                        ].map((item, i) => (
                            <Card key={i} className="border-none shadow-none bg-transparent">
                                <CardHeader className="items-center">
                                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle>{item.title}</CardTitle>
                                    <CardDescription>{item.desc}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="py-20 border-t bg-background relative z-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        {/* Brand Column */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="flex items-center gap-2">
                                <img src="/src/assets/finbox-icon.png" alt="FinBox" className="w-8 h-8 object-contain rounded-full" />
                                <span className="font-bold text-2xl tracking-tight">FinBox</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Empowering families to build, secure, and pass on their financial legacy.
                            </p>
                            <div className="flex gap-4">
                                {[Twitter, Github, Linkedin].map((Icon, i) => (
                                    <Button key={i} size="icon" variant="outline" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <Icon className="w-4 h-4" />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Builders Column */}
                        <div className="md:col-span-2">
                            <h3 className="font-bold mb-6">Meet the Builders</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center text-center group">
                                        <div className="w-16 h-16 rounded-full bg-secondary mb-3 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Builder${i}`}
                                                alt="Builder"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-sm font-semibold">Dev {i + 1}</div>
                                        <div className="text-xs text-muted-foreground">Engineer</div>
                                        <div className="flex justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Linkedin className="w-3 h-3 cursor-pointer hover:text-primary" />
                                            <Github className="w-3 h-3 cursor-pointer hover:text-primary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Column */}
                        <div>
                            <h3 className="font-bold mb-6">Contact</h3>
                            <ul className="space-y-4 text-muted-foreground">
                                <li className="flex items-center gap-3 hover:text-foreground transition-colors cursor-pointer">
                                    <Mail className="w-4 h-4" />
                                    <span>hello@finbox.com</span>
                                </li>
                                <li className="flex items-center gap-3 hover:text-foreground transition-colors cursor-pointer">
                                    <Phone className="w-4 h-4" />
                                    <span>+1 (555) 123-4567</span>
                                </li>
                                <li className="flex items-center gap-3 hover:text-foreground transition-colors cursor-pointer">
                                    <MapPin className="w-4 h-4" />
                                    <span>San Francisco, CA</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <div>
                            © 2025 FinBox Inc. All rights reserved.
                        </div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-foreground transition-colors">Cookie Settings</a>
                        </div>
                    </div>
                </div>
            </footer>
            <ScrollNavigator />
        </div >
    );
};

export default LandingPage;

const ScrollNavigator = () => {
    const checkpoints = [
        "hero",
        "feature-0",
        "feature-1",
        "feature-2",
        "features-list",
        "how-it-works",
        "bento",
        "security",
        "footer"
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const autoScrollRef = useRef(null);

    // Track active section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            // Check if we are at the very bottom of the page
            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
            if (isBottom) {
                setActiveIndex(checkpoints.length - 1);
                setIsAutoScrolling(false); // Stop autoscroll at bottom
                return;
            }

            // Find which checkpoint is currently most visible
            // We use window.scrollY + offset to detect which section acts as the "current" one
            const scrollPosition = window.scrollY + window.innerHeight / 3;
            let currentIndex = 0;

            for (let i = 0; i < checkpoints.length; i++) {
                const el = document.getElementById(checkpoints[i]);
                if (el) {
                    // Get absolute position relative to document
                    const rect = el.getBoundingClientRect();
                    const absoluteTop = rect.top + window.scrollY;

                    if (absoluteTop <= scrollPosition) {
                        currentIndex = i;
                    }
                }
            }
            setActiveIndex(currentIndex);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll Effect
    useEffect(() => {
        if (isAutoScrolling) {
            const step = () => {
                window.scrollBy({ top: 3.0, behavior: 'auto' }); // Doubled speed (was 1.5)
                autoScrollRef.current = requestAnimationFrame(step);
            };
            autoScrollRef.current = requestAnimationFrame(step);
        } else {
            if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
        }

        return () => {
            if (autoScrollRef.current) cancelAnimationFrame(autoScrollRef.current);
        };
    }, [isAutoScrolling]);

    // Construct manual stop handler
    useEffect(() => {
        const handleWheel = () => {
            if (isAutoScrolling) setIsAutoScrolling(false);
        };
        const handleTouch = () => {
            if (isAutoScrolling) setIsAutoScrolling(false);
        };

        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouch);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouch);
        };
    }, [isAutoScrolling]);

    const scrollToCheckpoint = (direction) => {
        setIsAutoScrolling(false); // Manually navigating should stop auto-scroll
        let newIndex = direction === 'up' ? activeIndex - 1 : activeIndex + 1;

        // Clamp index
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= checkpoints.length) newIndex = checkpoints.length - 1;

        const targetId = checkpoints[newIndex];
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            setActiveIndex(newIndex); // Optimistic update
        }
    };

    const toggleAutoScroll = () => {
        setIsAutoScrolling(!isAutoScrolling);
    }

    return (
        <div className="fixed bottom-10 right-10 z-[60] flex flex-col items-center gap-2">
            <motion.div
                className="flex flex-col items-center bg-background/80 backdrop-blur-md border border-muted-foreground/20 rounded-full shadow-2xl py-3 px-1.5 gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <button
                    onClick={() => scrollToCheckpoint('up')}
                    className="p-1 text-muted-foreground hover:text-foreground transition-all active:scale-110 active:text-primary rounded-full hover:bg-secondary/50"
                    disabled={activeIndex === 0}
                    style={{ opacity: activeIndex === 0 ? 0.3 : 1 }}
                >
                    <ChevronRight className="w-5 h-5 -rotate-90" />
                </button>

                {/* Mouse Indicator - Click to toggle Auto-Scroll */}
                <div
                    onClick={toggleAutoScroll}
                    className={`w-5 h-8 border-2 rounded-full flex justify-center p-1 relative cursor-pointer transition-colors ${isAutoScrolling ? "border-primary bg-primary/10" : "border-muted-foreground/40 hover:border-primary/60"}`}
                    title={isAutoScrolling ? "Click to stop auto-scroll" : "Click for auto-scroll"}
                >
                    <motion.div
                        className={`w-1 h-2 rounded-full ${isAutoScrolling ? "bg-primary" : "bg-foreground/60"}`}
                        animate={{
                            y: [0, 4, 0]
                        }}
                        transition={{
                            duration: isAutoScrolling ? 0.5 : 1.5, // Faster animation when active
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <button
                    onClick={() => scrollToCheckpoint('down')}
                    className="p-1 text-muted-foreground hover:text-foreground transition-all active:scale-110 active:text-primary rounded-full hover:bg-secondary/50"
                    disabled={activeIndex === checkpoints.length - 1}
                    style={{ opacity: activeIndex === checkpoints.length - 1 ? 0.3 : 1 }}
                >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
            </motion.div>
        </div>
    );
};




const UnifiedStickyCard = ({ activeSection, scrollYProgress, features }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useTransform(activeSection, (value) => {
        const rounded = Math.floor(value);
        if (rounded !== currentStep && rounded >= 0 && rounded <= 3) {
            setCurrentStep(rounded);
        }
        return value;
    });

    // 3D Transforms based on active section for the phone itself
    const rotateX = useTransform(activeSection, [0, 1, 2, 3], [0, 5, -5, 0]);
    const rotateY = useTransform(activeSection, [0, 1, 2, 3], [0, -15, 15, 0]);
    const rotateZ = useTransform(activeSection, [0, 1, 2, 3], [0, 2, -2, 0]);
    const phoneScale = useTransform(activeSection, [0, 1, 2, 3], [1, 0.9, 0.9, 1]);
    const phoneX = useTransform(activeSection, [0, 1, 2, 3], [300, 300, 300, 300]); // Moved right
    const phoneOpacity = useTransform(activeSection, [0, 1, 2, 3], [1, 0.8, 0.8, 1]);

    // Data for the 3 morphing cards mapped to features
    const cardConfigs = [
        {
            id: 1,
            featureIndex: 0,
            orbitPos: { top: "15%", left: "55%" },
            targetPos: { top: "25%", left: "5%" },
            miniContent: (
                <div className="relative overflow-hidden w-full h-full flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500"></div>

                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Passive Income</div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-1">
                        ₹42,500
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-[9px] text-emerald-500 mt-0.5">+12.5% this month</div>
                </div>
            )
        },
        {
            id: 2,
            featureIndex: 1,
            orbitPos: { top: "45%", left: "58%" },
            targetPos: { top: "25%", left: "5%" },
            miniContent: (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Growth</div>
                        <div className="text-[9px] font-mono text-emerald-500">+8.2%</div>
                    </div>
                    <div className="flex items-end gap-1 h-8">
                        {[40, 70, 50, 90, 60].map((v, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-primary/60 rounded-t-sm"
                                animate={{ height: [`${v}%`, `${v * 0.6}%`, `${v}%`] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 3,
            featureIndex: 2,
            orbitPos: { top: "70%", left: "55%" },
            targetPos: { top: "25%", left: "5%" },
            miniContent: (
                <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan"></div>
                    <ShieldCheck className="w-6 h-6 text-primary mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Vault Active</span>
                    <div className="text-[8px] text-muted-foreground mt-1 font-mono">256-BIT ENCRYPTED</div>

                    {/* Horizontal scanning line */}
                    <motion.div
                        className="absolute w-full h-[1px] bg-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            )
        },
        {
            id: 4,
            featureIndex: -1, // Generic orbiting card
            orbitPos: { top: "40%", left: "85%" },
            targetPos: { top: "40%", left: "85%" },
            miniContent: (
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 animate-[pulse_0.5s_ease-in-out_infinite]" />
                    <div>
                        <span className="text-[10px] font-bold block leading-none">Fast Sync</span>
                        <span className="text-[8px] text-muted-foreground">Live Updates</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="w-full h-full flex items-center justify-center relative perspective-1000">
            {/* Main Phone */}
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    rotateZ,
                    scale: phoneScale,
                    x: phoneX,
                    opacity: phoneOpacity,
                    transformStyle: "preserve-3d"
                }}
                className="w-[300px] h-[580px] bg-background rounded-[45px] border-[8px] border-muted shadow-2xl relative overflow-hidden z-20 pointer-events-auto"
            >
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-muted rounded-b-xl z-30 flex items-center justify-center">
                    <div className="w-16 h-1 bg-background/20 rounded-full"></div>
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 p-6 pt-14 flex flex-col h-full bg-background">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && <CardContentHero key="hero" />}
                        {currentStep === 1 && <CardContentNotepad key="notepad" />}
                        {currentStep === 2 && <CardContentSandbox key="sandbox" />}
                        {currentStep === 3 && <CardContentNominee key="nominee" />}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Morphing Cards */}
            {cardConfigs.map((config) => (
                <MorphingCard
                    key={config.id}
                    config={config}
                    activeSection={activeSection}
                    feature={config.featureIndex >= 0 ? features[config.featureIndex] : null}
                />
            ))}
        </div>
    );
};

const MorphingCard = ({ config, activeSection, feature }) => {
    // Determine the state of this specific card
    // We want it to occupy the "expanded" state when its featureIndex matches (activeSection-1)
    const isExpanded = useTransform(activeSection, (v) => {
        if (config.featureIndex === -1) return false;
        // The transition starts as we approach the section and peaks when we are IN it.
        // Section indices are 1, 2, 3 for features.
        const target = config.featureIndex + 1;
        return Math.abs(v - target) < 0.4;
    });

    const [expanded, setExpanded] = useState(false);
    useMotionValueEvent(isExpanded, "change", (latest) => {
        setExpanded(latest);
    });

    // Unified Animation values: [Orbit -> Flight -> Expansion -> Flight Back -> Orbit]
    // Section indices are 0 (Hero), 1 (Feature 0), 2 (Feature 1), 3 (Feature 2)
    const targetSection = config.featureIndex + 1;

    // We animate top/left instead of x/y for the main positional shift
    // Orbit -> Target Position -> Orbit w/ wobbles

    // Parse the orbit and target positions into numbers (assuming % strings)
    const orbitTop = parseFloat(config.orbitPos.top);
    const orbitLeft = parseFloat(config.orbitPos.left);
    const targetTop = parseFloat(config.targetPos.top); // e.g. 25
    const targetLeft = parseFloat(config.targetPos.left); // e.g. 5

    const top = useTransform(activeSection,
        [0, targetSection - 0.5, targetSection, targetSection + 0.5, 4],
        [`${orbitTop}%`, `${orbitTop}%`, `${targetTop}%`, `${orbitTop}%`, `${orbitTop}%`]
    );

    const left = useTransform(activeSection,
        [0, targetSection - 0.5, targetSection, targetSection + 0.5, 4],
        [`${orbitLeft}%`, `${orbitLeft}%`, `${targetLeft}%`, `${orbitLeft}%`, `${orbitLeft}%`]
    );

    // Small wobble transforms for liveliness
    const x = useTransform(activeSection,
        [0, targetSection - 0.5, targetSection, targetSection + 0.5, 4],
        [0, 20, 0, -20, 0]
    );

    const y = useTransform(activeSection,
        [0, targetSection - 0.5, targetSection, targetSection + 0.5, 4],
        [0, -10, 0, 10, 0]
    );

    // CONDITIONAL SIZING: If generic card (index -1), stay small. Else expand.
    const scale = useTransform(activeSection,
        [0, targetSection - 0.4, targetSection, targetSection + 0.4, 4],
        [1, 1, config.featureIndex === -1 ? 1 : 1.2, 1, 1]
    );

    const width = useTransform(activeSection,
        [0, targetSection - 0.3, targetSection, targetSection + 0.3, 4],
        ["140px", "140px", config.featureIndex === -1 ? "140px" : "450px", "140px", "140px"]
    );

    const height = useTransform(activeSection,
        [0, targetSection - 0.3, targetSection, targetSection + 0.3, 4],
        ["80px", "80px", config.featureIndex === -1 ? "80px" : "400px", "80px", "80px"]
    );
    const borderRadius = useTransform(activeSection,
        [0, targetSection - 0.3, targetSection, targetSection + 0.3, 4],
        ["16px", "16px", config.featureIndex === -1 ? "16px" : "24px", "16px", "16px"]
    );
    const opacity = useTransform(activeSection,
        [0, targetSection - 0.8, targetSection, targetSection + 0.8, 4],
        [config.featureIndex === -1 ? 1 : 0.6, 0.8, 1, 0.8, config.featureIndex === -1 ? 1 : 0.6]
    );

    return (
        <motion.div
            style={{
                position: "absolute",
                top,
                left,
                x: config.featureIndex === -1 ? 0 : x,
                y: config.featureIndex === -1 ? 0 : y,
                scale,
                width,
                height,
                borderRadius,
                opacity,
                zIndex: expanded ? 100 : 90, // Significantly higher than phone (z-20)
            }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
            }}
            className="bg-background/80 backdrop-blur-md border border-muted/50 shadow-2xl overflow-hidden pointer-events-auto flex flex-col p-6"
        >
            <AnimatePresence mode="wait">
                {!expanded ? (
                    <motion.div
                        key="mini"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col justify-center"
                    >
                        {config.miniContent}
                    </motion.div>
                ) : (
                    <motion.div
                        key="full"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="h-full flex flex-col relative"
                    >
                        {/* Subtle background glow for active state */}
                        <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full z-0 pointer-events-none"></div>

                        {feature && (
                            <div className="relative z-10 flex flex-col h-full">
                                <motion.div
                                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </motion.div>

                                <motion.h3
                                    className="text-3xl font-bold mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {feature.title}
                                </motion.h3>

                                <motion.p
                                    className="text-muted-foreground text-lg mb-8 leading-relaxed"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {feature.desc}
                                </motion.p>

                                <div className="grid grid-cols-1 gap-3 mt-auto">
                                    {feature.benefits.map((benefit, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-center gap-3 text-sm text-foreground/80"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + (i * 0.1) }}
                                        >
                                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            {benefit}
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <Button variant="link" className="mt-8 p-0 w-max text-primary font-bold group">
                                        Explore Feature <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


// --- Card Contents ---

const CardContentHero = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="flex flex-col h-full"
    >
        <div className="flex justify-between items-center mb-8">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Activity className="w-5 h-5" />
            </div>
            <Badge variant="secondary" className="text-xs">+24%</Badge>
        </div>
        <div className="space-y-2 mb-8">
            <div className="text-muted-foreground text-sm">Total Net Worth</div>
            <div className="text-3xl font-bold">₹12.45L</div>
        </div>
        <div className="h-32 w-full flex items-end p-2 gap-1 mt-auto mb-4">
            {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                <div key={i} className="flex-1 bg-foreground rounded-t-sm" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }}></div>
            ))}
        </div>
    </motion.div>
);

const CardContentNotepad = () => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col h-full"
    >
        <div className="text-center mb-8">
            <h3 className="text-lg font-bold">Smart Voice Entry</h3>
            <p className="text-xs text-muted-foreground">Listening...</p>
        </div>

        <div className="flex-1 space-y-4">
            <div className="bg-secondary/50 p-4 rounded-2xl rounded-tr-none self-end ml-4 relative overflow-hidden">
                <motion.p
                    className="text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    "Lunch with team at Bistro..."
                </motion.p>
                {/* Typewriter cursor effect */}
                <motion.div
                    className="absolute right-2 bottom-2 w-2 h-4 bg-primary/50"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            </div>

            <div className="border p-3 rounded-2xl rounded-tl-none self-start mr-8 shadow-sm bg-card">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Categorized</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-1"><Receipt className="w-3 h-3 text-muted-foreground" /> Food & Dining</span>
                    <span>₹1,250</span>
                </div>
            </div>
        </div>

        {/* Waveform Animation */}
        <div className="mt-auto flex flex-col items-center pb-8 gap-4">
            <div className="flex items-center gap-1 h-8">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{ height: ["20%", "80%", "20%"] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.05,
                            repeatType: "mirror"
                        }}
                    />
                ))}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
                <Mic className="w-5 h-5" />
            </div>
        </div>
    </motion.div>
);

const CardContentSandbox = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col h-full"
    >
        <div className="text-center mb-8">
            <h3 className="text-lg font-bold">Budget Simulation</h3>
            <p className="text-xs text-muted-foreground">Impact Analysis</p>
        </div>
        <Card className="mb-6 bg-secondary/20 border-border shadow-sm">
            <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute top-2 right-2">
                    <Calculator className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground mb-1">Projected Savings</div>
                <motion.div
                    className="text-2xl font-bold"
                    key="savings"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    ₹1.42L
                </motion.div>
            </CardContent>
        </Card>
        <div className="space-y-6 px-2">
            <div>
                <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>New Car Loan</span>
                    <span className="text-destructive">-₹15k/mo</span>
                </div>
                {/* Animated Slider Impact */}
                <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute h-full bg-foreground rounded-full"
                        animate={{ width: ["30%", "65%", "30%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute h-full w-1 bg-white z-10"
                        animate={{ left: ["30%", "65%", "30%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>Low Impact</span>
                    <span>High Impact</span>
                </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-background/50">
                <Sliders className="w-4 h-4 text-primary" />
                <div className="text-xs">
                    <div className="font-semibold">Auto-adjusting...</div>
                    <div className="text-muted-foreground text-[10px]">Optimizing other expenses</div>
                </div>
            </div>
        </div>
    </motion.div>
);

const CardContentNominee = () => (
    <motion.div
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        exit={{ opacity: 0, rotateY: -90 }}
        className="flex flex-col h-full items-center justify-center text-center"
    >
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 relative">
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute -inset-1 rounded-full border border-dashed border-primary/10 animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        <h3 className="text-xl font-bold mb-1">Secure Vault</h3>
        <p className="text-xs text-muted-foreground mb-8">Family Access Protocol Active</p>

        <div className="w-full space-y-3 px-4">
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card relative overflow-hidden group"
            >
                <div className="absolute left-0 w-1 h-full bg-emerald-500"></div>
                <ShieldCheck className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                <div className="text-left text-sm flex-1">
                    <div className="font-medium">Term Insurance</div>
                    <div className="text-[10px] text-muted-foreground">Encrypted • 12MB</div>
                </div>
                <Lock className="w-3 h-3 text-muted-foreground" />
            </motion.div>

            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card relative overflow-hidden group"
            >
                <div className="absolute left-0 w-1 h-full bg-blue-500"></div>
                <Landmark className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                <div className="text-left text-sm flex-1">
                    <div className="font-medium">Property Deeds</div>
                    <div className="text-[10px] text-muted-foreground">Encrypted • 45MB</div>
                </div>
                <Lock className="w-3 h-3 text-muted-foreground" />
            </motion.div>
        </div>
    </motion.div>
);

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Trophy, Star, Target, Award, Crown, Flame, CheckCircle2, TrendingUp, Lock,
  Play, Video, Lightbulb, DollarSign, PiggyBank, Calculator, LineChart,
  CreditCard, ShieldCheck, BarChart3, Briefcase, GraduationCap, Rocket,
  BookOpen, X, ChevronRight, ChevronLeft, PlayCircle, Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const Learn = () => {
  const { t } = useTheme();

  // State Management
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedContent, setCompletedContent] = useState([]);
  const [watchedSubtopics, setWatchedSubtopics] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [completedBonusTasks, setCompletedBonusTasks] = useState([]);

  // Scroll Refs
  const scrollContainerRefs = useRef({});

  const scroll = (category, direction) => {
    const container = scrollContainerRefs.current[category];
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Derived values - Better scaling
  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, userLevel - 1));
  const progressPercentage = Math.min((currentXP / xpForNextLevel) * 100, 100);

  // Load/Save Logic 
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('gamifiedLearnProgress');
      if (savedData) {
        const data = JSON.parse(savedData);
        setUserLevel(data.level || 1);
        setCurrentXP(data.currentXp || 0);
        setTotalXP(data.totalXp || 0);
        setStreak(data.streak || 0);
        setCompletedContent(data.completed || []);
        setWatchedSubtopics(data.watched || {});
        setCompletedBonusTasks(data.bonusTasks || []);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const progressData = {
        level: userLevel,
        currentXp: currentXP,
        totalXp: totalXP,
        streak: streak,
        completed: completedContent,
        watched: watchedSubtopics,
        bonusTasks: completedBonusTasks,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('gamifiedLearnProgress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [userLevel, currentXP, totalXP, streak, completedContent, watchedSubtopics, completedBonusTasks]);

  // Learning Content 
  const learningContent = [
    {
      id: 'basics-1',
      title: 'What is Financial Literacy?',
      type: 'video',
      category: 'Financial Basics',
      icon: Lightbulb,
      xp: 50,
      duration: '15 min',
      requiredLevel: 1,
      description: 'Understanding the fundamentals of managing money and making informed financial decisions for a secure future.',
      difficulty: 'Beginner',
      keyPoints: ['Understanding the importance of financial knowledge', 'Building a strong financial foundation', 'Making informed money decisions', 'Planning for short and long-term goals'],
      videoSubtopics: [
        { name: 'Khan Academy - Financial Literacy Course', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy', duration: '10 min' },
        { name: 'Two Cents PBS - Money Basics', url: 'https://www.youtube.com/@TwoCentsPBS', duration: '8 min' },
        { name: 'The Financial Diet Channel', url: 'https://www.youtube.com/@thefinancialdiet', duration: '12 min' },
        { name: 'NerdWallet - Financial Education', url: 'https://www.youtube.com/@nerdwallet', duration: '15 min' }
      ]
    },
    {
      id: 'basics-2',
      title: 'Income vs Expenses',
      type: 'video',
      category: 'Financial Basics',
      icon: DollarSign,
      xp: 50,
      duration: '12 min',
      requiredLevel: 1,
      description: 'Learn how to track your income and expenses to understand your financial situation.',
      difficulty: 'Beginner',
      keyPoints: ['Identifying all income sources', 'Categorizing expenses properly', 'Using the 50/30/20 budgeting rule', 'Creating a sustainable spending plan'],
      videoSubtopics: [
        { name: 'Khan Academy - Income & Expenses', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy', duration: '8 min' },
        { name: 'The Financial Diet - Budgeting Guide', url: 'https://www.youtube.com/@thefinancialdiet', duration: '10 min' },
        { name: 'Two Cents - 50/30/20 Rule', url: 'https://www.youtube.com/@TwoCentsPBS', duration: '7 min' }
      ]
    },
    {
      id: 'basics-3',
      title: 'Emergency Funds',
      type: 'video',
      category: 'Financial Basics',
      icon: ShieldCheck,
      xp: 40,
      duration: '10 min',
      requiredLevel: 2,
      description: 'Why you need an emergency fund and how to build one that protects your financial future.',
      difficulty: 'Beginner',
      keyPoints: ['Understanding emergency fund importance', 'Calculating your required amount', 'Where to keep emergency savings', 'How to build it gradually'],
      videoSubtopics: [
        { name: 'Khan Academy - Emergency Funds', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy', duration: '9 min' },
        { name: 'The Financial Diet - Emergency Savings', url: 'https://www.youtube.com/@thefinancialdiet', duration: '11 min' }
      ]
    },
    {
      id: 'basics-4',
      title: 'Credit Scores Explained',
      type: 'video',
      category: 'Financial Basics',
      icon: CheckCircle2,
      xp: 60,
      duration: '10 min',
      requiredLevel: 2,
      description: 'Master your credit score: what it is, how it is calculated, and how to improve it.',
      difficulty: 'Beginner',
      keyPoints: ['FICO score components', 'Impact of payment history', 'Credit utilization ratio', 'Disputing errors'],
      videoSubtopics: [
        { name: 'Credit Score 101', url: 'https://www.youtube.com/@TwoCentsPBS', duration: '5 min' },
        { name: 'How to Boost Your Score', url: 'https://www.youtube.com/@nerdwallet', duration: '8 min' }
      ]
    },
    {
      id: 'basics-5',
      title: 'Banking 101',
      type: 'video',
      category: 'Financial Basics',
      icon: PiggyBank,
      xp: 50,
      duration: '15 min',
      requiredLevel: 1,
      description: 'Understanding checking, savings, and other bank accounts.',
      difficulty: 'Beginner',
      keyPoints: ['Checking vs Savings', 'Interest rates (APY)', 'Avoiding bank fees', 'FDIC insurance'],
      videoSubtopics: [
        { name: 'Banking Basics', url: 'https://www.youtube.com/@KhanAcademy', duration: '10 min' },
        { name: 'High Yield Savings', url: 'https://www.youtube.com/@ThePlainBagel', duration: '8 min' }
      ]
    },
    {
      id: 'investing-1',
      title: 'Stock Market Basics',
      type: 'video',
      category: 'Investing',
      icon: LineChart,
      xp: 100,
      duration: '20 min',
      requiredLevel: 3,
      description: 'Introduction to how stock markets work and why investing is crucial for wealth building.',
      difficulty: 'Intermediate',
      keyPoints: ['How stock markets function', 'Understanding market indices', 'The power of compound interest', 'Long-term vs short-term investing'],
      videoSubtopics: [
        { name: 'Khan Academy - Stock Market Explained', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy', duration: '12 min' },
        { name: 'The Plain Bagel - Stock Basics', url: 'https://www.youtube.com/@ThePlainBagel', duration: '15 min' }
      ]
    },
    {
      id: 'investing-2',
      title: 'ETFs vs Mutual Funds',
      type: 'video',
      category: 'Investing',
      icon: BarChart3,
      xp: 80,
      duration: '15 min',
      requiredLevel: 3,
      description: 'Comparing Exchange Traded Funds and Mutual Funds to decide given your investment goals.',
      difficulty: 'Intermediate',
      keyPoints: ['Expense ratios', 'Active vs Passive management', 'Liquidity differences', 'Tax implications'],
      videoSubtopics: [
        { name: 'ETFs Explained', url: 'https://www.youtube.com/@ThePlainBagel', duration: '10 min' },
        { name: 'Mutual Funds 101', url: 'https://www.youtube.com/@TwoCentsPBS', duration: '8 min' }
      ]
    },
    {
      id: 'investing-3',
      title: 'Crypto Basics',
      type: 'video',
      category: 'Investing',
      icon: DollarSign,
      xp: 120,
      duration: '25 min',
      requiredLevel: 5,
      description: 'An introduction to cryptocurrencies, blockchain technology, and the risks involved.',
      difficulty: 'Advanced',
      keyPoints: ['Blockchain fundamentals', 'Bitcoin vs Altcoins', 'Wallets and security', 'Volatility risks'],
      videoSubtopics: [
        { name: 'Bitcoin for Beginners', url: 'https://www.youtube.com/@AndreasAntonopoulos', duration: '15 min' },
        { name: 'Blockchain Explained', url: 'https://www.youtube.com/@SimplyExplained', duration: '10 min' }
      ]
    },
    {
      id: 'investing-4',
      title: 'Retirement Accounts',
      type: 'video',
      category: 'Investing',
      icon: Briefcase,
      xp: 90,
      duration: '20 min',
      requiredLevel: 4,
      description: 'Understanding 401(k)s, IRAs, and other retirement savings vehicles.',
      difficulty: 'Intermediate',
      keyPoints: ['Tax advantage accounts', 'Employer matching', 'Withdrawal rules', 'Contribution limits'],
      videoSubtopics: [
        { name: 'Roth IRA vs Traditional', url: 'https://www.youtube.com/@TheFinancialDiet', duration: '12 min' },
        { name: '401(k) Basics', url: 'https://www.youtube.com/@NerdWallet', duration: '8 min' }
      ]
    },
    {
      id: 'debt-1',
      title: 'Debt Snowball vs Avalanche',
      type: 'video',
      category: 'Debt Management',
      icon: CreditCard,
      xp: 100,
      duration: '15 min',
      requiredLevel: 4,
      description: 'Two proven strategies to systematically eliminate debt and achieve financial freedom.',
      difficulty: 'Intermediate',
      keyPoints: ['Snowball method: smallest balance first', 'Avalanche method: highest interest first', 'Which strategy works best for you', 'Staying motivated during debt payoff'],
      videoSubtopics: [
        { name: 'Dave Ramsey - Debt Snowball', url: 'https://www.youtube.com/@DaveRamsey', duration: '10 min' },
        { name: 'Budget Girl - Debt-Free Journey', url: 'https://www.youtube.com/@BudgetGirl', duration: '12 min' }
      ]
    },
    {
      id: 'debt-2',
      title: 'Consolidation Loans',
      type: 'video',
      category: 'Debt Management',
      icon: Target,
      xp: 80,
      duration: '12 min',
      requiredLevel: 4,
      description: 'When and how to use debt consolidation to lower interest rates and simplify payments.',
      difficulty: 'Intermediate',
      keyPoints: ['Pros and cons of consolidation', 'Balance transfer cards', 'Personal loans', 'Impact on credit score'],
      videoSubtopics: [
        { name: 'Debt Consolidation Explained', url: 'https://www.youtube.com/@TwoCentsPBS', duration: '8 min' },
        { name: 'Balance Transfers', url: 'https://www.youtube.com/@NerdWallet', duration: '6 min' }
      ]
    },
    {
      id: 'debt-3',
      title: 'Credit Card Hacks',
      type: 'video',
      category: 'Debt Management',
      icon: CreditCard,
      xp: 70,
      duration: '10 min',
      requiredLevel: 3,
      description: 'Using credit cards wisely to earn rewards without falling into debt traps.',
      difficulty: 'Intermediate',
      keyPoints: ['Paying in full every month', 'Reward points and miles', 'Travel hacking basics', 'Avoiding interest'],
      videoSubtopics: [
        { name: 'Credit Card Rewards 101', url: 'https://www.youtube.com/@ThePointsGuy', duration: '10 min' },
        { name: 'Avoiding Fees', url: 'https://www.youtube.com/@GrahamStephan', duration: '8 min' }
      ]
    },
    {
      id: 'advanced-1',
      title: 'Real Estate Investing',
      type: 'video',
      category: 'Advanced Investing',
      icon: Briefcase,
      xp: 100,
      duration: '25 min',
      requiredLevel: 6,
      description: 'Comprehensive guide to real estate investment strategies and portfolio diversification.',
      difficulty: 'Advanced',
      keyPoints: ['Rental property analysis', 'REITs vs direct ownership', 'Leveraging real estate for wealth', 'Market analysis and location selection'],
      videoSubtopics: [
        { name: 'Graham Stephan - Real Estate Guide', url: 'https://www.youtube.com/@GrahamStephan', duration: '18 min' },
        { name: 'Bigger Pockets - Real Estate Basics', url: 'https://www.youtube.com/@biggerpockets', duration: '22 min' }
      ]
    },
    {
      id: 'advanced-2',
      title: 'Options Trading',
      type: 'video',
      category: 'Advanced Investing',
      icon: TrendingUp,
      xp: 150,
      duration: '30 min',
      requiredLevel: 8,
      description: 'A deep dive into call and put options, hedging strategies, and risk management.',
      difficulty: 'Expert',
      keyPoints: ['Calls vs Puts', 'Strike prices and expiration', 'The Greeks (Delta, Theta)', 'Risk management'],
      videoSubtopics: [
        { name: 'Options Trading for Beginners', url: 'https://www.youtube.com/@ProjectOption', duration: '15 min' },
        { name: 'Understanding The Greeks', url: 'https://www.youtube.com/@Tastytrade', duration: '15 min' }
      ]
    },
    {
      id: 'advanced-3',
      title: 'Angel Investing',
      type: 'video',
      category: 'Advanced Investing',
      icon: Rocket,
      xp: 200,
      duration: '20 min',
      requiredLevel: 10,
      description: 'Investing in early-stage startups: high risk, high reward.',
      difficulty: 'Expert',
      keyPoints: ['Evaluating startups', 'Understanding equity and dilution', 'Term sheets', 'Exit strategies'],
      videoSubtopics: [
        { name: 'Angel Investing 101', url: 'https://www.youtube.com/@YCombinator', duration: '12 min' },
        { name: 'How to Evaluate Startups', url: 'https://www.youtube.com/@Slidebean', duration: '10 min' }
      ]
    },
    {
      id: 'advanced-4',
      title: 'Tax Strategies',
      type: 'video',
      category: 'Advanced Investing',
      icon: Calculator,
      xp: 120,
      duration: '18 min',
      requiredLevel: 7,
      description: 'Legal ways to minimize tax liability and maximize investment returns.',
      difficulty: 'Advanced',
      keyPoints: ['Tax-loss harvesting', 'Capital gains tax rates', 'Asset location', 'Estate planning questions'],
      videoSubtopics: [
        { name: 'Tax Loss Harvesting', url: 'https://www.youtube.com/@ThePlainBagel', duration: '8 min' },
        { name: 'Capital Gains Explained', url: 'https://www.youtube.com/@TaxFoundation', duration: '10 min' }
      ]
    }
  ];

  // Bonus Tasks - Earn XP by using app features
  const bonusTasks = [
    { id: 'add-expense', title: 'Add Your First Expense', xp: 10, icon: DollarSign, description: 'Track a transaction in the Entry tab' },
    { id: 'use-voice', title: 'Use Voice Input', xp: 15, icon: Play, description: 'Try adding a transaction using voice command' },
    { id: 'upload-receipt', title: 'Scan a Receipt', xp: 15, icon: Upload, description: 'Upload and scan a receipt or file' },
    { id: 'fast-track-5', title: 'Use Fast Track 5 Times', xp: 20, icon: Rocket, description: 'Use quick-add buttons to log transactions' },
    { id: 'setup-budget', title: 'Create a Budget', xp: 25, icon: PiggyBank, description: 'Set up your first budget in Sandbox' },
    { id: 'check-analytics', title: 'View Analytics', xp: 10, icon: BarChart3, description: 'Check your spending analytics' },
    { id: 'add-nominee', title: 'Add a Nominee', xp: 20, icon: ShieldCheck, description: 'Secure your legacy by adding a nominee' },
    { id: 'complete-profile', title: 'Complete Your Profile', xp: 15, icon: Target, description: 'Fill out all profile information' },
    { id: 'week-streak', title: '7-Day Streak', xp: 50, icon: Flame, description: 'Use the app for 7 consecutive days' },
    { id: 'custom-fast-track', title: 'Customize Fast Track', xp: 10, icon: Star, description: 'Edit or add a Fast Track button' },
  ];


  // Helper Functions
  const isLocked = (content) => userLevel < content.requiredLevel;
  const isCompleted = (contentId) => completedContent.includes(contentId);

  const markSubtopicWatched = (contentId, subtopicIndex) => {
    setWatchedSubtopics(prev => {
      const contentWatched = prev[contentId] || [];
      if (!contentWatched.includes(subtopicIndex)) {
        return {
          ...prev,
          [contentId]: [...contentWatched, subtopicIndex]
        };
      }
      return prev;
    });
  };

  const completeContent = (content) => {
    if (isCompleted(content.id) || isLocked(content)) return;
    setCompletedContent(prev => [...prev, content.id]);
    const newCurrentXP = currentXP + content.xp;
    const newTotalXP = totalXP + content.xp;
    setTotalXP(newTotalXP);
    if (newCurrentXP >= xpForNextLevel) {
      setUserLevel(prev => prev + 1);
      setCurrentXP(newCurrentXP - xpForNextLevel);
    } else {
      setCurrentXP(newCurrentXP);
    }
    setExpandedCard(null);
  };

  const completeBonusTask = (taskId) => {
    if (completedBonusTasks.includes(taskId)) return;
    const task = bonusTasks.find(t => t.id === taskId);
    if (!task) return;

    setCompletedBonusTasks(prev => [...prev, taskId]);
    const newCurrentXP = currentXP + task.xp;
    const newTotalXP = totalXP + task.xp;
    setTotalXP(newTotalXP);

    if (newCurrentXP >= xpForNextLevel) {
      setUserLevel(prev => prev + 1);
      setCurrentXP(newCurrentXP - xpForNextLevel);
    } else {
      setCurrentXP(newCurrentXP);
    }
  };

  // Expose function globally so other components can trigger bonus tasks
  useEffect(() => {
    window.completeLearnBonusTask = completeBonusTask;
    return () => delete window.completeLearnBonusTask;
  }, [completedBonusTasks, currentXP, totalXP, userLevel, xpForNextLevel]);


  const badge = (() => {
    if (userLevel >= 10) return { icon: Crown, label: 'Expert', variant: 'default' };
    if (userLevel >= 6) return { icon: Award, label: 'Advanced', variant: 'secondary' };
    if (userLevel >= 3) return { icon: Star, label: 'Intermediate', variant: 'secondary' };
    return { icon: Target, label: 'Beginner', variant: 'outline' };
  })();
  const BadgeIcon = badge.icon;

  const groupedContent = learningContent.reduce((acc, content) => {
    if (!acc[content.category]) acc[content.category] = [];
    acc[content.category].push(content);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Premium Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-foreground text-background shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 uppercase tracking-widest text-xs font-bold">
              <GraduationCap className="w-4 h-4" /> Financial Academy
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2">
              Level {userLevel}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge variant="outline" className="border-white/20 text-white hover:bg-white/10 px-4 py-1.5 text-sm uppercase tracking-wide">
                {badge.label}
              </Badge>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-white/90">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-mono text-lg">{streak} Day Streak</span>
              </div>
            </div>

            <div className="pt-6 w-full max-w-sm mx-auto md:mx-0">
              <div className="flex justify-between text-xs text-white/60 mb-2 uppercase tracking-wider font-semibold">
                <span>{currentXP} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/10" indicatorClassName="bg-white" />
              <p className="text-right text-[10px] text-white/40 mt-1">
                {xpForNextLevel - currentXP} XP to Level {userLevel + 1}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center relative">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-[6px] border-white/10 flex items-center justify-center backdrop-blur-sm bg-white/5">
              <BadgeIcon className="w-16 h-16 md:w-24 md:h-24 text-white opacity-90" />
            </div>
            <div className="absolute bottom-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {completedContent.length} Modules Completed
            </div>
          </div>
        </div>
      </div>


      {/* Bonus Tasks */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Bonus XP Tasks
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bonusTasks.map((task) => {
            const isTaskCompleted = completedBonusTasks.includes(task.id);
            const TaskIcon = task.icon;

            return (
              <div
                key={task.id}
                className={cn(
                  "p-4 rounded-xl border bg-card transition-all",
                  isTaskCompleted && "border-green-500/30 bg-green-500/5 opacity-70"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isTaskCompleted ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                  )}>
                    {isTaskCompleted ? <CheckCircle2 className="w-5 h-5" /> : <TaskIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    <Badge variant={isTaskCompleted ? "outline" : "secondary"} className="mt-2 text-xs font-mono">
                      {isTaskCompleted ? '✓ ' : '+'}{task.xp} XP
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Path */}
      <div className="space-y-12">
        {Object.entries(groupedContent).map(([category, contents]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <h3 className="text-2xl font-bold tracking-tight">{category}</h3>
                <Separator className="flex-1" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => scroll(category, 'left')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => scroll(category, 'right')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x"
              ref={el => scrollContainerRefs.current[category] = el}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {contents.map((content) => {
                const locked = isLocked(content);
                const completed = isCompleted(content.id);
                const ContentIcon = content.icon;

                return (
                  <div
                    key={content.id}
                    className={cn(
                      "flex-shrink-0 w-[350px] group relative rounded-2xl border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-pointer snap-start",
                      locked && "opacity-50 grayscale cursor-not-allowed bg-muted",
                      completed && "border-primary/20 bg-primary/5"
                    )}
                    onClick={() => !locked && setExpandedCard(content.id)}
                  >
                    {/* Top Image/Icon Area */}
                    <div className="aspect-video bg-muted/30 relative flex items-center justify-center overflow-hidden">
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300",
                        !locked && !completed && "group-hover:opacity-100"
                      )} />

                      <ContentIcon className={cn(
                        "w-16 h-16 text-muted-foreground/30 transition-transform duration-500",
                        !locked && "group-hover:scale-110 group-hover:text-primary/80"
                      )} />

                      {locked && <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center"><Lock className="w-8 h-8 text-foreground/50" /></div>}
                      {completed && <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></div>}
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          <span>{content.difficulty}</span>
                          <span>{content.duration}</span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {content.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                          {content.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          +{content.xp} XP
                        </Badge>

                        {!locked && (
                          <span className="text-sm font-bold flex items-center gap-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                            Start <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                        {locked && <span className="text-xs text-muted-foreground">Lvl {content.requiredLevel}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Card Modal */}
      {expandedCard && (() => {
        const content = learningContent.find(c => c.id === expandedCard);
        if (!content) return null;
        const ContentIcon = content.icon;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="fixed inset-0"
              onClick={() => setExpandedCard(null)}
            />
            <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col z-10 shadow-2xl border-2 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b bg-muted/10 flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <ContentIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold">{content.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{content.difficulty}</Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {content.duration}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-primary">+{content.xp} XP</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setExpandedCard(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8 md:gap-12">
                  {/* Left: Description & Lessons */}
                  <div className="md:col-span-2 space-y-8">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <h3 className="text-lg font-semibold mb-3">Overview</h3>
                      <p className="text-muted-foreground leading-loose text-base">
                        {content.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" /> Video Curriculum
                      </h3>
                      <div className="space-y-2">
                        {content.videoSubtopics?.map((subtopic, idx) => {
                          const isWatched = (watchedSubtopics[content.id] || []).includes(idx);
                          return (
                            <a
                              key={idx}
                              href={subtopic.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all",
                                isWatched && "bg-muted/30 border-transparent opacity-70"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                markSubtopicWatched(content.id, idx);
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                  isWatched ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                                )}>
                                  {isWatched ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{subtopic.name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{subtopic.duration}</p>
                                </div>
                              </div>
                              <div className="h-8 w-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-3 h-3 fill-current" />
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Key Points */}
                  <div className="space-y-8">
                    <div className="bg-muted/30 rounded-2xl p-6 border space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                        <Target className="w-4 h-4" /> Key Takeaways
                      </h3>
                      <ul className="space-y-3">
                        {content.keyPoints?.map((point, i) => (
                          <li key={i} className="text-sm flex gap-3 text-foreground/80">
                            <span className="text-primary mt-1">•</span>
                            <span className="leading-snug">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full h-12 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all" onClick={() => completeContent(content)}>
                      Complete Module
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Completing this module will award you <strong>{content.xp} XP</strong>
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>
        );
      })()}

    </div>
  );
};

export default Learn;

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser, SignOutButton, UserButton } from "@clerk/clerk-react";
import { isAuthConfigured } from "@/lib/env";
import { 
  useLiveStats,
  useLiveActivity,
  useCurrentTime,
  useProjects,
  useTasksDueToday,
  formatRelativeTime 
} from "@/hooks/useLiveData";
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_PLANS, formatLimit } from "@/lib/subscription";
import { SEO, seoConfigs } from "@/components/common/SEO";
import {
  LayoutDashboard,
  FolderOpen,
  Menu,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  LogOut,
  Code,
  FileText,
  Bot,
  Activity,
  RefreshCw,
  MessageSquare,
  PenTool,
  Layers,
  Loader2,
  Megaphone,
  Calendar,
  Check,
  Zap,
  Shield,
  Crown,
  Rocket,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Types
import type { ToolStatus } from "@/hooks/useLiveData";

// Tool icon mapping
const TOOL_ICONS: Record<string, React.ElementType> = {
  'code-editor': Code,
  'app-builder': Layers,
  'agent-ai': Bot,
  'aurion-chat': MessageSquare,
  'intelligent-canvas': PenTool,
  'text-editor': FileText,
};

// Tool route mapping
const TOOL_ROUTES: Record<string, string> = {
  'code-editor': '/code-editor',
  'app-builder': '/app-builder',
  'agent-ai': '/agent-ai',
  'aurion-chat': '/aurion-chat',
  'intelligent-canvas': '/intelligent-canvas',
  'text-editor': '/text-editor',
};

// White accent color for clean modern look
const ACCENT_COLOR = "#FFFFFF";

// Navigation tabs - only Overview is functional, others are placeholder for future features
const navTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, route: '/dashboard' },
];

// Weekly sales data for bar chart
const weeklySalesData = [
  { day: 'Sat', value: 0 },
  { day: 'Sun', value: 0 },
  { day: 'Mon', value: 0 },
  { day: 'Tue', value: 0 },
  { day: 'Wed', value: 0 },
  { day: 'Thu', value: 0 },
  { day: 'Fri', value: 0 },
];

// Weekly engagement donut data
const engagementData = [
  { name: 'Mobile App', value: 0, color: ACCENT_COLOR },
  { name: 'Website', value: 0, color: '#22C55E' },
];

// Sales trends area chart data
const salesTrendsData = [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 0 },
  { month: 'Mar', value: 0 },
  { month: 'Apr', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Jun', value: 0 },
];

// Pricing plans data for dashboard section - Aligned with actual SaaS tools
const DASHBOARD_PRICING_PLANS = [
  {
    id: 'free',
    name: 'Découverte',
    price: 0,
    period: '/mois',
    icon: Zap,
    popular: false,
    stripePriceId: null, // Free plan
    stripeProductId: null,
    features: [
      '2 projets actifs',
      '500 Mo de stockage',
      'Code Editor (lecture seule)',
      'Text Editor basique',
      'Intelligent Canvas (3 boards)',
      'Aurion Chat (10 msg/jour)',
    ],
    notIncluded: ['Agent AI', 'App Builder', 'Workflow'],
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 12,
    period: '/mois',
    icon: Shield,
    popular: false,
    stripePriceId: 'price_1Sgj2s018rEaMULFGFZmqHQj',
    stripeProductId: 'prod_Te15MpLvqryJHB',
    stripeUrl: 'https://buy.stripe.com/cNi4gr3Tc9jSh2X70a4ZG08', // Creator plan URL
    features: [
      '10 projets actifs',
      '5 Go de stockage',
      'Code Editor + AI autocomplete',
      'Agent AI (50 req/mois)',
      'App Builder (prototypes)',
      'Aurion Chat (100 msg/jour)',
      'Export PDF/PNG',
    ],
    notIncluded: ['Workflow Automation'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39,
    period: '/mois',
    icon: Crown,
    popular: true,
    stripePriceId: 'price_1Sr57U018rEaMULF5SkzKKe4',
    stripeProductId: 'prod_Te4WWQ2JdqTiJ0',
    stripeUrl: 'https://buy.stripe.com/dRm7sD75ofIgh2X70a4ZG05', // Pro plan URL
    features: [
      'Projets illimités',
      '50 Go de stockage',
      'Code Editor Pro + GitHub Sync',
      'Agent AI (500 req/mois)',
      'App Builder + déploiement',
      'Aurion Chat illimité',
      'Workflow Automation',
      'Monitoring Dashboard',
      'Support prioritaire (4h)',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    period: '/mois',
    icon: Rocket,
    popular: false,
    stripePriceId: 'price_1Sr59Q018rEaMULFwyBPr75O',
    stripeProductId: 'prod_Te19LcD17x07QV',
    stripeUrl: 'https://buy.stripe.com/9B600b61keEc2834S24ZG07', // Enterprise plan URL
    features: [
      'Tout illimité',
      'Agent AI + fine-tuning',
      'Workflow illimité',
      'SSO / SAML / SCIM',
      'Account Manager dédié',
      'Formation équipe incluse',
      'Déploiement on-premise',
    ],
    notIncluded: [],
  },
];



// Helper hook to safely use Clerk auth only when configured
// Wrapper component for when Clerk auth IS configured
function DashboardWithAuth() {
  const { isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  
  const userName = clerkUser?.firstName || clerkUser?.username || "User";
  
  return (
    <DashboardContent 
      isLoaded={isLoaded}
      userName={userName}
      authEnabled={true}
    />
  );
}

// Wrapper component for demo mode (no Clerk)
function DashboardDemo() {
  return (
    <DashboardContent 
      isLoaded={true}
      userName="User"
      authEnabled={false}
    />
  );
}

// Main Dashboard export
const Dashboard = () => {
  if (isAuthConfigured()) {
    return <DashboardWithAuth />;
  }
  return <DashboardDemo />;
};

// The actual dashboard content
interface DashboardContentProps {
  isLoaded: boolean;
  userName: string;
  authEnabled: boolean;
}

const DashboardContent = ({ isLoaded, userName, authEnabled }: DashboardContentProps) => {
  const navigate = useNavigate();
  // Live data hooks (connected to Supabase)
  const liveStats = useLiveStats(30000);
  const liveActivities = useLiveActivity(8, 45000);
  useCurrentTime(); // Keep time updates for live functionality
  const { projects: recentProjects, isLoading: projectsLoading } = useProjects(4);
  const { tasksCount: tasksDueToday, isLoading: tasksLoading } = useTasksDueToday();

  // Subscription hooks
  const { currentPlan, getUsageInfo, planInfo } = useSubscription();

  // Handle Stripe checkout - Use direct URLs for now
  const handleStripeCheckout = useCallback((stripeUrl: string) => {
    if (stripeUrl) {
      window.open(stripeUrl, '_blank');
    } else {
      alert('URL de paiement non configurée. Veuillez contacter le support.');
    }
  }, []);


  // Format live stats for display
  const totalSales = useMemo(() => {
    if (liveStats.isLoading) return "...";
    const revenue = liveStats.revenue || 0;
    return `$${(revenue / 1000).toFixed(1)}K`;
  }, [liveStats]);

  const activeCampaigns = useMemo(() => {
    return liveStats.isLoading ? "..." : (liveStats.totalProjects || 0).toString();
  }, [liveStats]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white font-body text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-body">
      {/* SEO Component */}
      <SEO {...seoConfigs.dashboard} />
      


      {/* Main Content */}
      <div className="w-full">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-[#0d0d0d]/90 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* Dashboard Title */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Retour à l'accueil"
              >
                <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <div className="hidden md:flex items-center gap-3">
                <Link to="/code-editor" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Code className="w-4 h-4" />
                  <span className="text-sm">Code Editor</span>
                </Link>
                <Link to="/app-builder" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">App Builder</span>
                </Link>
                <Link to="/agent-ai" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm">Agent AI</span>
                </Link>
                <Link to="/aurion-chat" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Aurion Chat</span>
                </Link>
                <Link to="/text-editor" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Text Editor</span>
                </Link>
                <Link to="/intelligent-canvas" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <PenTool className="w-4 h-4" />
                  <span className="text-sm">Canvas</span>
                </Link>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
                {authEnabled ? (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-full h-full",
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    U
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-4 md:p-6">
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Total Sales Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="col-span-12 md:col-span-4 lg:col-span-3 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white/60 text-sm">Total Sales</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/40" />
              </div>
              <p className="text-4xl font-bold mb-4">
                <span className="text-white/60 text-2xl">$ </span>
                {totalSales.replace('$', '')}
              </p>
              
              {/* Mini Bar Chart */}
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySalesData} barGap={2}>
                    <Bar 
                      dataKey="value" 
                      fill={ACCENT_COLOR}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                {weeklySalesData.map(d => (
                  <span key={d.day}>{d.day}</span>
                ))}
              </div>
            </motion.div>

            {/* Active Campaign Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-12 md:col-span-4 lg:col-span-3 bg-white rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-black/60 text-sm font-medium">Active Campaign</span>
                <ArrowUpRight className="w-4 h-4 text-black/40" />
              </div>
              
              {/* Decorative patterns */}
              <div className="absolute top-3 right-3 w-16 h-16 bg-gray-200 rounded-lg opacity-60" />
              <div className="absolute top-12 right-12 w-10 h-10 bg-black/10 rounded-lg bg-[radial-gradient(circle,_black_1px,_transparent_1px)] bg-[size:4px_4px]" />
              
              <div className="mt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-black">{activeCampaigns}</span>
                </div>
                <p className="text-black/60 text-sm mt-2">Total active Campaign</p>
              </div>
              
              {/* Progress indicators */}
              <div className="flex gap-3 mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-8 h-1 bg-black/20 rounded-full" />
                  <span className="text-black/60 text-xs">30%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-1 bg-black rounded-full" />
                  <span className="text-black text-xs font-medium">40%</span>
                </div>
              </div>
            </motion.div>

            {/* Weekly Engagement Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-12 md:col-span-4 lg:col-span-3 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm font-medium">Weekly Engagement</span>
                <div className="flex items-center gap-1 text-white/60">
                  <span className="text-xs">0</span>
                </div>
              </div>
              
              {/* Donut Chart */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={40}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white/60">0</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span className="text-xs text-white/60">Mobile App</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-white/60">Website</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <Menu className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <Calendar className="w-4 h-4" />
                </button>
                <ArrowUpRight className="w-4 h-4 text-white/40 ml-auto" />
              </div>
            </motion.div>

            {/* Campaign Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="col-span-12 lg:col-span-3 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Campaign Progress</span>
              </div>
              
              {liveStats.totalProjects > 0 ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Your Campaigns</h3>
                  
                  {/* Campaign progress - based on actual data */}
                  <div className="space-y-3 mb-4">
                    <div className="text-center py-4">
                      <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-xs">{liveStats.totalProjects} active campaign{liveStats.totalProjects !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-white/40 mb-1">No campaigns yet</h3>
                  <p className="text-xs text-white/30">Create your first project to track campaigns</p>
                </div>
              )}
            </motion.div>

            {/* Sales Trends Overview - Large Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="col-span-12 lg:col-span-6 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5"
            >
              <h3 className="text-sm font-medium text-white/60 mb-4">Sales Trends Overview</h3>
              
              {/* Area Chart */}
              <div className="h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendsData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 10 }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a1a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={ACCENT_COLOR}
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                {/* Value Indicator */}
                <div className="absolute top-0 left-1/4 bg-white text-black text-xs px-2 py-1 rounded font-medium">
                  $ 0
                </div>
              </div>

              {/* Big Stats */}
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold">$0.0K</p>
                  <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    0% Growth
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Summer Steals / Product Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="col-span-12 lg:col-span-6 space-y-4"
            >
              {/* Quick Stats - based on actual data */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Quick Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-white/40">Total Projects</p>
                    <p className="text-lg font-semibold mt-1">{liveStats.isLoading ? '...' : liveStats.totalProjects || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-white/40">Active Users</p>
                    <p className="text-lg font-semibold mt-1">{liveStats.isLoading ? '...' : liveStats.activeUsers || 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>


            {/* Live Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="col-span-12 lg:col-span-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Live Activity</h3>
                  {liveActivities.length > 0 && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {liveActivities.length === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-xs">No recent activity</p>
                  </div>
                ) : (
                  liveActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                        {activity.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-white/40">{activity.action}</span>{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[10px] text-white/30 text-center">
                  Last updated: {formatRelativeTime(liveStats.lastUpdated)}
                </p>
              </div>
            </motion.div>

            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="col-span-12 lg:col-span-8 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Recent Projects</h3>
              </div>
              
              <div className="space-y-3">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-white/40" />
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-6">
                    <FolderOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-xs">No projects yet</p>
                  </div>
                ) : (
                  recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ 
                                width: `${project.progress}%`,
                                backgroundColor: ACCENT_COLOR
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-white/40">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/40">
                        <Users className="w-3 h-3" />
                        {project.team}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/30" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Tasks Due Today Banner */}
          {!tasksLoading && tasksDueToday > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-4 bg-gradient-to-r from-white/20 to-gray-500/20 border border-white/30 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {tasksDueToday} task{tasksDueToday !== 1 ? 's' : ''} due today
                    </h4>
                    <p className="text-white/60 text-sm mt-1">
                      Review and complete them to stay on track.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-5 py-2.5 rounded-xl font-medium text-sm"
                >
                  View Tasks
                </motion.button>
              </div>
            </motion.div>
          )}


          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Plans & Abonnements</h2>
                <p className="text-white/50 text-sm mt-1">Choisissez le plan adapté à vos besoins</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DASHBOARD_PRICING_PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-2xl p-5 ${
                      plan.popular
                        ? 'bg-gradient-to-b from-white/20 to-[#1a1a1a] border-2 border-white/50 shadow-lg shadow-white/10'
                        : 'bg-[#1a1a1a] border border-white/10'
                    }`}
                  >

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${plan.popular ? 'bg-white/20' : 'bg-white/10'}`}>
                        <Icon className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-white/70'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {plan.price === 0 ? 'Gratuit' : `€${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-white/40 text-sm">{plan.period}</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/70">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs text-white/40 pl-5">
                          +{plan.features.length - 5} fonctionnalités
                        </li>
                      )}
                    </ul>

                    {/* CTA Button - Stripe Checkout */}
                    {plan.price === 0 ? (
                      <Link
                        to="/dashboard"
                        className={`block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          plan.popular
                            ? 'bg-white text-black hover:bg-white/90'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Commencer
                      </Link>
                    ) : (
                      <button
                        onClick={() => plan.stripeUrl && handleStripeCheckout(plan.stripeUrl)}
                        disabled={!plan.stripeUrl}
                        className={`block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          plan.popular
                            ? 'bg-white text-black hover:bg-white/90'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        } ${!plan.stripeUrl ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {plan.stripeUrl ? 'Choisir' : 'Bientôt disponible'}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* My Subscription Section - Usage Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Mon Abonnement</h2>
                <p className="text-white/50 text-sm mt-1">Suivez votre consommation en temps réel</p>
              </div>
              <Link
                to="/contact"
                className="text-sm text-white hover:text-white/80 flex items-center gap-1 transition-colors"
              >
                Contact Support
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Current Plan Card */}
              <div className="bg-gradient-to-b from-white/10 to-[#1a1a1a] border border-white/30 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{planInfo.name}</h3>
                    <p className="text-xs text-white/40">
                      {planInfo.price === 0 ? 'Gratuit' : `€${planInfo.price}/mois`}
                    </p>
                  </div>
                </div>
                
                {currentPlan !== 'enterprise' && (
                  <Link
                    to="/contact"
                    className="block w-full text-center py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors mt-4"
                  >
                    Contacter Support
                  </Link>
                )}
              </div>

              {/* Usage Overview Cards */}
              <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-white/60 mb-4">Consommation</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Chat Messages */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-white" />
                        <span className="text-xs text-white/60">Chat</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {getUsageInfo.chat.formatted}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          getUsageInfo.chat.percentage >= 80 ? 'bg-red-500' : 
                          getUsageInfo.chat.percentage >= 50 ? 'bg-amber-500' : 'bg-white'
                        }`}
                        style={{ width: `${Math.min(getUsageInfo.chat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Agent AI */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-white" />
                        <span className="text-xs text-white/60">Agent AI</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {getUsageInfo.agentAI.enabled ? getUsageInfo.agentAI.formatted : 'N/A'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          !getUsageInfo.agentAI.enabled ? 'bg-white/20' :
                          getUsageInfo.agentAI.percentage >= 80 ? 'bg-red-500' : 
                          getUsageInfo.agentAI.percentage >= 50 ? 'bg-amber-500' : 'bg-white'
                        }`}
                        style={{ width: getUsageInfo.agentAI.enabled ? `${Math.min(getUsageInfo.agentAI.percentage, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Canvas Boards */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-white" />
                        <span className="text-xs text-white/60">Canvas</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {getUsageInfo.canvas.formatted}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          getUsageInfo.canvas.percentage >= 80 ? 'bg-red-500' : 
                          getUsageInfo.canvas.percentage >= 50 ? 'bg-amber-500' : 'bg-white'
                        }`}
                        style={{ width: `${Math.min(getUsageInfo.canvas.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-white" />
                        <span className="text-xs text-white/60">Projets</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {getUsageInfo.projects.formatted}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          getUsageInfo.projects.percentage >= 80 ? 'bg-red-500' : 
                          getUsageInfo.projects.percentage >= 50 ? 'bg-amber-500' : 'bg-white'
                        }`}
                        style={{ width: `${Math.min(getUsageInfo.projects.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-white" />
                        <span className="text-xs text-white/60">Stockage</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {getUsageInfo.storage.formatted}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          getUsageInfo.storage.percentage >= 80 ? 'bg-red-500' : 
                          getUsageInfo.storage.percentage >= 50 ? 'bg-amber-500' : 'bg-white'
                        }`}
                        style={{ width: `${Math.min(getUsageInfo.storage.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Workflows */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-white" />
                        <span className="text-xs text-white/60">Workflows</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {getUsageInfo.workflows.enabled ? getUsageInfo.workflows.formatted : 'N/A'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          !getUsageInfo.workflows.enabled ? 'bg-white/20' :
                          getUsageInfo.workflows.percentage >= 80 ? 'bg-red-500' : 
                          getUsageInfo.workflows.percentage >= 50 ? 'bg-amber-500' : 'bg-white'
                        }`}
                        style={{ width: getUsageInfo.workflows.enabled ? `${Math.min(getUsageInfo.workflows.percentage, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

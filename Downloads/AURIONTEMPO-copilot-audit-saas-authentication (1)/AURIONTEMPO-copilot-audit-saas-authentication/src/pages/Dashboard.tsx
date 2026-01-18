import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser, SignOutButton, UserButton } from "@clerk/clerk-react";
import { isAuthConfigured } from "@/lib/env";
import { authLogger } from "@/lib/logger";
import { 
  useLiveStats, 
  useLiveActivity, 
  useToolStatus, 
  useCurrentTime,
  useProjects,
  useTasksDueToday,
  formatRelativeTime 
} from "@/hooks/useLiveData";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Users,
  BarChart3,
  Bell,
  Search,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Menu,
  X,
  LogOut,
  Code,
  Palette,
  FileText,
  Bot,
  Activity,
  Wifi,
  WifiOff,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  PenTool,
  Layers,
  Loader2,
} from "lucide-react";

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

// Types
interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  color: string;
  href?: string;
}

// Sidebar Navigation Items
const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: FolderOpen, label: "Projects", href: "/dashboard/projects" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Users, label: "Team", href: "/dashboard/team" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

// Project status display mapping
const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  'draft': { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
  'in_progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
  'review': { label: 'Review', color: 'bg-yellow-500/20 text-yellow-400' },
  'completed': { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
};

// Quick Actions with routes
const quickActions: QuickAction[] = [
  { icon: Plus, label: "New Project", color: "bg-white text-black" },
  { icon: Code, label: "Code Editor", color: "bg-white/10 text-white", href: "/code-editor" },
  { icon: Bot, label: "AI Assistant", color: "bg-white/10 text-white", href: "/agent-ai" },
];

// Live Stat Card Component
interface LiveStatCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  index: number;
  isLive?: boolean;
}

const LiveStatCard: React.FC<LiveStatCardProps> = ({ label, value, change, trend, icon: Icon, index, isLive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors relative overflow-hidden"
  >
    {isLive && (
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] text-green-400 uppercase font-medium">Live</span>
      </div>
    )}
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 bg-white/10 rounded-xl">
        <Icon className="w-5 h-5" />
      </div>
      <div
        className={`flex items-center gap-1 text-sm ${
          trend === "up" ? "text-green-400" : "text-red-400"
        }`}
      >
        {trend === "up" ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        {change}
      </div>
    </div>
    <AnimatePresence mode="wait">
      <motion.p 
        key={value}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="text-2xl md:text-3xl font-bold mb-1"
      >
        {value}
      </motion.p>
    </AnimatePresence>
    <p className="text-white/50 text-sm">{label}</p>
  </motion.div>
);

// Project Card Component (uses DashboardProject from hook)
import type { LiveActivity, DashboardProject } from "@/hooks/useLiveData";

const ProjectCard: React.FC<{ project: DashboardProject; index: number }> = ({ project, index }) => {
  const statusInfo = STATUS_DISPLAY[project.status] || STATUS_DISPLAY['in_progress'];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/[0.07] transition-colors cursor-pointer group"
    >
      <div className="p-3 bg-white/10 rounded-xl">
        <FolderOpen className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium truncate">{project.name}</h3>
          <span className={`text-xs px-2.5 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-white/50">{project.progress}%</span>
          <div className="flex items-center gap-1 text-xs text-white/50">
            <Users className="w-3.5 h-3.5" />
            {project.team}
          </div>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
    </motion.div>
  );
};

// Live Activity Item Component
const LiveActivityItem: React.FC<{ activity: LiveActivity; index: number }> = ({ activity, index }) => (
  <motion.div
    initial={{ opacity: 0, x: 20, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="flex items-start gap-3"
    layout
  >
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
      {activity.user.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm">
        <span className="font-medium">{activity.user}</span>{" "}
        <span className="text-white/60">{activity.action}</span>{" "}
        <span className="font-medium">{activity.target}</span>
      </p>
      <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatRelativeTime(activity.timestamp)}
      </p>
    </div>
  </motion.div>
);

// Tool Status Card Component
import type { ToolStatus } from "@/hooks/useLiveData";

const ToolStatusCard: React.FC<{ tool: ToolStatus; onClick: () => void }> = ({ tool, onClick }) => {
  const Icon = TOOL_ICONS[tool.id] || Code;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.08] transition-colors w-full text-left"
    >
      <div className={`p-2 rounded-lg ${
        tool.status === 'online' ? 'bg-green-500/20' : 
        tool.status === 'offline' ? 'bg-red-500/20' : 'bg-white/10'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tool.name}</p>
        <div className="flex items-center gap-1.5">
          {tool.status === 'online' ? (
            <>
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Online</span>
            </>
          ) : tool.status === 'offline' ? (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400">Offline</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 text-white/40 animate-spin" />
              <span className="text-xs text-white/40">Checking...</span>
            </>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-white/30" />
    </motion.button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Live data hooks (connected to Supabase)
  const liveStats = useLiveStats(30000); // Update every 30 seconds
  const liveActivities = useLiveActivity(8, 45000); // Max 8 items
  const toolStatus = useToolStatus();
  const currentTime = useCurrentTime();
  const { projects: recentProjects, isLoading: projectsLoading } = useProjects(4);
  const { tasksCount: tasksDueToday, isLoading: tasksLoading } = useTasksDueToday();

  // Demo mode - no authentication

  // Get auth state with proper error handling
  const authState = useMemo(() => {
    if (!isAuthConfigured()) {
      authLogger.debug('Auth not configured, using demo mode');
      return {
        isSignedIn: false,
        isLoaded: true,
        user: null,
      };
    }
    return null;
  }, []);

  // Use Clerk hooks when available
  const clerkAuth = isAuthConfigured() ? useAuth() : null;
  const clerkUser = isAuthConfigured() ? useUser() : null;

  const isSignedIn = authState?.isSignedIn ?? clerkAuth?.isSignedIn ?? false;
  const isLoaded = authState?.isLoaded ?? clerkAuth?.isLoaded ?? true;
  const user = clerkUser?.user ?? null;

  // User info from Clerk or fallback
  const { userName, userEmail } = useMemo(() => ({
    userName: user?.firstName || user?.username || "Utilisateur",
    userEmail: user?.primaryEmailAddress?.emailAddress || "utilisateur@aurion.studio",
  }), [user]);

  // Handlers
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleToolClick = useCallback((toolId: string) => {
    const route = TOOL_ROUTES[toolId];
    if (route) {
      navigate(route);
    }
  }, [navigate]);

  // Format stats for display
  const formattedStats = useMemo(() => [
    {
      label: "Total Projects",
      value: liveStats.isLoading ? "..." : liveStats.totalProjects.toString(),
      change: liveStats.totalProjects > 0 ? "+12%" : "0%",
      trend: "up" as const,
      icon: FolderOpen,
    },
    {
      label: "Active Users",
      value: liveStats.isLoading ? "..." : liveStats.activeUsers.toLocaleString(),
      change: liveStats.activeUsers > 0 ? "+8.2%" : "0%",
      trend: "up" as const,
      icon: Users,
    },
    {
      label: "Revenue",
      value: liveStats.isLoading ? "..." : `€${(liveStats.revenue / 1000).toFixed(1)}K`,
      change: liveStats.revenue > 0 ? "+23%" : "0%",
      trend: "up" as const,
      icon: TrendingUp,
    },
    {
      label: "Tasks Completed",
      value: liveStats.isLoading ? "..." : `${liveStats.tasksCompleted}%`,
      change: liveStats.tasksCompleted > 85 ? "+2%" : liveStats.tasksCompleted > 0 ? "-2%" : "0%",
      trend: liveStats.tasksCompleted > 85 ? "up" as const : "down" as const,
      icon: CheckCircle2,
    },
  ], [liveStats]);

  // Data error state
  const hasDataError = liveStats.error !== null;

  // Online tools count
  const onlineToolsCount = useMemo(() => 
    toolStatus.filter(t => t.status === 'online').length,
  [toolStatus]);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-body text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-body">
      {/* Authentication Status Indicator */}
      {isLoaded ? (
        isSignedIn ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border-b border-green-500/30 px-4 py-2 text-center"
          >
            <p className="text-green-400 text-sm font-medium">
              ✅ Authentifié - Tableau de bord personnel de {userName}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 text-center"
          >
            <p className="text-yellow-400 text-sm font-medium">
              ⚠️ Non authentifié - Cliquez sur "Accéder à mon espace" pour vous connecter
            </p>
          </motion.div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center"
        >
          <p className="text-blue-400 text-sm font-medium">
            🔄 Chargement de l'authentification...
          </p>
        </motion.div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed top-0 left-0 h-full w-[280px] bg-neutral-950 border-r border-white/10 z-50 lg:translate-x-0 lg:z-30"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/" className="text-xl font-bold">
              aurion<span className="text-xs align-super">®</span>
            </Link>
            <button
              onClick={handleCloseSidebar}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4" aria-label="Dashboard navigation">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.active
                        ? "bg-white text-black font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                    aria-current={item.active ? "page" : undefined}
                  >
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              {isAuthConfigured() ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-white/40 truncate">{userEmail}</p>
              </div>
              {isAuthConfigured() ? (
                <SignOutButton>
                  <button
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 text-white/40 hover:text-white cursor-pointer" />
                  </button>
                </SignOutButton>
              ) : (
                <Link
                  to="/"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Return to home"
                >
                  <LogOut className="w-4 h-4 text-white/40 hover:text-white cursor-pointer" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-[280px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search projects, tasks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                  aria-label="Search"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" aria-label="New notifications" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-medium text-sm"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                New Project
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {/* Welcome Section with Live Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                  Welcome back, {userName} 👋
                </h1>
                <p className="text-white/60">
                  Here's what's happening with your projects today.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/60">
                  {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">Live</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {quickActions.map((action) => (
              action.href ? (
                <Link key={action.label} to={action.href}>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm ${action.color} transition-colors`}
                  >
                    <action.icon className="w-4 h-4" aria-hidden="true" />
                    {action.label}
                  </motion.span>
                </Link>
              ) : (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm ${action.color} transition-colors`}
                >
                  <action.icon className="w-4 h-4" aria-hidden="true" />
                  {action.label}
                </motion.button>
              )
            ))}
          </motion.div>

          {/* Database Error Banner */}
          {hasDataError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Database Not Connected</p>
                <p className="text-xs text-yellow-400/70 mt-1">
                  {liveStats.error}
                </p>
                <p className="text-xs text-white/50 mt-2">
                  To connect your database, add the following to your <code className="bg-white/10 px-1 rounded">.env</code> file:
                </p>
                <pre className="text-xs bg-black/30 rounded p-2 mt-2 overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Live Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {formattedStats.map((stat, index) => (
              <LiveStatCard 
                key={stat.label} 
                {...stat} 
                index={index}
                isLive={true}
              />
            ))}
          </motion.div>

          {/* Tools Status Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6"
            aria-labelledby="tools-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 id="tools-heading" className="text-xl font-semibold">Connected Tools</h2>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {onlineToolsCount}/{toolStatus.length} online
                </span>
              </div>
              <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {toolStatus.map((tool) => (
                <ToolStatusCard 
                  key={tool.id} 
                  tool={tool} 
                  onClick={() => handleToolClick(tool.id)}
                />
              ))}
            </div>
          </motion.section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Projects */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6"
              aria-labelledby="recent-projects-heading"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 id="recent-projects-heading" className="text-xl font-semibold">Recent Projects</h2>
                <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="space-y-4">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No projects yet</p>
                    <p className="text-white/30 text-xs mt-1">Create your first project to get started</p>
                  </div>
                ) : (
                  recentProjects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                  ))
                )}
              </div>
            </motion.section>

            {/* Live Activity Feed */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              aria-labelledby="activity-heading"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 id="activity-heading" className="text-xl font-semibold">Live Activity</h2>
                  {liveActivities.length > 0 && (
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <button className="text-sm text-white/60 hover:text-white transition-colors">
                  See all
                </button>
              </div>
              <div className="space-y-4">
                {liveActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No recent activity</p>
                    <p className="text-white/30 text-xs mt-1">Activity will appear here as you work</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {liveActivities.map((activity, index) => (
                      <LiveActivityItem 
                        key={activity.id} 
                        activity={activity} 
                        index={index} 
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 text-center">
                  Last updated: {formatRelativeTime(liveStats.lastUpdated)}
                </p>
              </div>
            </motion.section>
          </div>

          {/* Upcoming Tasks */}
          {!tasksLoading && tasksDueToday > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 rounded-2xl p-6"
              aria-labelledby="tasks-heading"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <AlertCircle className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="tasks-heading" className="text-lg font-semibold mb-1">
                      {tasksDueToday} task{tasksDueToday !== 1 ? 's' : ''} due today
                    </h3>
                    <p className="text-white/60 text-sm">
                      You have pending tasks that need your attention. Review and
                      complete them to stay on track.
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap"
                >
                  View Tasks
                </motion.button>
              </div>
            </motion.section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

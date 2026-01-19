/**
 * Live Monitoring Dashboard
 * 
 * Comprehensive monitoring system with iframe management, health checks,
 * and real-time verification of endpoints.
 * 
 * Features:
 * - Multi-iframe management with auto-refresh
 * - Health checks with latency tracking
 * - Visual alerts and status indicators
 * - Performance charts and uptime tracking
 * - Responsive grid layout
 */

import { useState, useEffect, useCallback, useReducer, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getAllMonitoredEndpoints, type ToolConfig } from "@/config/tools";
import { SEO, seoConfigs } from "@/components/common/SEO";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MonitoredEndpoint {
  id: string;
  url: string;
  name: string;
  type: 'iframe' | 'api' | 'website';
  refreshInterval: number;
  timeout: number;
  expectedStatus?: number;
  alerts: {
    email?: string;
    webhook?: string;
    sound?: boolean;
  };
}

interface HealthCheck {
  timestamp: number;
  status: 'online' | 'degraded' | 'offline';
  responseTime: number;
  httpCode?: number;
  error?: string;
}

interface EndpointMetrics {
  id: string;
  checks: HealthCheck[];
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  averageResponseTime: number;
  errorCount: number;
  lastContentHash?: string;
}

interface AlertEvent {
  id: string;
  endpointId: string;
  endpointName: string;
  type: 'down' | 'slow' | 'error' | 'content_change';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const ACCENT_COLOR = "#D4FF00";
const STATUS_COLORS = {
  online: "#22c55e",
  degraded: "#f59e0b",
  offline: "#ef4444",
};

// Generate endpoints from centralized tool configuration
const INITIAL_ENDPOINTS: MonitoredEndpoint[] = getAllMonitoredEndpoints().map(tool => ({
  id: tool.id,
  name: tool.name,
  url: tool.url,
  type: tool.type,
  refreshInterval: tool.refreshInterval,
  timeout: tool.timeout,
  expectedStatus: tool.type === 'api' ? 200 : undefined,
  alerts: tool.alerts,
}));

// ============================================================================
// State Reducer
// ============================================================================

type MonitorAction =
  | { type: 'SET_ENDPOINTS'; payload: MonitoredEndpoint[] }
  | { type: 'ADD_ENDPOINT'; payload: MonitoredEndpoint }
  | { type: 'REMOVE_ENDPOINT'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: { id: string; check: HealthCheck } }
  | { type: 'ADD_ALERT'; payload: AlertEvent }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'TOGGLE_MONITORING' }
  | { type: 'SET_SOUND_ENABLED'; payload: boolean }
  | { type: 'SET_FILTER'; payload: 'all' | 'online' | 'offline' | 'degraded' };

interface MonitorState {
  endpoints: MonitoredEndpoint[];
  metrics: Record<string, EndpointMetrics>;
  alerts: AlertEvent[];
  isMonitoring: boolean;
  soundEnabled: boolean;
  filter: 'all' | 'online' | 'offline' | 'degraded';
}

const initialState: MonitorState = {
  endpoints: INITIAL_ENDPOINTS,
  metrics: {},
  alerts: [],
  isMonitoring: true,
  soundEnabled: true,
  filter: 'all',
};

function monitorReducer(state: MonitorState, action: MonitorAction): MonitorState {
  switch (action.type) {
    case 'SET_ENDPOINTS':
      return { ...state, endpoints: action.payload };
    
    case 'ADD_ENDPOINT':
      return { ...state, endpoints: [...state.endpoints, action.payload] };
    
    case 'REMOVE_ENDPOINT':
      return {
        ...state,
        endpoints: state.endpoints.filter(e => e.id !== action.payload),
        metrics: Object.fromEntries(
          Object.entries(state.metrics).filter(([key]) => key !== action.payload)
        ),
      };
    
    case 'UPDATE_METRICS': {
      const { id, check } = action.payload;
      const existing = state.metrics[id] || {
        id,
        checks: [],
        uptime24h: 100,
        uptime7d: 100,
        uptime30d: 100,
        averageResponseTime: 0,
        errorCount: 0,
      };
      
      const newChecks = [check, ...existing.checks].slice(0, 100); // Keep last 100 checks
      const recentChecks = newChecks.slice(0, 20);
      const onlineCount = recentChecks.filter(c => c.status === 'online').length;
      const avgResponseTime = recentChecks.length > 0 
        ? recentChecks.reduce((sum, c) => sum + c.responseTime, 0) / recentChecks.length 
        : 0;
      const errorCount = newChecks.filter(c => c.status === 'offline').length;
      
      return {
        ...state,
        metrics: {
          ...state.metrics,
          [id]: {
            ...existing,
            checks: newChecks,
            uptime24h: recentChecks.length > 0 ? Math.round((onlineCount / recentChecks.length) * 100) : 100,
            averageResponseTime: Math.round(avgResponseTime),
            errorCount,
          },
        },
      };
    }
    
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts].slice(0, 50), // Keep last 50 alerts
      };
    
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.payload ? { ...a, acknowledged: true } : a
        ),
      };
    
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    
    case 'TOGGLE_MONITORING':
      return { ...state, isMonitoring: !state.isMonitoring };
    
    case 'SET_SOUND_ENABLED':
      return { ...state, soundEnabled: action.payload };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      return state;
  }
}

// ============================================================================
// Shared Audio Context for Alert Sounds
// ============================================================================

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!sharedAudioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioContext = new AudioContextClass();
      }
    } catch {
      // Audio not available
    }
  }
  return sharedAudioContext;
}

function playAlertSound(): void {
  const audioContext = getAudioContext();
  if (!audioContext) return;
  
  try {
    // Resume context if it was suspended (browsers require user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  } catch {
    // Audio playback failed
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: 'online' | 'degraded' | 'offline'): string {
  return STATUS_COLORS[status];
}

function getLatencyColor(ms: number): string {
  if (ms < 300) return STATUS_COLORS.online;
  if (ms < 1000) return STATUS_COLORS.degraded;
  return STATUS_COLORS.offline;
}

// Simple hash function for content change detection
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// ============================================================================
// Custom Hooks
// ============================================================================

function useCurrentTime() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  return time;
}

// ============================================================================
// Components
// ============================================================================

// Status Badge Component
function StatusBadge({ status }: { status: 'online' | 'degraded' | 'offline' | 'loading' }) {
  const config = {
    online: { icon: CheckCircle2, label: 'Online', color: STATUS_COLORS.online },
    degraded: { icon: AlertTriangle, label: 'Degraded', color: STATUS_COLORS.degraded },
    offline: { icon: XCircle, label: 'Offline', color: STATUS_COLORS.offline },
    loading: { icon: Loader2, label: 'Checking...', color: '#a1a1aa' },
  };
  
  const { icon: Icon, label, color } = config[status];
  
  return (
    <div className="flex items-center gap-1.5">
      <Icon 
        className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} 
        style={{ color }}
      />
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// Latency Indicator Component
function LatencyIndicator({ ms }: { ms: number }) {
  const color = getLatencyColor(ms);
  
  return (
    <div className="flex items-center gap-1">
      <Zap className="w-3 h-3" style={{ color }} />
      <span className="text-xs" style={{ color }}>{ms}ms</span>
    </div>
  );
}

// Uptime Bar Component
function UptimeBar({ percentage }: { percentage: number }) {
  const color = percentage >= 99 ? STATUS_COLORS.online 
    : percentage >= 95 ? STATUS_COLORS.degraded 
    : STATUS_COLORS.offline;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-white/60 w-12 text-right">{percentage}%</span>
    </div>
  );
}

// Endpoint Card Component
interface EndpointCardProps {
  endpoint: MonitoredEndpoint;
  metrics?: EndpointMetrics;
  latestCheck?: HealthCheck;
  onRemove: () => void;
  onExpand: () => void;
}

function EndpointCard({ endpoint, metrics, latestCheck, onRemove, onExpand }: EndpointCardProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const status = latestCheck?.status || 'loading';
  const responseTime = latestCheck?.responseTime || 0;
  const uptime = metrics?.uptime24h || 100;
  const lastCheck = latestCheck ? new Date(latestCheck.timestamp) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: getStatusColor(status === 'loading' ? 'degraded' : status) }}
          />
          <div>
            <h3 className="text-white font-medium text-sm">{endpoint.name}</h3>
            <p className="text-white/40 text-xs truncate max-w-[200px]">{endpoint.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status === 'loading' ? 'loading' : status} />
          <button
            onClick={onExpand}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative aspect-video bg-black/50">
        {endpoint.type === 'iframe' ? (
          <>
            {!iframeLoaded && !iframeError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
              </div>
            )}
            {iframeError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-sm">Failed to load iframe</p>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={endpoint.url}
                className={`w-full h-full border-0 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                onLoad={() => setIframeLoaded(true)}
                onError={() => setIframeError(true)}
                title={endpoint.name}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Globe className="w-12 h-12 text-white/20 mb-2" />
            <p className="text-white/40 text-sm">API Endpoint</p>
            <p className="text-white/60 text-xs mt-1">{endpoint.type.toUpperCase()}</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-[#141414] grid grid-cols-3 gap-4">
        <div>
          <p className="text-white/40 text-xs mb-1">Latency</p>
          <LatencyIndicator ms={responseTime} />
        </div>
        <div>
          <p className="text-white/40 text-xs mb-1">Uptime (24h)</p>
          <UptimeBar percentage={uptime} />
        </div>
        <div>
          <p className="text-white/40 text-xs mb-1">Last Check</p>
          <p className="text-white/60 text-xs">
            {lastCheck ? formatTime(lastCheck) : 'Never'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Alert Item Component
function AlertItem({ alert, onAcknowledge }: { alert: AlertEvent; onAcknowledge: () => void }) {
  const typeConfig = {
    down: { icon: XCircle, color: STATUS_COLORS.offline, bg: 'bg-red-500/10' },
    slow: { icon: AlertTriangle, color: STATUS_COLORS.degraded, bg: 'bg-yellow-500/10' },
    error: { icon: AlertCircle, color: STATUS_COLORS.offline, bg: 'bg-red-500/10' },
    content_change: { icon: Activity, color: '#3b82f6', bg: 'bg-blue-500/10' },
  };
  
  const { icon: Icon, color, bg } = typeConfig[alert.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 rounded-lg ${bg} ${alert.acknowledged ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">{alert.endpointName}</p>
          <p className="text-white/60 text-xs mt-0.5">{alert.message}</p>
          <p className="text-white/40 text-xs mt-1">
            {formatDate(new Date(alert.timestamp))}
          </p>
        </div>
        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Performance Chart Component
function PerformanceChart({ metrics, endpoints }: { metrics: Record<string, EndpointMetrics>; endpoints: MonitoredEndpoint[] }) {
  const chartData = useMemo(() => {
    const timePoints: Record<string, Record<string, string | number>> = {};
    
    endpoints.forEach(endpoint => {
      const endpointMetrics = metrics[endpoint.id];
      if (!endpointMetrics) return;
      
      endpointMetrics.checks.slice(0, 20).reverse().forEach((check, index) => {
        const timeKey = `T-${20 - index}`;
        if (!timePoints[timeKey]) {
          timePoints[timeKey] = { name: timeKey };
        }
        timePoints[timeKey][endpoint.name] = check.responseTime;
      });
    });
    
    return Object.values(timePoints);
  }, [metrics, endpoints]);
  
  const colors = ['#D4FF00', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis 
            dataKey="name" 
            stroke="#525252" 
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
          />
          <YAxis 
            stroke="#525252" 
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          {endpoints.map((endpoint, index) => (
            <Line
              key={endpoint.id}
              type="monotone"
              dataKey={endpoint.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Status Distribution Chart
function StatusDistributionChart({ metrics, endpoints }: { metrics: Record<string, EndpointMetrics>; endpoints: MonitoredEndpoint[] }) {
  const data = useMemo(() => {
    let online = 0;
    let degraded = 0;
    let offline = 0;
    
    endpoints.forEach(endpoint => {
      const latestCheck = metrics[endpoint.id]?.checks[0];
      if (!latestCheck) return;
      
      if (latestCheck.status === 'online') online++;
      else if (latestCheck.status === 'degraded') degraded++;
      else offline++;
    });
    
    return [
      { name: 'Online', value: online, color: STATUS_COLORS.online },
      { name: 'Degraded', value: degraded, color: STATUS_COLORS.degraded },
      { name: 'Offline', value: offline, color: STATUS_COLORS.offline },
    ].filter(d => d.value > 0);
  }, [metrics, endpoints]);
  
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}
          />
          <Legend 
            formatter={(value) => <span className="text-white/60 text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Uptime History Chart
function UptimeHistoryChart({ metrics, endpoints }: { metrics: Record<string, EndpointMetrics>; endpoints: MonitoredEndpoint[] }) {
  const data = useMemo(() => {
    return endpoints.map(endpoint => ({
      name: endpoint.name.substring(0, 10),
      uptime: metrics[endpoint.id]?.uptime24h || 100,
    }));
  }, [metrics, endpoints]);
  
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" domain={[0, 100]} stroke="#525252" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
          <YAxis type="category" dataKey="name" stroke="#525252" tick={{ fill: '#a1a1aa', fontSize: 10 }} width={80} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value}%`, 'Uptime']}
          />
          <Bar 
            dataKey="uptime" 
            fill={ACCENT_COLOR}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Add Endpoint Modal
interface AddEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (endpoint: MonitoredEndpoint) => void;
}

function AddEndpointModal({ isOpen, onClose, onAdd }: AddEndpointModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'iframe' | 'api' | 'website'>('website');
  const [refreshInterval, setRefreshInterval] = useState(60000);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    
    onAdd({
      id: generateId(),
      name,
      url,
      type,
      refreshInterval,
      timeout: 10000,
      alerts: { sound: true },
    });
    
    setName('');
    setUrl('');
    setType('website');
    setRefreshInterval(60000);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1a1a] rounded-xl border border-white/10 w-full max-w-md"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-semibold">Add Endpoint</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4FF00]/50"
              placeholder="My Service"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-1.5">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4FF00]/50"
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'iframe' | 'api' | 'website')}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4FF00]/50"
            >
              <option value="website">Website</option>
              <option value="iframe">Iframe</option>
              <option value="api">API</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-1.5">Refresh Interval</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4FF00]/50"
            >
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={120000}>2 minutes</option>
              <option value={300000}>5 minutes</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#D4FF00] text-black font-medium rounded-lg hover:bg-[#D4FF00]/90 transition-colors"
            >
              Add Endpoint
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Expanded Iframe Modal
function ExpandedIframeModal({ endpoint, onClose }: { endpoint: MonitoredEndpoint | null; onClose: () => void }) {
  if (!endpoint) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-white font-medium">{endpoint.name}</h3>
          <a 
            href={endpoint.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1">
        <iframe
          src={endpoint.url}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
          title={endpoint.name}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MonitoringDashboard() {
  const [state, dispatch] = useReducer(monitorReducer, initialState);
  const currentTime = useCurrentTime();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedEndpoint, setExpandedEndpoint] = useState<MonitoredEndpoint | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const checkIntervalRef = useRef<number | null>(null);
  
  // Health check function
  const performHealthCheck = useCallback(async (endpoint: MonitoredEndpoint): Promise<HealthCheck> => {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
      
      // Use no-cors mode for cross-origin requests
      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Math.round(performance.now() - startTime);
      
      // In no-cors mode, we can't read status, but if we got here the server responded
      const status: 'online' | 'degraded' | 'offline' = 
        responseTime > 2000 ? 'degraded' : 'online';
      
      return {
        timestamp: Date.now(),
        status,
        responseTime,
        // In no-cors mode, response.status is always 0, so we indicate unknown
        httpCode: undefined,
      };
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      
      // AbortError means timeout
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          timestamp: Date.now(),
          status: 'offline',
          responseTime: endpoint.timeout,
          error: 'Request timed out',
        };
      }
      
      // For CORS errors, the request likely reached the server
      // so we can consider it online if it responded quickly
      if (responseTime < 1000) {
        return {
          timestamp: Date.now(),
          status: 'online',
          responseTime,
        };
      }
      
      return {
        timestamp: Date.now(),
        status: 'degraded',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);
  
  // Check all endpoints
  const checkAllEndpoints = useCallback(async () => {
    if (!state.isMonitoring) return;
    
    const results = await Promise.all(
      state.endpoints.map(async (endpoint) => {
        const check = await performHealthCheck(endpoint);
        return { endpoint, check };
      })
    );
    
    results.forEach(({ endpoint, check }) => {
      dispatch({ type: 'UPDATE_METRICS', payload: { id: endpoint.id, check } });
      
      // Check for alerts
      const prevCheck = state.metrics[endpoint.id]?.checks[0];
      
      // Alert if endpoint went down
      if (check.status === 'offline' && prevCheck?.status !== 'offline') {
        const alert: AlertEvent = {
          id: generateId(),
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          type: 'down',
          message: `Endpoint is not responding${check.error ? `: ${check.error}` : ''}`,
          timestamp: Date.now(),
          acknowledged: false,
        };
        dispatch({ type: 'ADD_ALERT', payload: alert });
        
        // Play sound if enabled
        if (state.soundEnabled && endpoint.alerts.sound) {
          playAlertSound();
        }
      }
      
      // Alert if slow
      if (check.status === 'degraded' && check.responseTime > 2000) {
        const alert: AlertEvent = {
          id: generateId(),
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          type: 'slow',
          message: `Response time is ${check.responseTime}ms`,
          timestamp: Date.now(),
          acknowledged: false,
        };
        dispatch({ type: 'ADD_ALERT', payload: alert });
      }
    });
  }, [state.isMonitoring, state.endpoints, state.metrics, state.soundEnabled, performHealthCheck]);
  
  // Start health checks
  useEffect(() => {
    // Initial check
    checkAllEndpoints();
    
    // Set up interval
    checkIntervalRef.current = window.setInterval(checkAllEndpoints, 30000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkAllEndpoints]);
  
  // Filter endpoints based on status
  const filteredEndpoints = useMemo(() => {
    if (state.filter === 'all') return state.endpoints;
    
    return state.endpoints.filter(endpoint => {
      const latestCheck = state.metrics[endpoint.id]?.checks[0];
      if (!latestCheck) return state.filter === 'all';
      return latestCheck.status === state.filter;
    });
  }, [state.endpoints, state.metrics, state.filter]);
  
  // Calculate summary stats
  const summary = useMemo(() => {
    const total = state.endpoints.length;
    let online = 0;
    let degraded = 0;
    let offline = 0;
    let totalResponseTime = 0;
    let responseCount = 0;
    
    state.endpoints.forEach(endpoint => {
      const latestCheck = state.metrics[endpoint.id]?.checks[0];
      if (latestCheck) {
        if (latestCheck.status === 'online') online++;
        else if (latestCheck.status === 'degraded') degraded++;
        else offline++;
        totalResponseTime += latestCheck.responseTime;
        responseCount++;
      }
    });
    
    return {
      total,
      online,
      degraded,
      offline,
      avgResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
    };
  }, [state.endpoints, state.metrics]);
  
  const unacknowledgedAlerts = state.alerts.filter(a => !a.acknowledged).length;
  
  return (
    <>
      <SEO {...seoConfigs.monitoring} />
      <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Activity className="w-6 h-6" style={{ color: ACCENT_COLOR }} />
              <span className="font-bold text-lg">Monitoring</span>
            </Link>
            
            {/* Live Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-sm font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {(['all', 'online', 'degraded', 'offline'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: filter })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    state.filter === filter
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Monitoring Toggle */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_MONITORING' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                state.isMonitoring
                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {state.isMonitoring ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Resume</span>
                </>
              )}
            </button>
            
            {/* Sound Toggle */}
            <button
              onClick={() => dispatch({ type: 'SET_SOUND_ENABLED', payload: !state.soundEnabled })}
              className={`p-2 rounded-lg transition-colors ${
                state.soundEnabled
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              {state.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            {/* Alerts */}
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unacknowledgedAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
                  {unacknowledgedAlerts}
                </span>
              )}
            </button>
            
            {/* Add Endpoint */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: ACCENT_COLOR, color: '#000' }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
            
            {/* Manual Refresh */}
            <button
              onClick={checkAllEndpoints}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 p-6 ${showAlerts ? 'mr-80' : ''}`}>
          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <p className="text-white/40 text-xs mb-1">Total Endpoints</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <p className="text-white/40 text-xs mb-1">Online</p>
              <p className="text-2xl font-bold" style={{ color: STATUS_COLORS.online }}>
                {summary.online}
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <p className="text-white/40 text-xs mb-1">Degraded</p>
              <p className="text-2xl font-bold" style={{ color: STATUS_COLORS.degraded }}>
                {summary.degraded}
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <p className="text-white/40 text-xs mb-1">Offline</p>
              <p className="text-2xl font-bold" style={{ color: STATUS_COLORS.offline }}>
                {summary.offline}
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <p className="text-white/40 text-xs mb-1">Avg Response</p>
              <p className="text-2xl font-bold">{summary.avgResponseTime}ms</p>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-medium text-sm mb-4">Response Time Over Time</h3>
              <PerformanceChart metrics={state.metrics} endpoints={state.endpoints} />
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-medium text-sm mb-4">Status Distribution</h3>
              <StatusDistributionChart metrics={state.metrics} endpoints={state.endpoints} />
            </div>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-medium text-sm mb-4">Uptime (24h)</h3>
              <UptimeHistoryChart metrics={state.metrics} endpoints={state.endpoints} />
            </div>
          </div>
          
          {/* Endpoints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredEndpoints.map((endpoint) => (
                <EndpointCard
                  key={endpoint.id}
                  endpoint={endpoint}
                  metrics={state.metrics[endpoint.id]}
                  latestCheck={state.metrics[endpoint.id]?.checks[0]}
                  onRemove={() => dispatch({ type: 'REMOVE_ENDPOINT', payload: endpoint.id })}
                  onExpand={() => setExpandedEndpoint(endpoint)}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {filteredEndpoints.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/40">No endpoints match the current filter</p>
            </div>
          )}
        </main>
        
        {/* Alerts Sidebar */}
        <AnimatePresence>
          {showAlerts && (
            <motion.aside
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              className="fixed right-0 top-[73px] bottom-0 w-80 bg-[#141414] border-l border-white/10 overflow-y-auto"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#141414]">
                <h3 className="font-medium">Alerts</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_ALERTS' })}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className="p-1 text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {state.alerts.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-8">No alerts</p>
                  ) : (
                    state.alerts.map((alert) => (
                      <AlertItem
                        key={alert.id}
                        alert={alert}
                        onAcknowledge={() => dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alert.id })}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <AddEndpointModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(endpoint) => dispatch({ type: 'ADD_ENDPOINT', payload: endpoint })}
      />
      
      <AnimatePresence>
        {expandedEndpoint && (
          <ExpandedIframeModal
            endpoint={expandedEndpoint}
            onClose={() => setExpandedEndpoint(null)}
          />
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

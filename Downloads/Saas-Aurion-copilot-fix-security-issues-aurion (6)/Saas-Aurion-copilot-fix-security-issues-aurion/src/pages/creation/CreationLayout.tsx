/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { Suspense, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Search, 
  PlusSquare, 
  PenTool, 
  Image as ImageIcon, 
  ChevronDown, 
  Settings, 
  HelpCircle, 
  Bell, 
  Users, 
  ArrowLeft,
  Loader2,
  Video,
  FolderOpen,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-extended-data";
import type { Project } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";

const SidebarItem = ({ icon: Icon, label, active, onClick, hasSubmenu }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
      active ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span>{label}</span>
    </div>
    {hasSubmenu && <ChevronDown size={14} className="text-gray-400" />}
  </button>
);

const ProjectItem = ({ id, title, type }: { id: string, title: string, type?: Project['type'] }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(`/dashboard/project/${id}`)}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-black cursor-pointer group transition-colors text-left"
    >
      <FolderOpen size={14} className="text-gray-400" />
      <span className="truncate">{title}</span>
    </button>
  );
};

export default function CreationLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: projects } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen bg-[#F5F5F5] p-2 md:p-6 font-sans text-[#1A1A1A] flex items-center justify-center overflow-hidden">
      {/* Main Container */}
      <div className="flex w-full h-full bg-white rounded-2xl md:rounded-[24px] shadow-xl relative overflow-hidden ring-1 ring-black/5">
        
        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 bg-black rounded-full" />
            <span className="font-semibold text-lg">AURION</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
              />
              <motion.aside 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 flex flex-col p-5 shadow-2xl md:hidden"
              >
                <SidebarContent 
                  navigate={navigate} 
                  isActive={isActive} 
                  projects={projects} 
                  onClose={closeSidebar}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[260px] flex-col border-r border-gray-100 p-5 h-full bg-white flex-shrink-0">
          <SidebarContent navigate={navigate} isActive={isActive} projects={projects} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white relative overflow-hidden flex flex-col pt-14 md:pt-0">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Extracted Sidebar Content for reuse
function SidebarContent({ navigate, isActive, projects, onClose }: any) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { navigate('/dashboard'); onClose?.(); }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 bg-black rounded-full" />
            <span className="font-semibold text-lg tracking-tight">AURION</span>
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center md:hidden">
            <X size={18} />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden hidden md:block">
           <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Search & New Chat */}
      <div className="space-y-3 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-gray-50 border-none rounded-lg pl-9 pr-8 py-2.5 text-sm focus:ring-1 focus:ring-black placeholder:text-gray-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hidden md:block">/</span>
        </div>
        <button 
          onClick={() => { navigate('/creation/image'); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all"
        >
          <PlusSquare size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Tools Menu */}
      <div className="space-y-1 mb-8">
        <SidebarItem 
          icon={ImageIcon} 
          label="Text to Image" 
          active={isActive("/creation/image")} 
          onClick={() => { navigate("/creation/image"); onClose?.(); }} 
        />
        <SidebarItem 
          icon={PenTool} 
          label="Sketch to Image" 
          active={isActive("/creation/sketch")} 
          onClick={() => { navigate("/creation/sketch"); onClose?.(); }} 
        />
        <SidebarItem 
          icon={Video} 
          label="Text to Video" 
          active={isActive("/creation/video")} 
          onClick={() => { navigate("/creation/video"); onClose?.(); }} 
        />
      </div>

      {/* Projects */}
      <div className="mb-8 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Project</span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
        <div className="space-y-1 pl-2 border-l border-gray-100 ml-3">
          {projects?.slice(0, 5).map((project: Project) => (
            <ProjectItem key={project.id} id={project.id} title={project.title} type={project.type} />
          ))}
          <button className="px-3 mt-2 text-xs text-gray-400 hover:text-black transition-colors text-left w-full">
            Show More (120)
          </button>
        </div>

        <div className="mt-8 px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Chat</div>
        <div className="space-y-1 pl-2 border-l border-gray-100 ml-3">
           <div className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer truncate">Project 104</div>
           <div className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer truncate">buatkan gambar orang...</div>
           <div className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer truncate">3d product design</div>
           <button className="px-3 mt-2 text-xs text-gray-400 hover:text-black transition-colors text-left w-full">
            Show More (120)
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto space-y-1 pt-4 border-t border-gray-100">
        <SidebarItem icon={Users} label="Community" onClick={() => { navigate("/creation/community"); onClose?.(); }} active={isActive("/creation/community")} />
        <SidebarItem icon={Bell} label="Notifications" onClick={() => { navigate("/creation/notifications"); onClose?.(); }} active={isActive("/creation/notifications")} />
        <SidebarItem icon={HelpCircle} label="Help" onClick={() => { navigate("/creation/help"); onClose?.(); }} active={isActive("/creation/help")} />
        <SidebarItem icon={Settings} label="Settings" onClick={() => { navigate("/creation/settings"); onClose?.(); }} active={isActive("/creation/settings")} />
      </div>
    </>
  );
}

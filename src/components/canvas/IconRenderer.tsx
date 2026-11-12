import React from 'react';
import {
  Rocket,
  ShieldCheck,
  Database,
  Users,
  GitFork,
  Cpu,
  CheckCircle2,
  Target,
  Calendar,
  TrendingUp,
  CreditCard,
  Bell,
  Search,
  Settings,
  Share2,
  Layers,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Server,
  Layout,
  Cloud,
  FileText,
  Clock,
  Compass,
  Zap,
  Globe,
  Award,
  Box,
  LucideProps
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Rocket,
  ShieldCheck,
  Database,
  Users,
  GitFork,
  Cpu,
  CheckCircle2,
  Target,
  Calendar,
  TrendingUp,
  CreditCard,
  Bell,
  Search,
  Settings,
  Share2,
  Layers,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Server,
  Layout,
  Cloud,
  FileText,
  Clock,
  Compass,
  Zap,
  Globe,
  Award,
  Box
};

interface IconRendererProps {
  name?: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name = 'Layers',
  className = 'w-4 h-4',
  size = 18
}) => {
  const Component = ICON_MAP[name] || Layers;
  return <Component className={className} size={size} />;
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);


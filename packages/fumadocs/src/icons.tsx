import {
  IconApi,
  IconCirclePlus,
  IconColorFilter,
  IconDeviceImac,
  IconFilter,
  IconGitCompare,
  IconHierarchy,
  IconList,
  IconPlayerPlay,
  IconPlus,
  IconRun,
  IconSearch,
  IconSettings,
  IconUpload,
  IconUserScreen,
} from '@tabler/icons-react';
import {
  ArrowRightLeft,
  Book,
  Bot,
  Box,
  Brain,
  Code,
  Cpu,
  Download,
  Edit,
  FileText,
  Filter,
  FolderPlus,
  GitBranch,
  Globe,
  HandMetal,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  Network,
  Package,
  PlayCircle,
  PlusCircle,
  RadioTower,
  Rocket,
  Rss,
  Search,
  Settings,
  Share2,
  Signpost,
  Sparkles,
  Upload,
  UserPlus,
  Wand,
  Zap,
} from 'lucide-react';
import { createElement } from 'react';

/**
 * Icon resolver function for Fumadocs meta.json
 * Supports both Lucide React and Tabler Icons
 */
export function resolveIcon(icon?: string) {
  if (!icon) {
    return;
  }
  switch (icon.toLowerCase()) {
    // Lucide icons
    case 'book':
      return createElement(Book, { className: 'size-4' });
    case 'rocket':
      return createElement(Rocket, { className: 'size-4' });
    case 'rss':
      return createElement(Rss, { className: 'size-4' });
    case 'bot':
      return createElement(Bot, { className: 'size-4' });
    case 'share2':
      return createElement(Share2, { className: 'size-4' });
    case 'brain':
      return createElement(Brain, { className: 'size-4' });
    case 'info':
      return createElement(Info, { className: 'size-4' });
    case 'filetext':
      return createElement(FileText, { className: 'size-4' });
    case 'userplus':
      return createElement(UserPlus, { className: 'size-4' });
    case 'folderplus':
      return createElement(FolderPlus, { className: 'size-4' });
    case 'download':
      return createElement(Download, { className: 'size-4' });
    case 'code':
      return createElement(Code, { className: 'size-4' });
    case 'hand-metal':
      return createElement(HandMetal, { className: 'size-4' });
    case 'edit':
      return createElement(Edit, { className: 'size-4' });
    case 'globe':
      return createElement(Globe, { className: 'size-4' });
    case 'lightbulb':
      return createElement(Lightbulb, { className: 'size-4' });
    case 'help-circle':
      return createElement(HelpCircle, { className: 'size-4' });
    case 'signpost':
      return createElement(Signpost, { className: 'size-4' });
    case 'arrow-right-left':
    case 'proxy':
      return createElement(ArrowRightLeft, { className: 'size-4' });
    case 'upload':
      return createElement(Upload, { className: 'size-4' });
    case 'search':
      return createElement(Search, { className: 'size-4' });
    case 'network':
      return createElement(Network, { className: 'size-4' });
    case 'filter':
      return createElement(Filter, { className: 'size-4' });
    case 'settings':
      return createElement(Settings, { className: 'size-4' });
    case 'play':
    case 'play-circle':
      return createElement(PlayCircle, { className: 'size-4' });
    case 'plus':
    case 'plus-circle':
      return createElement(PlusCircle, { className: 'size-4' });
    case 'zap':
      return createElement(Zap, { className: 'size-4' });
    case 'cube':
    case 'box':
      return createElement(Box, { className: 'size-4' });
    case 'wand':
      return createElement(Wand, { className: 'size-4' });
    case 'sparkles':
    case 'sparkle':
      return createElement(Sparkles, { className: 'size-4' });
    case 'git-branch':
    case 'branch':
      return createElement(GitBranch, { className: 'size-4' });
    case 'broadcast':
    case 'radio-tower':
      return createElement(RadioTower, { className: 'size-4' });
    case 'home':
      return createElement(Home, { className: 'size-4' });
    case 'package':
      return createElement(Package, { className: 'size-4' });
    case 'cpu':
      return createElement(Cpu, { className: 'size-4' });

    // Tabler icons
    case 'api':
      return createElement(IconApi, { className: 'size-4' });
    case 'color-filter':
      return createElement(IconColorFilter, { className: 'size-4' });
    case 'user-screen':
      return createElement(IconUserScreen, { className: 'size-4' });
    case 'run':
      return createElement(IconRun, { className: 'size-4' });
    case 'upload-tabler':
      return createElement(IconUpload, { className: 'size-4' });
    case 'search-tabler':
      return createElement(IconSearch, { className: 'size-4' });
    case 'hierarchy':
    case 'graph':
      return createElement(IconHierarchy, { className: 'size-4' });
    case 'filter-tabler':
      return createElement(IconFilter, { className: 'size-4' });
    case 'settings-tabler':
    case 'cog':
      return createElement(IconSettings, { className: 'size-4' });
    case 'play-tabler':
    case 'player-play':
      return createElement(IconPlayerPlay, { className: 'size-4' });
    case 'plus-tabler':
      return createElement(IconPlus, { className: 'size-4' });
    case 'circle-plus-tabler':
      return createElement(IconCirclePlus, { className: 'size-4' });
    case 'list':
    case 'list-settings':
      return createElement(IconList, { className: 'size-4' });
    case 'git-compare':
    case 'compare':
      return createElement(IconGitCompare, { className: 'size-4' });
    case 'device-imac':
    case 'imac':
    case 'user-interface':
      return createElement(IconDeviceImac, { className: 'size-4' });

    default:
      return;
  }
}

import { IconApi, IconRun, IconUserScreen } from '@tabler/icons-react';
import {
  Book,
  Bot,
  Brain,
  Code,
  Download,
  Edit,
  FileText,
  FolderPlus,
  Globe,
  HandMetal,
  HelpCircle,
  Info,
  Lightbulb,
  Rocket,
  Rss,
  Share2,
  UserPlus,
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

    // Tabler icons
    case 'api':
      return createElement(IconApi, { className: 'size-4' });
    case 'user-screen':
      return createElement(IconUserScreen, { className: 'size-4' });
    case 'run':
      return createElement(IconRun, { className: 'size-4' });

    default:
      return;
  }
}

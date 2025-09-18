import { IconApi, IconUserScreen } from "@tabler/icons-react";
import { APIPage } from "fumadocs-openapi/ui";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import {
  Card as FumadocsCard,
  Cards as FumadocsCards,
} from "fumadocs-ui/components/card";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
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
  Info,
  Lightbulb,
  Rocket,
  Share2,
  UserPlus,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { createElement } from "react";
import { AnimatedGraphExample } from "@/components/examples/graphs/AnimatedGraphExample";
import { ExampleGraphs } from "@/components/examples/graphs/ExampleGraphs";
import { FAQ } from "@/components/faq";
import { GraphView } from "@/components/graph-view";
import { openapi } from "@/lib/openapi";

// Icon resolver function (same as in lib/source.ts)
function resolveIcon(icon: string) {
  if (!icon) return;
  switch (icon.toLowerCase()) {
    // Lucide icons
    case "book":
      return createElement(Book, { className: "size-4" });
    case "rocket":
      return createElement(Rocket, { className: "size-4" });
    case "bot":
      return createElement(Bot, { className: "size-4" });
    case "share2":
      return createElement(Share2, { className: "size-4" });
    case "brain":
      return createElement(Brain, { className: "size-4" });
    case "info":
      return createElement(Info, { className: "size-4" });
    case "filetext":
      return createElement(FileText, { className: "size-4" });
    case "userplus":
      return createElement(UserPlus, { className: "size-4" });
    case "folderplus":
      return createElement(FolderPlus, { className: "size-4" });
    case "download":
      return createElement(Download, { className: "size-4" });
    case "code":
      return createElement(Code, { className: "size-4" });
    case "hand-metal":
      return createElement(HandMetal, { className: "size-4" });
    case "edit":
      return createElement(Edit, { className: "size-4" });
    case "globe":
      return createElement(Globe, { className: "size-4" });
    case "lightbulb":
      return createElement(Lightbulb, { className: "size-4" });

    // Tabler icons
    case "api":
      return createElement(IconApi, { className: "size-4" });
    case "user-screen":
      return createElement(IconUserScreen, { className: "size-4" });

    default:
      return;
  }
}

// Custom Card component that resolves icon strings
function Card({ icon, ...props }: any) {
  const resolvedIcon = typeof icon === "string" ? resolveIcon(icon) : icon;
  return <FumadocsCard icon={resolvedIcon} {...props} />;
}

// Custom Cards component
function Cards(props: any) {
  return <FumadocsCards {...props} />;
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    TypeTable,
    Accordion,
    Accordions,
    Card,
    Cards,
    FAQ,
    GraphView,
    ExampleGraphs,
    AnimatedGraphExample,
    APIPage: (props) => (
      <div className="fd-openapi">
        <APIPage {...openapi.getAPIPageProps(props)} />
      </div>
    ),
    img: (props) => <ImageZoom {...(props as any)} />,
    ...components,
  };
}

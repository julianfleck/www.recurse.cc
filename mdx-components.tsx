import { resolveIcon } from '@recurse/fumadocs/icons';
import { APIPage } from 'fumadocs-openapi/ui';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import {
  Card as FumadocsCard,
  Cards as FumadocsCards,
} from 'fumadocs-ui/components/card';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { AnimatedGraphExample } from '@/components/examples/graphs/AnimatedGraphExample';
import { ExampleGraphs } from '@/components/examples/graphs/ExampleGraphs';
import { FAQ } from '@/components/faq';
import { GraphView } from '@/components/graph-view';
import { openapi } from '@/lib/openapi';

// Custom Card component that resolves icon strings
function Card({ icon, ...props }: any) {
  const resolvedIcon = typeof icon === 'string' ? resolveIcon(icon) : icon;
  return <FumadocsCard icon={resolvedIcon} {...props} />;
}

// Custom Cards component
function Cards(props: any) {
  return <FumadocsCards {...props} className='hover:bg-red-200' />;
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
    APIPage: (props) => {
      try {
        const apiProps = openapi.getAPIPageProps(props);
        return (
          <div className="fd-openapi">
            <APIPage {...apiProps} />
          </div>
        );
      } catch (error) {
        // Skip API page rendering during build if OpenAPI doc is not available
        console.warn('Skipping APIPage rendering:', error);
        return (
          <div className="fd-openapi">
            <p className="text-muted-foreground">
              API documentation unavailable during build
            </p>
          </div>
        );
      }
    },
    img: (props) => <ImageZoom {...(props as any)} />,
    ...components,
  };
}

'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/animate-ui/radix/collapsible';
import { cn } from '@/utils/utils';
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockInfos,
  CodeBlockItem,
  type CodeBlockProps,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from '@/components/ui/kibo-ui/code-block';
import React, { memo } from 'react';
import type { HTMLAttributes } from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SelectCodeTheme } from '@/components/theme/select-code-theme';
import { useThemeStore } from '@/store/theme';
import { Button } from '../../button';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';

export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options['children'];
};

const languageToFileExtension: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  jsx: 'jsx',
  tsx: 'tsx',
  html: 'html',
  css: 'css',
  json: 'json',
  python: 'py',
  ruby: 'rb',
  go: 'go',
  rust: 'rs',
  java: 'java',
  csharp: 'cs',
  php: 'php',
  swift: 'swift',
  kotlin: 'kt',
  sql: 'sql',
  bash: 'sh',
  shell: 'sh',
  yaml: 'yaml',
  markdown: 'md',
  xml: 'xml',
  cpp: 'cpp',
  c: 'c',
  dart: 'dart',
  dockerfile: 'Dockerfile',
  graphql: 'graphql',
  haskell: 'hs',
  lua: 'lua',
  perl: 'pl',
  r: 'r',
  scala: 'scala',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  stylus: 'styl',
  toml: 'toml',
  vue: 'vue',
  svelte: 'svelte',
  astro: 'astro',
};

const getFilenameFromLanguage = (language: string): string => {
  const extension = languageToFileExtension[language] || language;
  return `main.${extension}`;
};

const components: Options['components'] = {
  pre: ({ node, className, children, ...props }) => {
    return <>{children}</>;
  },
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn('py-1', className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn('ml-4 list-outside list-decimal', className)} {...props}>
      {children}
    </ul>
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn('font-semibold', className)} {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn('font-medium text-primary underline', className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn('mt-6 mb-2 font-semibold text-3xl', className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2
      className={cn('mt-6 mb-2 font-semibold text-2xl', className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn('mt-6 mb-2 font-semibold text-xl', className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn('mt-6 mb-2 font-semibold text-lg', className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5
      className={cn('mt-6 mb-2 font-semibold text-base', className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn('mt-6 mb-2 font-semibold text-sm', className)} {...props}>
      {children}
    </h6>
  ),
  code: ({ node, className, children }) => {
    let language = 'typescript';

    const { theme, getTheme } = useThemeStore();
    const [open, setOpen] = React.useState(true);
    const selectedTheme = getTheme(theme);

    if (Array.isArray(node?.properties?.className)) {
      const langClass = node.properties.className
        .filter((cls): cls is string => typeof cls === 'string')
        .find(cls => cls.startsWith('language-'));

      if (langClass) {
        language = langClass.replace('language-', '');
      }
    } else if (typeof node?.properties?.className === 'string') {
      language = node.properties.className.replace('language-', '');
    }

    const isInline = !node?.position?.start.line ||
      node.position.start.line === node.position.end.line;

    if (isInline) {
      return <code className={className}>{children}</code>;
    }

    const filename = getFilenameFromLanguage(language);

    const data: CodeBlockProps['data'] = [
      {
        language,
        filename,
        code: children as string,
      },
    ];

    return (
      <CodeBlock
        className={cn('my-2', className)}
        data={data}
        defaultValue={data[0].language}
      >
        <Collapsible open={open} onOpenChange={setOpen}>
          <CodeBlockHeader className="flex rounded-md items-center bg-background justify-between relative">
            <div className="flex items-center gap-0.5">
              <CodeBlockFiles>
                {(item) => (
                  <CodeBlockFilename key={item.language} value={item.language}>
                    {item.filename}
                  </CodeBlockFilename>
                )}
              </CodeBlockFiles>
            </div>
            <div className="flex items-center gap-0.5">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-fit border-none text-xs shadow-none gap-1">
                  {open ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
                  <span className="max-md:hidden">{open ? 'Ocultar código' : 'Mostrar código'}</span>
                </Button>
              </CollapsibleTrigger>
              <SelectCodeTheme />
              <CodeBlockSelect>
                <CodeBlockSelectTrigger className="hidden">
                  <CodeBlockSelectValue />
                </CodeBlockSelectTrigger>
                <CodeBlockSelectContent>
                  {(item) => (
                    <CodeBlockSelectItem key={item.language} value={item.language}>
                      {item.language}
                    </CodeBlockSelectItem>
                  )}
                </CodeBlockSelectContent>
              </CodeBlockSelect>
              <CodeBlockCopyButton />
            </div>
          </CodeBlockHeader>
          <CollapsibleContent className="overflow-hidden">
            <CodeBlockBody>
              {(item) => (
                <CodeBlockItem key={item.language} value={item.language}>
                  <CodeBlockContent
                    language={item.language as BundledLanguage}
                    themes={selectedTheme.value}
                  >
                    {item.code}
                  </CodeBlockContent>
                </CodeBlockItem>
              )}
            </CodeBlockBody>
          </CollapsibleContent>
          {!open && (
            <div className="flex justify-center p-1 bg-background">
              <CodeBlockInfos>
                {(item) => (
                  <span key={item.language} className="flex text-sm text-muted-foreground">
                    {item.code.split('\n').length} linhas de código
                  </span>
                )}
              </CodeBlockInfos>
            </div>
          )}
        </Collapsible>
      </CodeBlock>
    );
  },
};

export const AIResponse = memo(
  ({ className, options, children, ...props }: AIResponseProps) => {
    if (!children || (typeof children === 'string' && children.trim() === '')) {
      return null
    }

    return (
      <div
        className={cn(
          '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 overflow-hidden p-1.5',
          className
        )}
        {...props}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
          {...options}
        >
          {children}
        </ReactMarkdown>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

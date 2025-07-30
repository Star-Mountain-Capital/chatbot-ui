import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  className,
}) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
        a: (props) => (
          <a
            {...props}
            className="text-primary underline hover:opacity-80"
          />
        ),
        img: (props) => (
          <img
            {...props}
            className="rounded-lg max-h-64 object-contain mx-auto"
          />
        ),
        table: (props) => (
          <div className="overflow-x-auto my-6 max-h-[400px]">
            <table
              {...props}
              className="min-w-full border-collapse bg-background border border-border rounded-lg shadow-sm"
            />
          </div>
        ),
        thead: (props) => (
          <thead
            {...props}
            className="bg-muted/80 dark:bg-muted/60"
          />
        ),
        tbody: (props) => (
          <tbody
            {...props}
            className="bg-background divide-y divide-border/50"
          />
        ),
        tr: (props) => (
          <tr
            {...props}
            className="transition-colors hover:bg-muted/30 dark:hover:bg-muted/20"
          />
        ),
        th: (props) => (
          <th
            {...props}
            className="px-6 py-3 text-left text-sm font-semibold text-foreground/90 bg-gradient-to-b from-muted/60 to-muted/80 border-r border-border/50 last:border-r-0 first:rounded-tl-lg last:rounded-tr-lg"
          />
        ),
        td: (props) => (
          <td
            {...props}
            className="px-6 py-3 text-sm text-foreground/80 border-r border-border/30 last:border-r-0 whitespace-nowrap"
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
    </div>
  );
};

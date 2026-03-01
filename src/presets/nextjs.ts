import type { Preset } from '../types.js';

export const nextjsPreset: Preset = {
  id: 'nextjs',
  name: 'Next.js',
  description: 'Next.js rules for App Router, Server Components, and API Routes',
  detect: (scan) => scan.framework === 'nextjs',
  sections: (_scan) => [
    {
      id: 'nextjs-app-router',
      title: 'Next.js App Router Conventions',
      content: `- Use the \`app/\` directory for all routes — never mix \`pages/\` and \`app/\` routers in the same project
- Every component is a **Server Component by default** — only add \`'use client'\` when the component uses browser APIs, event handlers, useState, useEffect, or other client-only hooks
- Use the correct file conventions for each route segment:
  - \`page.tsx\` — the unique UI for a route, makes the route publicly accessible
  - \`layout.tsx\` — shared UI that wraps child routes, preserves state across navigations
  - \`loading.tsx\` — instant loading UI using React Suspense, shown while route segment loads
  - \`error.tsx\` — error boundary UI for a route segment, must be a Client Component
  - \`not-found.tsx\` — UI for 404 errors within a route segment
  - \`template.tsx\` — like layout but re-mounts on navigation (use for enter/exit animations)
- Use the Metadata API for SEO — export \`metadata\` object or \`generateMetadata()\` function from \`page.tsx\` or \`layout.tsx\`, never use \`<Head>\` from next/head
- Co-locate related files (components, utils, styles) inside route folders — only \`page.tsx\` and route-level files are publicly accessible
- Place shared components in \`app/_components/\` or \`src/components/\` — prefix private folders with underscore to exclude from routing
- Use \`route.ts\` for API Route Handlers — export named functions matching HTTP methods (GET, POST, PUT, DELETE)`,
      priority: 'high',
      tags: ['nextjs', 'app-router', 'architecture', 'conventions'],
    },
    {
      id: 'nextjs-data-fetching',
      title: 'Next.js Data Fetching',
      content: `- Fetch data in **Server Components** directly using \`async/await\` — never use \`useEffect\` + \`useState\` for data that can be fetched on the server
- Use the extended \`fetch()\` API with revalidation options:
  - \`fetch(url, { cache: 'force-cache' })\` — static data, cached indefinitely (default)
  - \`fetch(url, { next: { revalidate: 3600 } })\` — ISR, revalidate every hour
  - \`fetch(url, { cache: 'no-store' })\` — dynamic data, never cached
- Use **Server Actions** for data mutations — define with \`'use server'\` directive, call from Client Components via form actions or \`startTransition\`
- Deduplicate fetch requests — React and Next.js automatically deduplicate identical \`fetch()\` calls in the same render pass, so fetch where you need the data rather than passing it down
- Use \`generateStaticParams()\` for static generation of dynamic routes — replaces \`getStaticPaths\` from Pages Router
- For database queries in Server Components, call your ORM/database directly — no need for API routes when data is only used server-side
- Use \`unstable_cache()\` or \`React.cache()\` for caching non-fetch data (database queries, computations)
- Implement loading states with \`loading.tsx\` or wrap components in \`<Suspense>\` with meaningful fallbacks
- Use \`revalidatePath()\` or \`revalidateTag()\` in Server Actions after mutations to invalidate cached data`,
      priority: 'high',
      tags: ['nextjs', 'data-fetching', 'server-components', 'caching'],
    },
    {
      id: 'nextjs-routing',
      title: 'Next.js Routing Patterns',
      content: `- Use **file-based routing** — each folder in \`app/\` represents a route segment, \`page.tsx\` makes it accessible
- Create dynamic routes with bracket notation: \`app/posts/[slug]/page.tsx\` — access params via the \`params\` prop
- Use **catch-all routes** with \`[...slug]\` for variable-depth paths, and **optional catch-all** with \`[[...slug]]\` for including the parent route
- Organize routes with **route groups** using parentheses: \`app/(marketing)/about/page.tsx\` — groups routes without affecting the URL path, useful for applying different layouts
- Use **parallel routes** with \`@slot\` convention for rendering multiple pages simultaneously in the same layout: \`app/@dashboard/page.tsx\` and \`app/@analytics/page.tsx\`
- Use **intercepting routes** with \`(..)photo\` convention for modal patterns — show content in a modal on soft navigation while keeping the full-page view on hard navigation
- Prefer \`<Link href="/path">\` over \`useRouter().push()\` for navigation — Link prefetches by default and is more performant
- Use \`usePathname()\` to read the current path, \`useSearchParams()\` for query parameters, and \`useRouter()\` only for programmatic navigation in event handlers
- Handle redirects with \`redirect()\` in Server Components or \`next.config.js\` redirects array for permanent redirects
- Use middleware (\`middleware.ts\` at project root) for request-level logic like authentication, i18n, or A/B testing`,
      priority: 'medium',
      tags: ['nextjs', 'routing', 'navigation', 'architecture'],
    },
    {
      id: 'nextjs-performance',
      title: 'Next.js Performance Optimization',
      content: `- Use \`next/image\` for all images — provides automatic resizing, lazy loading, WebP/AVIF conversion, and prevents Cumulative Layout Shift (CLS)
  - Always specify \`width\` and \`height\` or use \`fill\` prop with a sized parent container
  - Use \`priority\` prop for above-the-fold images (LCP candidates)
  - Prefer \`sizes\` prop to serve correctly sized images for responsive layouts
- Use \`next/font\` for font loading — automatically self-hosts fonts, eliminates external network requests, and prevents FOUT/FOIT
  - Import fonts at the layout level: \`const inter = Inter({ subsets: ['latin'] })\`
  - Apply via \`className\` on the body or wrapper element
- Use \`next/script\` for third-party scripts with appropriate loading strategy:
  - \`strategy="afterInteractive"\` — default, loads after page becomes interactive
  - \`strategy="lazyOnload"\` — loads during idle time, for low-priority scripts
  - \`strategy="beforeInteractive"\` — only for critical scripts that must load before hydration
- Use \`next/dynamic\` for lazy-loading heavy components — equivalent to React.lazy + Suspense but works with SSR
  - \`const Chart = dynamic(() => import('./Chart'), { ssr: false })\` — for client-only components
  - Provide a \`loading\` component for better UX during chunk loading
- Minimize \`'use client'\` boundaries — push them as far down the component tree as possible to maximize Server Component rendering
- Use route segment config for caching control: \`export const dynamic = 'force-static'\` or \`export const revalidate = 3600\`
- Implement \`<Suspense>\` boundaries strategically to enable streaming SSR and progressive page loading`,
      priority: 'medium',
      tags: ['nextjs', 'performance', 'optimization', 'images', 'fonts'],
    },
  ],
};

import type { Preset } from '../types.js';

export const reactPreset: Preset = {
  id: 'react',
  name: 'React',
  description: 'React rules for hooks, component patterns, and state management',
  detect: (scan) => scan.framework === 'react' || scan.dependencies['react'] !== undefined,
  sections: (_scan) => [
    {
      id: 'react-components',
      title: 'React Component Best Practices',
      content: `- Use **functional components** exclusively — never use class components for new code
- Prefer **named exports** over default exports for better refactoring support and auto-imports: \`export function UserProfile() {}\` instead of \`export default function() {}\`
- Define the **Props interface directly above** the component declaration, using descriptive names:
  \`\`\`
  interface UserCardProps {
    user: User;
    onSelect: (id: string) => void;
    variant?: 'compact' | 'full';
  }
  export function UserCard({ user, onSelect, variant = 'full' }: UserCardProps) {}
  \`\`\`
- Prefer **composition over inheritance** — build complex UIs by combining small, focused components rather than extending base components
- Keep components small and focused — a component should ideally do **one thing**. If a component exceeds ~150 lines, extract sub-components or custom hooks
- Use \`children\` prop and render slots for flexible component composition instead of adding many boolean flags or config props
- Destructure props in the function signature for clarity — avoid accessing \`props.x\` throughout the component
- Co-locate component files with their styles, tests, and utilities in the same directory
- Use \`React.memo()\` only when a component re-renders frequently with the same props and the render is expensive — do not wrap every component`,
      priority: 'high',
      tags: ['react', 'components', 'architecture', 'patterns'],
    },
    {
      id: 'react-hooks',
      title: 'React Hooks Guidelines',
      content: `- Follow the **Rules of Hooks** strictly — only call hooks at the top level of the component or custom hook, never inside loops, conditions, or nested functions
- Extract **custom hooks** for any shared stateful logic between components — name them \`useXxx\` (e.g., \`useAuth\`, \`useDebounce\`, \`useLocalStorage\`)
- Use \`useCallback\` only when passing callbacks to **memoized child components** or when the function is a dependency of another hook — do not wrap every function
- Use \`useMemo\` only for **computationally expensive calculations** or to maintain referential equality for objects/arrays passed to memoized children — profile before optimizing
- Prefer **derived state** (compute during render) over \`useMemo\` for simple transformations: \`const fullName = first + ' ' + last\` instead of \`useMemo(() => ...)\`
- Clean up effects properly — return a cleanup function from \`useEffect\` for subscriptions, timers, and event listeners to prevent memory leaks
- Use \`useRef\` for values that need to persist across renders without triggering re-renders (DOM refs, interval IDs, previous values)
- Avoid \`useEffect\` for transforming data or handling user events — effects are for synchronizing with external systems (APIs, DOM, subscriptions)
- Keep the dependency array of \`useEffect\` / \`useCallback\` / \`useMemo\` accurate — never suppress the exhaustive-deps ESLint rule without a documented reason
- Prefer \`useReducer\` over \`useState\` when state transitions are complex or the next state depends on the previous state`,
      priority: 'high',
      tags: ['react', 'hooks', 'state', 'performance'],
    },
    {
      id: 'react-state',
      title: 'React State Management',
      content: `- **Colocate state** — keep state as close as possible to where it is used. Start with local \`useState\`, only lift when sibling components need the same data
- **Lift state up** to the nearest common ancestor when two or more sibling components need to share state — pass it down via props
- Avoid **prop drilling** beyond 2 levels — if you need to pass state through intermediate components that do not use it, refactor using Context, composition, or a state library
- Use **React Context** for global UI state that changes infrequently (theme, locale, auth status) — do not use Context for frequently updating state as it triggers re-renders in all consumers
- Split contexts by domain — create separate contexts for auth, theme, and feature flags instead of a single global context
- Use an **external state library** (Zustand, Jotai, Redux Toolkit) for complex client-side state with frequent updates, computed values, or state shared across distant components
- Keep **server state** separate from client state — use TanStack Query (React Query) or SWR for fetching, caching, and synchronizing server data instead of manual \`useEffect\` + \`useState\`
- Initialize state with a function for expensive computations: \`useState(() => computeExpensiveInitialValue())\` — the function only runs on the first render
- Use the **updater function form** of setState when the new state depends on the previous state: \`setCount(prev => prev + 1)\` instead of \`setCount(count + 1)\`
- Never mutate state directly — always create new objects/arrays: \`setItems(prev => [...prev, newItem])\` or use Immer for deeply nested updates`,
      priority: 'medium',
      tags: ['react', 'state-management', 'context', 'performance'],
    },
    {
      id: 'react-patterns',
      title: 'React Advanced Patterns',
      content: `- Implement **Error Boundaries** to catch rendering errors in component subtrees — wrap critical sections of the UI so a single component failure does not crash the entire app
  - Use \`react-error-boundary\` package or create a class component with \`componentDidCatch\` and \`getDerivedStateFromError\`
  - Provide a meaningful fallback UI with a retry button: \`<ErrorBoundary fallback={<ErrorFallback />}>\`
- Use **React Suspense** for async data loading — wrap components that fetch data in \`<Suspense fallback={<Skeleton />}>\` to show loading states declaratively
- Use the **Compound Components** pattern for components with shared implicit state (e.g., Tabs, Accordion, Dropdown):
  \`\`\`
  <Select>
    <Select.Trigger />
    <Select.Options>
      <Select.Option value="a">Option A</Select.Option>
    </Select.Options>
  </Select>
  \`\`\`
- Use **Render Props** or the \`children\` as a function pattern when components need to share dynamic render logic — prefer hooks for logic reuse, render props for render customization
- Apply the **Container/Presentational** split when components mix data fetching with UI — keep presentational components pure and stateless, let containers handle logic
- Use **forwardRef** when creating reusable input components, buttons, or any component that needs to expose its underlying DOM element to parent components
- Implement the **Controlled Component** pattern for form elements — always pair \`value\` with \`onChange\`, use controlled inputs for form validation and conditional logic
- Use **portals** (\`createPortal\`) for modals, tooltips, and dropdowns that need to escape their parent's CSS stacking context or overflow constraints`,
      priority: 'medium',
      tags: ['react', 'patterns', 'error-handling', 'composition'],
    },
  ],
};

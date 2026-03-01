import type { Preset } from '../types.js';

export const vuePreset: Preset = {
  id: 'vue',
  name: 'Vue',
  description: 'Vue 3 rules for Composition API, SFC, and reactivity',
  detect: (scan) => scan.framework === 'vue' || scan.dependencies['vue'] !== undefined,
  sections: (_scan) => [
    {
      id: 'vue-composition',
      title: 'Vue Composition API',
      content: `- Use the **Composition API** with \`<script setup>\` syntax for all new components — it provides better TypeScript inference, less boilerplate, and improved code organization
- Use \`ref()\` for **primitive values** (strings, numbers, booleans) and single DOM element references — access the value with \`.value\` in script, automatically unwrapped in templates
- Use \`reactive()\` for **objects and complex state** — provides deep reactivity without needing \`.value\`, but do not destructure reactive objects as it breaks reactivity
- Use \`computed()\` for **derived state** — computed properties are cached and only re-evaluate when their reactive dependencies change. Always prefer computed over methods for derived values in templates
- Use \`watch()\` for **reacting to specific reactive state changes** — specify exact sources to watch and access both old and new values:
  \`\`\`
  watch(userId, async (newId, oldId) => {
    userData.value = await fetchUser(newId);
  });
  \`\`\`
- Use \`watchEffect()\` for side effects that should run immediately and re-run when **any** reactive dependency changes — useful for syncing with external systems or logging
- Use \`toRef()\` and \`toRefs()\` when passing reactive object properties to composables or child components to maintain reactivity
- Organize code by **logical concern** within \`<script setup>\` — group related refs, computed properties, and functions together instead of separating by API type
- Use \`shallowRef()\` or \`shallowReactive()\` for large objects where you only need to track top-level changes for performance optimization`,
      priority: 'high',
      tags: ['vue', 'composition-api', 'reactivity', 'state'],
    },
    {
      id: 'vue-components',
      title: 'Vue Single File Component Structure',
      content: `- Follow the standard **SFC structure** order: \`<script setup>\` first, then \`<template>\`, then \`<style scoped>\` — this is the recommended convention by the Vue team
- Use \`<script setup lang="ts">\` for TypeScript support — it enables type inference for props, emits, and template refs without additional configuration
- Define props with **TypeScript generics** using \`defineProps<T>()\` for full type safety:
  \`\`\`
  interface Props {
    title: string;
    count?: number;
    items: Item[];
  }
  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  });
  \`\`\`
- Define emits with **TypeScript generics** using \`defineEmits<T>()\` for type-safe event emission:
  \`\`\`
  const emit = defineEmits<{
    update: [value: string];
    delete: [id: number];
  }>();
  \`\`\`
- Always use \`<style scoped>\` to prevent style leakage between components — use \`:deep()\` selector only when you need to target child component elements
- Use \`defineExpose()\` to explicitly expose component methods or properties to parent components via template refs — only expose what is necessary
- Name components using **PascalCase** in templates and file names: \`<UserProfile />\` and \`UserProfile.vue\`
- Use \`v-model\` with \`defineModel()\` for two-way binding — replaces the manual prop + emit pattern:
  \`const modelValue = defineModel<string>()\`
- Keep templates readable — extract complex logic into computed properties or methods instead of writing inline expressions in templates`,
      priority: 'high',
      tags: ['vue', 'sfc', 'components', 'typescript'],
    },
    {
      id: 'vue-patterns',
      title: 'Vue Design Patterns',
      content: `- Extract reusable logic into **composables** (functions starting with \`use\`) — composables are the Vue equivalent of React custom hooks:
  \`\`\`
  // composables/useCounter.ts
  export function useCounter(initialValue = 0) {
    const count = ref(initialValue);
    const increment = () => count.value++;
    const decrement = () => count.value--;
    return { count, increment, decrement };
  }
  \`\`\`
- Use \`provide()\` and \`inject()\` for **dependency injection** — pass data deeply through the component tree without prop drilling. Always use InjectionKey for type safety:
  \`\`\`
  const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme');
  provide(ThemeKey, theme);
  const theme = inject(ThemeKey)!;
  \`\`\`
- Use \`<Teleport to="body">\` for rendering **modals, tooltips, and overlays** — renders the content in a different DOM location while maintaining the Vue component tree hierarchy
- Use \`<Suspense>\` for **async components** and components with async setup — provide fallback content while async dependencies resolve:
  \`\`\`
  <Suspense>
    <template #default><AsyncComponent /></template>
    <template #fallback><LoadingSpinner /></template>
  </Suspense>
  \`\`\`
- Use \`defineAsyncComponent()\` for **lazy-loading** heavy components — splits them into separate chunks and loads on demand
- Implement the **renderless component** pattern for reusable behavior that provides data via scoped slots without imposing any UI
- Use \`<KeepAlive>\` to cache component instances when switching between dynamic components — prevents re-creation and preserves state
- Prefer **named slots** over a single default slot when components need multiple customization points — use \`<template #header>\` syntax`,
      priority: 'medium',
      tags: ['vue', 'patterns', 'composables', 'architecture'],
    },
  ],
};

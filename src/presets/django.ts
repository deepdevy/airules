import type { Preset } from '../types.js';

export const djangoPreset: Preset = {
  id: 'django',
  name: 'Django',
  description: 'Django rules for models, views, templates, and admin',
  detect: (scan) => scan.framework === 'django',
  sections: (_scan) => [
    {
      id: 'django-structure',
      title: 'Django Application Structure & ORM',
      content: `- Follow the **"fat models, thin views"** principle — put business logic, validation, and complex queries in model methods and managers, keep views focused on HTTP request/response handling
- Use **app-based organization** — each Django app should represent a single, focused domain concept (e.g., \`users\`, \`orders\`, \`payments\`). Apps should be loosely coupled and independently testable
- Use **Django ORM querysets** effectively — chain filters and annotations instead of fetching all records and filtering in Python:
  \`\`\`python
  # Good: Filter at the database level
  active_users = User.objects.filter(is_active=True, created_at__gte=cutoff_date)

  # Bad: Filtering in Python
  all_users = User.objects.all()
  active_users = [u for u in all_users if u.is_active]
  \`\`\`
- Always use \`select_related()\` for **ForeignKey and OneToOneField** relationships and \`prefetch_related()\` for **ManyToManyField and reverse ForeignKey** relationships to prevent N+1 query problems:
  \`\`\`python
  # Prevents N+1: loads author in the same SQL query
  posts = Post.objects.select_related('author').filter(published=True)

  # Prevents N+1: prefetches tags in a second query
  posts = Post.objects.prefetch_related('tags').all()
  \`\`\`
- Use **signals sparingly** — prefer explicit method calls over signals (\`post_save\`, \`pre_save\`). Signals make code flow harder to trace and debug. Only use them for truly decoupled cross-app communication
- Create **custom managers** for commonly used querysets — define a manager with reusable query methods instead of repeating complex filters across views:
  \`\`\`python
  class PublishedManager(models.Manager):
      def get_queryset(self):
          return super().get_queryset().filter(status='published')
  \`\`\`
- Use **database indexes** on fields frequently used in filters and ordering — add \`db_index=True\` or use \`Meta.indexes\` for composite indexes`,
      priority: 'high',
      tags: ['django', 'models', 'orm', 'architecture', 'queries'],
    },
    {
      id: 'django-patterns',
      title: 'Django Views & Design Patterns',
      content: `- Use **Class-Based Views (CBVs)** for standard CRUD operations — \`ListView\`, \`DetailView\`, \`CreateView\`, \`UpdateView\`, \`DeleteView\` handle common patterns with minimal code:
  \`\`\`python
  class PostListView(LoginRequiredMixin, ListView):
      model = Post
      template_name = 'posts/list.html'
      paginate_by = 20
      ordering = ['-created_at']

      def get_queryset(self):
          return super().get_queryset().select_related('author')
  \`\`\`
- Use **Function-Based Views (FBVs)** for custom logic that does not fit standard CRUD patterns — complex workflows, multiple model operations, or conditional logic are often clearer as functions
- Use **middleware** for cross-cutting concerns that apply to all or most requests — authentication, logging, request timing, header injection. Keep middleware lightweight and fast
- Use **Django Forms** for all input validation — even for API endpoints, forms provide consistent validation, error handling, and security (CSRF, field sanitization):
  \`\`\`python
  class PostForm(forms.ModelForm):
      class Meta:
          model = Post
          fields = ['title', 'content', 'category']

      def clean_title(self):
          title = self.cleaned_data['title']
          if Post.objects.filter(title=title).exists():
              raise ValidationError("A post with this title already exists.")
          return title
  \`\`\`
- Use **custom model managers** for query encapsulation — define frequently used filters as manager methods: \`Post.published.recent()\` instead of repeating \`.filter(status='published').order_by('-created_at')\` everywhere
- Use **Django REST Framework** (DRF) for building APIs — use Serializers for validation and transformation, ViewSets for CRUD, and Routers for URL configuration
- Apply **pagination** to all list views and API endpoints — never return unbounded querysets. Use Django's built-in paginator or DRF pagination classes`,
      priority: 'high',
      tags: ['django', 'views', 'patterns', 'forms', 'middleware'],
    },
    {
      id: 'django-security',
      title: 'Django Security Best Practices',
      content: `- Keep **CSRF protection enabled** — never disable Django's CSRF middleware globally. Use \`@csrf_exempt\` only on webhooks or API endpoints that use token authentication instead
- Use \`@login_required\` decorator for **function-based views** and \`LoginRequiredMixin\` for **class-based views** on all endpoints that require authentication — always check permissions explicitly
- Never use **raw SQL queries** unless absolutely necessary — when you must, always use parameterized queries to prevent SQL injection:
  \`\`\`python
  # Safe: parameterized query
  User.objects.raw('SELECT * FROM users WHERE email = %s', [email])

  # DANGEROUS: string interpolation — vulnerable to SQL injection
  User.objects.raw(f'SELECT * FROM users WHERE email = "{email}"')
  \`\`\`
- Always use the **ORM for database operations** — it automatically parameterizes queries and escapes values, preventing SQL injection by default
- Configure **ALLOWED_HOSTS** explicitly in production — never use \`['*']\`. List your exact domain names and IP addresses
- Set security-related settings in production:
  - \`SECURE_SSL_REDIRECT = True\` — redirect HTTP to HTTPS
  - \`SESSION_COOKIE_SECURE = True\` — only send cookies over HTTPS
  - \`CSRF_COOKIE_SECURE = True\` — only send CSRF cookie over HTTPS
  - \`SECURE_HSTS_SECONDS = 31536000\` — enable HSTS
  - \`SECURE_CONTENT_TYPE_NOSNIFF = True\` — prevent MIME-type sniffing
- Use Django's **password hashing** — never store passwords in plaintext. Django uses PBKDF2 by default, upgrade to Argon2 with \`django-argon2-hasher\` for better security
- Validate **file uploads** — check file size, extension, and MIME type. Store uploaded files outside the web root and serve through Django, never directly
- Use **permissions and groups** for authorization — define custom permissions on models and check with \`has_perm()\` instead of hardcoding role checks`,
      priority: 'medium',
      tags: ['django', 'security', 'csrf', 'authentication', 'sql-injection'],
    },
  ],
};

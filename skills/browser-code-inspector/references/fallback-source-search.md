# Fallback When Metadata Is Missing

This fallback is for diagnosis only. It cannot guarantee the exact source line
that `code-inspector-plugin` provides in a development build.

Search signals in this order:

1. `data-testid`, `data-component`, `data-source`, and other project-specific
   `data-*` attributes.
2. A unique element `id`.
3. Project-specific CSS classes, excluding generic utility classes.
4. Component name from framework development tools.
5. Unique visible text, ARIA labels, or a short outerHTML fragment.

Cross-check at least two independent signals before opening a file. For a Vue
page, inspect the matching template block rather than opening the first file
that contains a shared label. For a React page, distinguish the component
definition from a wrapper that only renders it.

If signals disagree, report the top candidates and stop. Do not call the result
an exact line/column mapping, and do not silently modify the project to add a
test id just for one inspection.

# AGENTS.md — KOP Repository Guide

## Project overview

This repository contains the KOP web application. The active application is under
`frontend/`.

Current frontend stack:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router

Most form operations are not connected to a production backend yet. The current
implementation uses asynchronous mock API modules and localStorage-style mock
persistence. Do not invent backend URLs, request contracts, or authentication
flows unless the user explicitly asks for them. Keep backend-facing code behind
the existing API/mock boundaries so it can be replaced later.

The user-facing UI uses Greek labels. Preserve Greek wording, accents, casing,
and UTF-8 encoding. Important terms include:

- `Υπόδειγμα`
- `Μονάδα`
- `Μοίρα`
- `Έτος`
- `Προσωρινή Αποθήκευση`
- `Οριστική Υποβολή`
- `Επιστροφή για Διόρθωση`
- `Οι Υποβολές μου`

Do not transliterate Greek UI text or replace it with English unless explicitly
requested.

## Commands

Run frontend commands from `frontend/`:

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

`npm run build` runs TypeScript project compilation before the Vite production
build. There is currently no automated test script in `package.json`.

## Repository layout

Important frontend paths:

```text
frontend/src/
  App.tsx
  components/
    Navbar.tsx
    DropdownMenu.tsx
    Footer.tsx
  pages/
    Dashboard.tsx
    MySubmissions.tsx
  features/forms/
    DynamicForm.tsx
    shared/
    ypodeigma1/
    ypodeigma2/
    ypodeigma3/
    ypodeigma4/
    ypodeigma5/
    ypodeigma6/
    prosopiko/
```

Keep each implemented form in its own feature folder. A feature commonly
contains:

- `types.ts` for domain, config, row, action, and save request types.
- `mock...Api.ts` for backend-shaped mock data retrieval.
- An API adapter such as `ypodeigma3Api.ts` when save behavior is mocked.
- `helpers.ts` for calculations, hierarchy rules, parsing, and formatting.
- A payload builder when payload construction is substantial.
- One top-level form component and optional table components.

Do not move files between features or create shared abstractions merely because
two tables currently look similar. Share code only when the domain behavior is
truly common and the change is requested.

## Routing and navigation

`App.tsx` owns the top-level routes and local mock authentication. The current
dashboard routes include:

- `/dashboard/ypologismos`
- `/dashboard/my-submissions`
- `/dashboard/ypodeigma/:id`

`Dashboard.tsx` owns the dashboard shell, navbar integration, route transitions,
and the unsaved-change navigation dialog. `Navbar.tsx` and `DropdownMenu.tsx`
must continue to use the existing routes and tab callbacks.

Implemented numeric form IDs currently include `1` through `6`. Personnel is a
separate form feature exposed as ID `22` and labeled `ΠΡΟΣΩΠΙΚΟ`. Other menu IDs
may exist as placeholders. Do not infer business behavior for an unimplemented
ID.

After save or submission, navigation to `Οι Υποβολές μου` uses route state for
temporary flash messages. `MySubmissions.tsx` clears that state after displaying
it so refresh/back navigation does not replay the message.

## Shared form architecture

### DynamicForm

`features/forms/DynamicForm.tsx` is the current orchestration layer. It:

- Loads the shared year, unit, and squadron options.
- Maintains draft control selections separately from applied selections.
- Renders the active form based on its numeric ID.
- Registers the active form's draft, final-submit, and admin-return actions.
- Coordinates role and editability rules.
- Connects dirty-state tracking to the unsaved-change guard.
- Navigates to `MySubmissions` after successful actions.
- Supplies success or error messages to the shared UI.

Do not add form-specific calculations or table JSX to `DynamicForm`. Keep those
inside the corresponding feature.

When adding an action callback, preserve function identity with `useCallback`
where needed. Register actions in an effect and unregister them during cleanup.
Avoid render/effect loops caused by creating a new registered action object on
every render.

### Controls

`features/forms/shared/YpodeigmaControlsPanel.tsx` is only for:

- Existing year retrieval.
- New year creation.
- Unit selection.
- Squadron selection when the active form requires it.

Its data contracts live in `shared/types.ts`, and current options/new-year
availability are provided by `shared/mockYpodeigmaControlsApi.ts`.

The applied form data must change when the user confirms retrieval/start, not
merely when a dropdown's draft value changes. Unit and squadron data are
dependent: a squadron belongs to its parent unit.

Forms `5`, `6`, and `ΠΡΟΣΩΠΙΚΟ` currently operate at unit level, so their squadron
selection is hidden by `DynamicForm`. Preserve this distinction.

### Actions

`features/forms/shared/YpodeigmaActionsPanel.tsx` is the single shared location
for workflow action buttons. Do not duplicate these buttons at the bottom of an
individual form.

Current role behavior:

- A `user` may see `Προσωρινή Αποθήκευση` and `Οριστική Υποβολή` when data is
  editable.
- An `admin` is a reviewer, does not edit form data, and may use
  `Επιστροφή για Διόρθωση`.
- Read-only completed data must remain non-editable.

The common submission statuses are:

- `pending-submission`
- `submitted`
- `returned-for-correction`

Do not rename these persistence values just to change their Greek display
labels.

### Dirty state and unsaved changes

Editable forms report changes through `onDirtyChange`. The shared
`useUnsavedStartedEtosGuard` hook coordinates pending navigation or selection
changes and offers draft save, final submit, return to editing, or continuation
without saving.

Only user edits should mark retrieved editable data dirty. Loading data,
selecting a year before retrieval, or switching from loading to ready state must
not create a false unsaved-change warning. A successful save/submit should clear
the dirty state.

Do not bypass the dashboard's registered unsaved guard when adding navigation.

## Persistence and mock APIs

Mock API functions should remain asynchronous and return typed backend-shaped
objects. Components should not contain hardcoded row datasets; put mock rows in
the feature's mock API module.

`ypodeigma2/submissionStorage.ts` currently provides the shared mock submission
list consumed by `MySubmissions.tsx`. It:

- Stores records in localStorage.
- Normalizes supported statuses.
- Treats legacy records without a status as `pending-submission`.
- Upserts records used by the submissions page.

Preserve backward compatibility when changing stored shapes. Do not clear or
rename existing localStorage keys without an explicit migration request.

Save payloads should contain stable backend identifiers, not Greek display
labels as identifiers. Keep payload construction separate from presentation
when it is non-trivial.

## Existing form features

### Υπόδειγμα 1

`ypodeigma1/` contains three table sections (1A, 1B, and 1C), backend-shaped mock
data, leaf-row editing rules, a payload builder, and shared action registration.
Selection is scoped by unit, squadron, and year.

### Υπόδειγμα 2

`ypodeigma2/` contains section 1A and 1B tables. Its schema includes dynamic:

- Analysis levels.
- Squadrons.
- ALE columns per squadron.
- Hierarchical cost rows.

Use `getAmountKey(moiraId, aleId)` for amount keys. Totals and hierarchy behavior
belong in helpers. Never hardcode ALE counts, squadron spans, Excel column
ranges, or analysis columns when the schema supplies them.

`Ypodeigma2ReviewTable.tsx` still exists, but the current main form flow renders
the section tables directly and uses the shared action panel. Verify live usage
before editing or deleting older-looking files.

### Υπόδειγμα 3

`ypodeigma3/` separates entries into 3A (`moira-af-ep`) and 3B
(`outside-moires`) scopes. It has hierarchical rows and calculated fields. In
particular, P1 is derived from SD and SA; do not make calculated fields editable
or duplicate their formulas in JSX.

### Υπόδειγμα 4

`ypodeigma4/` uses dynamic squadron columns and typed metric rows. Percentage
values and totals are calculated from the source row values. Keep generated
percentages read-only and keep dynamic spans based on the returned squadron
array.

### Υπόδειγμα 5

`ypodeigma5/` is a unit-level editable table of responsible personnel. It
supports adding/removing rows, validation, year status, and registered workflow
actions. New years start with the intended minimal empty-row state.

### Υπόδειγμα 6

`ypodeigma6/` is a unit-level editable cost table. Rows include description,
flight hours, measurement unit, quantity, squadron/type, unit cost, and notes.
Total cost is derived for the save request. Keep calculated totals out of
editable source fields.

### ΠΡΟΣΩΠΙΚΟ

`prosopiko/` is a separate feature, not part of `ypodeigma2`. It is unit-level
and supports the same shared control/action flow as the recent forms. Preserve
its classification-code autocomplete, movement/date validation, calculated
days, row editing, and backend-shaped mock data.

## Adding or changing a form

Follow this sequence:

1. Inspect the closest existing feature, but copy only patterns that match the
   new form's business rules.
2. Define domain/config/save types in the feature's `types.ts`. Do not use
   `any`.
3. Put sample records in a mock API, not directly in the component.
4. Keep calculations, parent/child detection, parsing, and payload construction
   outside large JSX blocks when practical.
5. Accept the shared applied selections (`selectedMonadaId`,
   `selectedMoiraId`, `selectedEtos`, status/source) needed by the form.
6. Derive `isEditable` from role, year status/source, and feature rules. Never
   rely on styling alone to prevent edits.
7. Report real user edits with `onDirtyChange(true)` and reset dirty state after
   load or successful persistence.
8. Register typed draft/final actions with `DynamicForm`; unregister them on
   unmount or when unavailable.
9. Validate before persistence and provide a useful error message. Final
   submission must not silently accept invalid required data.
10. Wire the form ID in `DynamicForm` and navigation only after confirming the
    existing ID scheme.
11. Persist the expected status and metadata so `MySubmissions` can categorize
    the record.
12. Run build and lint before considering the change complete.

When a table is backend-driven:

- Sort by provided `displayOrder` only when that field exists.
- Use stable record IDs as React keys.
- Calculate `colSpan`, columns, and totals from returned arrays.
- Preserve `null` for an empty numeric value when the type allows it.
- Guard number parsing against `NaN`.
- Keep parent rows read-only when only leaf rows are editable.
- Recalculate derived values from source state instead of storing competing
  copies.

## TypeScript and React conventions

- Do not use `any`.
- Use `import type` under `verbatimModuleSyntax`.
- Remove unused variables and parameters; TypeScript has
  `noUnusedLocals`/`noUnusedParameters` enabled.
- Prefer typed records and discriminated unions for statuses and row kinds.
- Keep state immutable when changing a single row or nested value.
- Use effects for external synchronization and action registration, not for
  values that can be derived during render.
- Clean up timers, subscriptions, and registered callbacks.
- Do not introduce new dependencies unless the task requires them.
- Preserve the existing React patterns; avoid broad refactors during a focused
  form change.

## UI and table conventions

The application uses compact, Excel-like tables. Preserve:

- Thin borders and aligned multi-row headers.
- Greek labels from the supplied business templates.
- Clear visual distinction between editable, calculated, disabled, and total
  cells.
- Responsive layouts appropriate to each table.
- Dynamic columns and header spans.
- Accessible buttons, labels, disabled states, and focus styles.

Do not solve every wide-table problem the same way. Some forms intentionally fit
the available width, while others use horizontal scrolling for genuinely
dynamic column counts. Follow the existing feature and the user's current
request.

Avoid encoding damage when editing Greek files. Use UTF-8, inspect the diff, and
do not commit mojibake such as corrupted `Ξ...` text.

## Verification checklist

For code changes, run:

```bash
cd frontend
npm run build
npm run lint
```

Also manually verify the affected flow:

- Existing-year retrieval and new-year start.
- Unit/squadron filtering and applied selection behavior.
- Editable versus view-only status.
- User versus admin actions.
- Dirty-state warning only after a real edit.
- Draft records under `ΠΡΟΣ ΥΠΟΒΟΛΗ`.
- Final records under `ΥΠΟΒΛΗΘΕΙΣΕΣ`.
- Returned records under `ΕΠΙΣΤΡΟΦΗ ΓΙΑ ΔΙΟΡΘΩΣΗ`.
- Greek text rendering and responsive table layout.

Before finishing, inspect `git diff` and ensure unrelated user changes were not
modified or reverted.

## Agent guardrails

- Read the relevant feature, shared controls/actions, and `DynamicForm` before
  editing a form flow.
- Make the smallest change that satisfies the request.
- Do not modify unrelated forms, navigation, persistence, calculations, or
  styling.
- Do not delete apparently obsolete components without checking imports and
  runtime usage.
- Do not overwrite user changes in a dirty worktree.
- Do not fabricate backend behavior.
- Do not change business formulas or hierarchy rules without explicit
  requirements.
- Preserve Greek UI copy and stable identifiers.
- When unsure whether a rule still matches the current implementation, inspect
  the relevant files first and prefer the live code over this document.
- If a requested change conflicts with this document, follow the user's explicit
  request and mention the conflict.
- Report what was changed and which verification commands were run.

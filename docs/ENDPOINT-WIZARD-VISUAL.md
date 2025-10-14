# Endpoint Wizard - Visual Architecture

## Component Hierarchy

```
APIDesigner (Page)
│
├── TopBar
├── Stats Cards (Total, Active, Filtered)
├── Search & Filters
├── Endpoints List
│   └── Endpoint Card (repeated)
│       ├── Method Badge
│       ├── Path & Description
│       ├── Access Badge (Protected/Public)
│       └── Actions (Copy, Edit, Delete)
│
└── EndpointWizardDialog ⭐
    │
    ├── Dialog Header
    ├── WizardStepper
    │   ├── Step 1 Circle (active/completed/disabled)
    │   ├── Step 2 Circle
    │   ├── Step 3 Circle
    │   └── Step 4 Circle
    │
    ├── Step Content (conditionally rendered)
    │   │
    │   ├── BasicInfoStep (Step 1)
    │   │   ├── Method Select (GET/POST/PUT/DELETE)
    │   │   ├── Path Input
    │   │   ├── Description Textarea
    │   │   └── Live Preview
    │   │
    │   ├── SQLQueryStep (Step 2)
    │   │   ├── SQL Textarea
    │   │   ├── Syntax Hints
    │   │   └── Security Warnings
    │   │
    │   ├── ParametersStep (Step 3)
    │   │   └── Parameter List (auto-detected)
    │   │       └── Parameter Row (repeated)
    │   │           ├── Name (read-only)
    │   │           ├── Source Select (path/query/body)
    │   │           ├── Type Select (string/number/boolean)
    │   │           └── Required Switch
    │   │
    │   └── AccessControlStep (Step 4)
    │       ├── Protected Switch
    │       ├── Role Chips (multi-select)
    │       └── Summary Preview
    │           ├── Method + Path
    │           ├── SQL Query
    │           ├── Parameters
    │           └── Access Control
    │
    └── Dialog Footer
        ├── Back Button (if not step 1)
        └── Next/Create Button
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      APIDesigner                         │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ Load       │───│ Load Project │───│ Display      │  │
│  │ Endpoints  │   │ Roles        │   │ Endpoints    │  │
│  └────────────┘   └──────────────┘   └──────────────┘  │
│         │                │                    │          │
│         └────────────────┴────────────────────┘          │
│                          │                               │
│                          ▼                               │
│         ┌────────────────────────────────┐              │
│         │  EndpointWizardDialog          │              │
│         │  ┌──────────────────────────┐  │              │
│         │  │ State:                   │  │              │
│         │  │ - method                 │  │              │
│         │  │ - path                   │  │              │
│         │  │ - description            │  │              │
│         │  │ - sql                    │  │              │
│         │  │ - params (derived)       │  │              │
│         │  │ - isProtected            │  │              │
│         │  │ - allowedRoles           │  │              │
│         │  └──────────────────────────┘  │              │
│         │             │                   │              │
│         │             ▼                   │              │
│         │  ┌──────────────────────────┐  │              │
│         │  │ Auto-detect params:      │  │              │
│         │  │ useMemo(parse {placeh-   │  │              │
│         │  │ olders} from path/SQL)   │  │              │
│         │  └──────────────────────────┘  │              │
│         │             │                   │              │
│         │             ▼                   │              │
│         │  ┌──────────────────────────┐  │              │
│         │  │ Sync params:             │  │              │
│         │  │ useEffect(merge detected │  │              │
│         │  │ with user overrides)     │  │              │
│         │  └──────────────────────────┘  │              │
│         │             │                   │              │
│         │             ▼                   │              │
│         │  ┌──────────────────────────┐  │              │
│         │  │ Validation:              │  │              │
│         │  │ - Path not empty         │  │              │
│         │  │ - SQL not empty          │  │              │
│         │  │ - No identifier placeho- │  │              │
│         │  │   lders in SQL           │  │              │
│         │  └──────────────────────────┘  │              │
│         │             │                   │              │
│         │             ▼                   │              │
│         │  ┌──────────────────────────┐  │              │
│         │  │ Submit:                  │  │              │
│         │  │ endpointService.create() │  │              │
│         │  └──────────────────────────┘  │              │
│         └────────────────────────────────┘              │
│                          │                               │
│                          ▼                               │
│         ┌────────────────────────────────┐              │
│         │  Success Callback              │              │
│         │  - Reload endpoints            │              │
│         │  - Show success toast          │              │
│         │  - Close dialog                │              │
│         └────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## State Management Flow

```
User Input → Local State → Derived State → Validation → API
    │            │             │              │           │
    │            │             │              │           ▼
    │            │             │              │      Backend
    │            │             │              │           │
    │            │             │              │           ▼
    │            │             │              │      Database
    │            │             │              │           │
    │            │             │              │           ▼
    │            │             │              └──────Success/Error
    │            │             │                         │
    │            │             └─────────────────────────┘
    │            │                                       │
    │            └───────────────────────────────────────┘
    │                                                    │
    └────────────────────────────────────────────────────┘
```

## Step Progression Logic

```
┌─────────────────────────────────────────────────────────────┐
│                     Step Validation                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1 (Basic Info)                                        │
│  ┌──────────────┐                                           │
│  │ path != ""   │ ──── ✅ ───► Allow Step 2                │
│  └──────────────┘                                           │
│         │                                                    │
│         ❌                                                   │
│         │                                                    │
│         ▼                                                    │
│  Disable "Next"                                             │
│                                                              │
│  Step 2 (SQL Query)                                         │
│  ┌──────────────┐                                           │
│  │ sql != ""    │ ──── ✅ ───► Allow Step 3                │
│  └──────────────┘                                           │
│         │                                                    │
│         ❌                                                   │
│         │                                                    │
│         ▼                                                    │
│  Disable "Next"                                             │
│                                                              │
│  Step 3 (Parameters)                                        │
│  ┌──────────────┐                                           │
│  │ Always allow │ ──── ✅ ───► Allow Step 4                │
│  └──────────────┘                                           │
│                                                              │
│  Step 4 (Access Control)                                    │
│  ┌──────────────────────────────────┐                      │
│  │ All previous validations pass    │                      │
│  │ AND                               │ ──── ✅ ───► Allow Submit
│  │ No identifier placeholders in SQL │                      │
│  └──────────────────────────────────┘                      │
│                    │                                        │
│                    ❌                                       │
│                    │                                        │
│                    ▼                                        │
│  Show warning, allow but warn user                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Parameter Detection Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│               Parameter Auto-Detection                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: path, sql                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                      │
│  │ Regex: /{([^}]+)}/g              │                      │
│  │ Extract placeholders from path   │                      │
│  └──────────────────────────────────┘                      │
│         │                                                    │
│         ▼                                                    │
│  pathParams = ["id", "userId", ...]                         │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                      │
│  │ Regex: /{([^}]+)}/g              │                      │
│  │ Extract placeholders from SQL    │                      │
│  └──────────────────────────────────┘                      │
│         │                                                    │
│         ▼                                                    │
│  sqlParams = ["name", "age", ...]                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                      │
│  │ Merge unique params               │                      │
│  │ Remove duplicates                 │                      │
│  └──────────────────────────────────┘                      │
│         │                                                    │
│         ▼                                                    │
│  detectedParams = [                                         │
│    { name: "id", in: "path", type: "string", required: true }│
│    { name: "name", in: "body", type: "string", required: false }│
│    ...                                                       │
│  ]                                                           │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────┐                      │
│  │ Sync with existing params:        │                      │
│  │ - Keep user-modified params       │                      │
│  │ - Add newly detected params       │                      │
│  │ - Remove params no longer in      │                      │
│  │   path/SQL                        │                      │
│  └──────────────────────────────────┘                      │
│         │                                                    │
│         ▼                                                    │
│  Output: merged params array                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Validation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Security Checks                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SQL Query Validation:                                      │
│  ┌────────────────────────────┐                            │
│  │ Check for backticks (`)     │                            │
│  └────────────────────────────┘                            │
│              │                                               │
│              ▼                                               │
│         Found? ──── YES ───► Show Warning                   │
│              │                  "Identifier placeholders"   │
│              NO                 "are not safe"              │
│              │                                               │
│              ▼                                               │
│         Continue                                             │
│                                                              │
│  Access Control Validation:                                 │
│  ┌────────────────────────────┐                            │
│  │ is_protected == true?       │                            │
│  └────────────────────────────┘                            │
│              │                                               │
│              ▼                                               │
│         YES ──────► allowed_roles.length > 0?               │
│              │              │                                │
│              │              ▼                                │
│              │         YES ──► Specific roles               │
│              │              │                                │
│              │              NO                               │
│              │              │                                │
│              │              ▼                                │
│              │         All authenticated users              │
│              │                                               │
│              NO                                              │
│              │                                               │
│              ▼                                               │
│         Public access (no auth required)                    │
│         Show warning                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Communication Pattern

```
┌─────────────────────────────────────────────────────────────┐
│            Props Down, Events Up Pattern                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  EndpointWizardDialog (Parent)                              │
│           │                                                  │
│           │ Props ↓                                         │
│           ├─────────────────────────┐                       │
│           │                         │                       │
│           ▼                         ▼                       │
│    BasicInfoStep            SQLQueryStep                    │
│           │                         │                       │
│           │ Events ↑               │ Events ↑             │
│           │                         │                       │
│           │  onMethodChange()       │  onSqlChange()        │
│           │  onPathChange()         │                       │
│           │  onDescriptionChange()  │                       │
│           │                         │                       │
│           └─────────────────────────┘                       │
│                                                              │
│  Why this pattern?                                          │
│  ✅ Unidirectional data flow                                │
│  ✅ Easy to debug (trace prop changes)                      │
│  ✅ Testable (mock props, assert events)                    │
│  ✅ Reusable (no tight coupling)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Styling Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Tailwind CSS Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Base Layer (shadcn/ui)                                     │
│  ┌──────────────────────────────┐                          │
│  │ - Dialog                      │                          │
│  │ - Button                      │                          │
│  │ - Input                       │                          │
│  │ - Select                      │                          │
│  │ - Badge                       │                          │
│  │ - Card                        │                          │
│  │ - Switch                      │                          │
│  └──────────────────────────────┘                          │
│           │                                                  │
│           ▼                                                  │
│  Component Layer (Custom)                                   │
│  ┌──────────────────────────────┐                          │
│  │ - WizardStepper               │                          │
│  │ - Step circles                │                          │
│  │ - Progress bar                │                          │
│  │ - Parameter grid              │                          │
│  │ - Role chips                  │                          │
│  └──────────────────────────────┘                          │
│           │                                                  │
│           ▼                                                  │
│  Theme Layer (CSS Variables)                                │
│  ┌──────────────────────────────┐                          │
│  │ - --primary                   │                          │
│  │ - --secondary                 │                          │
│  │ - --background                │                          │
│  │ - --foreground                │                          │
│  │ - --orange-* (brand)          │                          │
│  └──────────────────────────────┘                          │
│                                                              │
│  Dark Mode Support:                                         │
│  - All colors have dark: variants                           │
│  - Automatic via class-based strategy                       │
│  - Consistent across all components                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Boundaries                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 1: API Errors                                        │
│  ┌────────────────────────────┐                            │
│  │ try {                       │                            │
│  │   await createEndpoint()    │                            │
│  │ } catch (error) {           │                            │
│  │   notifyError(error)        │                            │
│  │   Keep dialog open          │                            │
│  │   Don't clear form          │                            │
│  │ }                           │                            │
│  └────────────────────────────┘                            │
│           │                                                  │
│           ▼                                                  │
│  Level 2: Validation Errors                                 │
│  ┌────────────────────────────┐                            │
│  │ - Inline error messages     │                            │
│  │ - Red borders on inputs     │                            │
│  │ - Disable submit button     │                            │
│  │ - Show validation hints     │                            │
│  └────────────────────────────┘                            │
│           │                                                  │
│           ▼                                                  │
│  Level 3: Security Warnings                                 │
│  ┌────────────────────────────┐                            │
│  │ - Yellow warning badges     │                            │
│  │ - Allow proceed with caution│                            │
│  │ - Educational messages      │                            │
│  └────────────────────────────┘                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Animation Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                  Animation Choreography                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dialog Open:                                               │
│  ┌────────┬────────┬────────┬────────┐                     │
│  │  0ms   │ 100ms  │ 200ms  │ 300ms  │                     │
│  ├────────┼────────┼────────┼────────┤                     │
│  │ Fade   │ Scale  │ Slide  │ Done   │                     │
│  │ in     │ up     │ in     │        │                     │
│  │ overlay│ dialog │ content│        │                     │
│  └────────┴────────┴────────┴────────┘                     │
│                                                              │
│  Step Transition:                                           │
│  ┌────────┬────────┬────────┐                              │
│  │  0ms   │ 150ms  │ 300ms  │                              │
│  ├────────┼────────┼────────┤                              │
│  │ Fade   │ Slide  │ Fade   │                              │
│  │ out    │ new    │ in     │                              │
│  │ old    │ content│ new    │                              │
│  └────────┴────────┴────────┘                              │
│                                                              │
│  Progress Bar:                                              │
│  ┌────────────────────────────┐                            │
│  │ Smooth transition: 400ms    │                            │
│  │ Easing: ease-in-out         │                            │
│  │ Width: 0% → 25% → 50% → 75% → 100%                      │
│  └────────────────────────────┘                            │
│                                                              │
│  Step Circle:                                               │
│  ┌────────────────────────────┐                            │
│  │ Active: pulse animation     │                            │
│  │ Complete: checkmark fade-in │                            │
│  │ Disabled: grayscale         │                            │
│  └────────────────────────────┘                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

This visual documentation complements the main ENDPOINT-WIZARD.md file and provides a clear picture of the architecture, data flow, and interactions.

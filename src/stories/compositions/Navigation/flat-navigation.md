import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Flat Navigation" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Flat navigation

Minimal navigation between screens because everything is accessible in one place. Tools and functions available via menus, toolbars, and palettes. Navigation happens within the work, not between locations.

## Description

Flat navigation eliminates location-based navigation in favour of tool/function access. Actors always know where they are (in their work/document/canvas) but must find the right tools to operate on it. The challenge shifts from "where do I go?" to "which tool do I use?"

Most common in Canvas Plus Palette applications like Photoshop, Figma, Excel—tools with rich functionality operating on a persistent workspace. Also found in IDEs, DAWs (digital audio workstations), and other professional creative/technical tools.

The "flatness" isn't absolute—tools might be organised in menus or categories—but there's no navigation between different content spaces. You're always "here," with all capabilities theoretically accessible.

## Behavioural position

**Primary behaviours supported:**
- [Transactional search](../?path=/docs/foundations-intent--interaction--docs#transactional-search) via [command menus](../?path=/docs/patterns-command-menu--docs) and search
- Sustained focus on work without navigation interruptions
- Tool/function discovery through organised palettes

**Challenges:**
- [Uncovering](../?path=/docs/foundations-intent--interaction--docs#uncovering) — finding tools vs finding content becomes the challenge
- Initial [exploring](../?path=/docs/foundations-intent--interaction--docs#exploring) is overwhelming due to feature density
- [Browsing](../?path=/docs/foundations-intent--interaction--docs#browsing) is about tools rather than content

The cognitive load comes from tool complexity rather than navigation complexity. Actors don't get lost spatially, but they can get lost in the feature set.

## When to use

**Content structure:**
- Single persistent workspace or canvas
- Rich toolset operating on that workspace
- Professional/power user context
- Content creation rather than content consumption

**Behavioural needs:**
- Actors work intensively in one space
- Navigation interruptions would break flow
- Tool access more important than content navigation
- High feature density is acceptable/expected

**Agency preference:**
- Maximum agency through tool access
- High cognitive load acceptable for productivity gains
- Expert users valuing efficiency over discoverability

## When not to use

**Avoid if:**
- Multiple distinct content spaces to navigate
- Casual/infrequent users (overwhelming)
- Mobile-first context (insufficient space for toolbars/palettes)
- Simple functionality (unnecessary complexity)
- Content consumption rather than creation

**Alternative models:**
- [Hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) for multiple workspaces
- [Fully connected](../?path=/docs/compositions-structure-fully-connected--docs) for content-focused applications
- [Hub + Flat hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#hub-and-spoke--flat-navigation) for multiple flat spaces

## Variants

### Menu-driven flat
Primary tool access through menu bar.

**Characteristics:**
- Most traditional (File, Edit, View, etc.)
- Complete feature set available
- Keyboard shortcuts for frequent actions
- Can feel overwhelming without learning path

### Palette-driven flat
Floating or docked panels with tool groups.

**Characteristics:**
- Visual tool discovery
- Customisable workspace layout
- Common in design tools (Photoshop, Illustrator)
- Requires screen space management

### Ribbon interface
Contextual tabs with grouped tools.

**Characteristics:**
- Microsoft Office popularised pattern
- Balances organisation with accessibility
- Context-aware tool display
- Controversial (some users love, some hate)

### Command-first flat
Keyboard command palette as primary access.

**Characteristics:**
- Modern dev tool pattern (VS Code, Figma)
- Extremely efficient for experts
- Lower visual clutter
- Requires learning commands
- See [Command menu pattern](../?path=/docs/patterns-command-menu--docs)

## States

### Tool states
- **Active** — currently selected tool
- **Available** — accessible tools
- **Disabled** — contextually unavailable
- **Recently used** — surfaced for quick re-access

### Workspace states
- **Clean** — no work yet created
- **In progress** — active work visible
- **Unsaved changes** — work at risk
- **Saved** — work persisted

### Panel/palette states
- **Open** — visible and accessible
- **Collapsed** — minimised but recoverable
- **Hidden** — dismissed, requires explicit reveal
- **Floating** — detached from main window

## Agency implications

**Locus:** Human-centric. Actor has direct access to all capabilities.

**Dynamics:** Static feature set typically, though some tools adapt contextually.

**Granularity:** Fine-grained. Actors select specific tools and configure detailed parameters.

**Control trade-off:** Maximum [agency](../?path=/docs/foundations-agency--docs) through comprehensive tool access, but cognitive burden shifts from navigation to tool selection/mastery. This is appropriate when:
- Actors are professional/power users investing in learning
- Work sessions are long and focused
- Efficiency gains justify learning curve
- Rich functionality is core value proposition

The lack of navigation reduces one source of cognitive load but increases another. Feature density requires careful organisation (menus, palettes, tabs) and discovery aids (search, command palette, contextual tools).

## Implementation patterns

### Tool organisation
- **Menu bar** — hierarchical organisation (File > Export > PNG)
- **Toolbars** — frequently used actions in persistent bar
- **Context menus** — right-click for contextual options
- **Tool palettes** — grouped floating/docked panels
- **Properties panels** — configure selected tool/object

### Discovery mechanisms
- **Command palette** — searchable all-tools interface
- **Keyboard shortcut viewer** — learn efficiency shortcuts
- **Contextual help** — tooltips, inline hints
- **Tool tips** — descriptions on hover
- **Recent tools** — quick access to previous actions

### Workspace customisation
- **Saveable layouts** — store preferred panel arrangements
- **Workspaces** — predefined layouts for different tasks
- **Panel docking** — snap panels to edges or group together
- **Full-screen mode** — hide UI for maximum canvas space

### Performance considerations
- **Lazy loading** — load tool palettes on demand
- **Debounced updates** — batch rapid tool changes
- **Canvas optimisation** — efficient rendering of work surface

## Related patterns

### Implements this model
- Adobe Creative Suite (Photoshop, Illustrator, InDesign)
- Design tools (Figma, Sketch)
- IDEs (VS Code, IntelliJ)
- Spreadsheet applications (Excel, Google Sheets)
- DAWs (Ableton, Logic Pro)

### Complements
- **[Command menu](../?path=/docs/patterns-command-menu--docs)** — efficient tool access

### Precursors
- Simple single-function tools → flat navigation as features accumulate

### Evolution paths
- Flat → [Hub + Flat hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#hub-and-spoke--flat-navigation) when multiple canvas spaces needed
- Menu-driven → command-first as power users emerge

### Hybrid patterns
- [Hub + Flat](../?path=/docs/compositions-structure-hybrid-patterns--docs#hub-and-spoke--flat-navigation) — hub for projects/files, flat within each

## Resources & references

- Raskin (2000) *The Humane Interface*, Chapter on "Habits and Monotony"
- Nielsen Norman Group (2014) [Flat Design: Its Origins, Its Problems, and Why Flat 2.0 Is Better for Users](https://www.nngroup.com/articles/flat-design/)
- Cooper, Reimann, Cronin, Noessel (2014) *About Face*, Chapter on "Direct Manipulation and Virtual Environments"

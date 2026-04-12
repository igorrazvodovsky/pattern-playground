essenceofsoftware.com

# Design Principles
- Design from functionality outward: Start by defining the functionality in terms of purposes, rather than beginning with screens or code.
- Make concepts explicit and visible: Document each concept clearly, with purpose, constraints, and interactions.
- Use modular, composable concepts: Design concepts so they can be recombined and modified independently—minimising accidental complexity.

# From features to interacting concepts
Jackson argues that software isn’t just a collection of features; it’s a network of interacting concepts—meaningful functional units that work together to deliver value  ￼.

# From UI-centric to conceptual clarity
Instead of focusing primarily on the user interface, great software design begins with conceptual clarity: ensuring the underlying concepts are coherent and well-defined, not just their surface representations  ￼.

# Concept
A fundamental unit of software design—defined by structure, behavior (state and actions), and purpose.
Application: Identify and name core concepts during early design, making them explicit and shareable.

# Concept design vs UI design
Concept design addresses how software functions and behaves; the UI is simply how those concepts are represented to users

# Concept composition and dependencies
Concepts interact—some depend on or compose with others. Understanding these relationships is key to modelling robust systems

# Stages of conceptual clarity
Jackson frames concept design in three stages: (1) defining functionality, (2) naming and structuring concepts, and (3) isolating them so they’re manageable and clear

# Integration

- With design systems: Concept design creates reusable, functional building blocks—concepts—that survive the journey from UX to engineering.
- With design patterns: Patterns often capture recurring concepts

# Practical methods
- Concept sketching: Define concept candidates by giving them names and purposes + states, actions
- Concept card library: Build a repository of concept definitions
- Concept dependency mapping: Visualise how concepts depend on one another
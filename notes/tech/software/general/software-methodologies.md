# Software Methodologies

## Table of Contents

- [Overview](#overview)
- [Comparison](#comparison)
- [Choosing](#choosing)
- [Scrum Anatomy](#scrum-anatomy)

## Overview

Methodologies arrange the stages of the [software lifecycle](./software-lifecycle.md) differently. They fall into three families: plan-driven (waterfall, V-Model), iterative and risk-driven (spiral, incremental, prototyping, RAD) and agile (Scrum, Kanban, XP, Lean). [DevOps](../software-lingo.md#sdlc-models) is a delivery culture layered on top of any of them. One-line definitions live in [Software Lingo](../software-lingo.md#sdlc-models).

## Comparison

| Methodology | Cadence | Change handling | Strengths | Weaknesses |
| --- | --- | --- | --- | --- |
| Incremental | Several releases, each adding a slice of the whole | Later slices absorb change | Early partial value; lower risk than one big release | Needs a modular architecture planned upfront |
| Kanban | Continuous flow, no iterations | Change enters whenever capacity frees | Exposes bottlenecks; little ceremony; fits support and ops work | No built-in deadlines; needs discipline on WIP limits |
| Lean | Continuous, small increments | Decide late, deliver fast | Cuts waste; focuses on user value | A set of principles, not a process; needs a framework to apply |
| Prototyping | Throwaway or evolving mockups reviewed with users | Requirements emerge from feedback | Surfaces misunderstood requirements early | Prototypes get mistaken for finished product; scope creep |
| RAD | Short build cycles with heavy user involvement | Embraced through rapid iterations | Fast delivery of working screens | Needs constant user availability; weak for large systems |
| Scrum | Fixed sprints (1-4 weeks) | Re-prioritized at each sprint boundary | Predictable rhythm; regular feedback; clear roles | Ceremony overhead; sprint commitments resist mid-sprint change |
| Spiral | Loops of plan, risk analysis, build and evaluate | Each loop reassesses risk and scope | Suits large, high-risk projects | Costly; needs risk-analysis expertise |
| V-Model | Sequential, each phase paired with a test phase | Costly once a phase is done | Test planning starts at requirements; strong traceability | Rigid; late working software |
| Waterfall | Sequential phases, one release | Late changes are costly | Predictable; thorough documentation; easy to contract | Feedback arrives last; requirements must be right upfront |
| XP | Short iterations (1-2 weeks) with frequent releases | Welcomed; supported by tests and refactoring | High code quality via pair programming, TDD, CI | Demands engineering discipline and customer access |

## Choosing

| Situation | Fits |
| --- | --- |
| Continuous stream of small, unpredictable requests (support, ops) | Kanban |
| Fixed scope, fixed contract, stable requirements | Waterfall |
| Large, costly-to-fail project with unclear risks | Spiral |
| Product with evolving requirements and a team shipping regularly | Scrum, often with XP engineering practices |
| Regulated or safety-critical work needing traceable verification | V-Model |
| Unclear requirements and users available for feedback | Prototyping or RAD |

## Scrum Anatomy

| Element | Kind | Purpose |
| --- | --- | --- |
| Backlog refinement | Event | Clarify and estimate upcoming items |
| Daily standup | Event | Sync progress and surface blockers |
| Developers | Role | Build the increment |
| Product backlog | Artifact | Ordered list of everything the product might need |
| Product owner | Role | Owns the backlog and its priorities |
| Scrum master | Role | Coaches the team and removes impediments |
| Sprint backlog | Artifact | Items chosen for the sprint plus the plan to deliver them |
| Sprint planning | Event | Choose what the sprint delivers |
| Sprint retrospective | Event | Inspect the process and agree on improvements |
| Sprint review | Event | Demo the increment and gather stakeholder feedback |

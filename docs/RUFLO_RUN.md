# Ruflo orchestration record

## Scope

Ruflo is the coordination and learning layer; Codex is the only writer and
executor. The setup intentionally uses the `minimal` Codex profile.

## Topology

- Hierarchical swarm, maximum three roles, auto-scaling disabled.
- Implementer: product code and focused tests.
- Performance engineer: performance and architecture gate review.
- Tester: functional, responsive, and accessibility gate review.

## Recorded run

- Task ID: `stillpoint-site-v1`
- Swarm ID: `swarm-1786779991257-2t9wbo`
- Ruflo route: primary `performance-engineer` (88% confidence), alternatives
  `coder` (78%) and `tester` (68%).
- Memory search ran before implementation; no prior project pattern existed.
- Autonomous publishing, unattended fan-out, and multiple writers are disabled.

## Loop contract

1. Recall and route with Ruflo.
2. Implement one coherent product slice with Codex.
3. Run functional, accessibility, responsive, performance, and build checks.
4. Turn every failed gate into a bounded change.
5. Repeat until all gates pass, then store the successful project pattern.


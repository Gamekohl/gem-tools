This tutorial explains how to use **events** in mission scripting to control unit behavior in a structured and scalable way. The focus is on coordinating soldier movements and mission flow using event-driven logic rather than immediate or hard-coded actions.

---

## What Events Are Used For

Events act as **conditional gates** in mission scripts. Instead of executing actions immediately, commands are placed behind an event and are only triggered once that event is activated.

Typical use cases include:
- Delaying unit movement until a specific moment
- Coordinating multiple groups across different phases of a mission
- Structuring attacks, counterattacks, or reinforcements in waves

Units are usually identified by **tags** (for example, tagging German soldiers as `Ger`) so they can be easily referenced in scripts and linked to events.

---

## Basic Workflow

The general workflow when using events is as follows:

1. Tag the units that should be controlled by the script
2. Define a waypoint that those units should move to
3. Create a movement command for the tagged units
4. Place that command behind an event instead of executing it immediately
5. Activate the event when the desired condition or delay is met

Events can be **set (activated)** and optionally **not reset**, ensuring that the scripted action only happens once unless explicitly designed otherwise.

---

## Step-by-Step Example

A simple example demonstrated in the tutorial:

- Three German soldiers are tagged.
- A waypoint is created as their destination.
- A script command is defined to move these soldiers to that waypoint.
- The movement command is blocked by an event (for example: `German move`).
- A delay timer of around five seconds is added.
- After the delay expires, the event is set.
- Once the event activates, the soldiers automatically move to the waypoint.

This approach allows precise timing without complex conditional logic.

---

## Advanced Usage and Best Practices

Events become especially powerful in larger missions:

- Ideal for managing **many units across multiple waypoints**
- Well suited for **enemy waves**, reinforcements, and counterattacks
- Units can be grouped by type (infantry, tanks, armored vehicles, air units)
- Each group can be assigned its own event
- Events can be triggered sequentially or in parallel to simulate realistic battlefield escalation

Using events keeps scripts readable and easier to maintain as mission complexity increases.

---

## Example Event Structure for Complex Missions

| Event Name       | Unit Type             | Delay Before Activation | Purpose                          |
|------------------|-----------------------|-------------------------|----------------------------------|
| Infantry Attack  | Infantry squads       | 3–5 seconds             | Controls infantry movement waves |
| Tank Assault     | Tanks / armored units | 5–10 seconds            | Triggers armored attacks         |
| Air Attacks      | Air units             | Not specified           | Activates air support or strikes |
| Artillery Strike | Artillery units       | Not specified           | Controls artillery timing        |

This structure helps separate concerns and keeps mission phases clearly defined.

---

## Key Takeaways

- Events function as **control points** for scripted actions.
- They allow units to be held until specific timing or conditions are met.
- Event-driven scripting simplifies large and complex mission setups.
- Delays and layered events improve pacing and realism.
- Events enable clean, multi-phase missions involving infantry, armor, air units, and artillery.
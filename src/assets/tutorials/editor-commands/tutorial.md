Editor Commands define **what happens** in a mission when certain conditions are met. They are mainly used in the *
*Trigger Editor**, but can also be assigned to **Waypoints**.

Most commands share a common pattern:

- **selector** determines which actors/entities the command affects (see *Selector*).
- Additional fields depend on the selected command.
- A field set to `–` means the command **does not change** that specific property.

The available commands are grouped into categories: **actors**, **entity**, **group**, **scene**, plus **quest** and *
*other**.

## Frequently Used Commands

### actors_to_waypoint

Directs actors to a waypoint. If outgoing waypoint links exist, actors continue along the connected path.

**Parameters:**

- **selector**: the actor(s) that should start moving (see *Selector*)
- **waypoint (.uid / .name)**: the destination waypoint (by ID or name)
- **inactive_at_startup**: if enabled, the actor is not present on the map until the command runs
- **clone**: if enabled, the original actor does not move; a clone is spawned and moves instead  
  (the clone has its own **mid**; if the original has a **tag**, the clone inherits that tag)
- **force_approach**: forces a direct approach to the waypoint

### actor_state

Changes an actor’s state and behavior.

**Parameters:**

- **selector**: the actor(s) to modify (see *Selector*)
- **control**: who controls the actor
    - `user` (player)
    - `AI` (computer)
- **speed**: `slow`, `normal`, `fast`
- **speed_kmh**: speed in km/h (cannot exceed the actor’s max; `0` uses default speed)
- **movement** (humans only):
    - `normal` (standing)
    - `crawl` (prone movement)
    - `squat` (crouched movement)
- **return_fire**: `on` / `off`
- **hold_position**: `on` / `off`
- **hide_mode**: `on` (weapon ready) / `off` (weapon hidden)
- **weapon_prepare**: `on` / `off`
- **waypoint_only**:
    - `on` (follow waypoints without combat reactions / without using cover)
    - `off` (normal behavior)

### event

Changes an event state after an optional delay.

**Parameters:**

- **event**: event name
- **mode**:
    - `reset`
    - `set`
    - `toggle`
- **delay**: delay in seconds before applying the mode

### delete

Deletes selected entities (useful for cleanup when units leave the playable area).

**Parameters:**

- **selector**: actors/entities to delete (see *Selector*)

### trigger

Sets or clears a trigger.

**Parameters:**

- **name**: trigger name (selected from existing triggers)
- **on**: whether to set (`✓`) or clear (`–`) the trigger  
  (when set, commands inside that trigger execute immediately)

### wait

Stops actors for a specified time (commonly used during waypoint movement).

**Parameters:**

- **selector**: actor(s) that should wait (see *Selector*)
- **time**: waiting time in seconds

## Actors Commands

### actors_to_cover

Directs actors into cover.

**Parameters:**

- **selector**: actors to send to cover (see *Selector*)
- **covers**: one or more cover names (optional)  
  If not specified, actors move to the nearest available cover.

### actors_watch

Rotates an actor toward a waypoint or scans within a radius.

**Parameters:**

- **selector**: actor that rotates (see *Selector*)
- **.uid**: waypoint ID to watch toward
- **.name**: waypoint name to watch toward
- **radius**: if > 0, the actor rotates to watch within the specified distance
- **watcher_bone**: optional bone to rotate (if rotating the full entity is not desired/possible)

**Note:** It usually makes sense to specify either a **radius** or a **waypoint**.

### actors_fire

Makes selected actors fire at a target waypoint.

**Parameters:**

- **selector**: actor(s) that start firing (see *Selector*)
- **waypoint (.uid / .name)**: target waypoint (by ID or name)
- **deviate**:
    - `–` exact fire
    - `✓` fire with deviation (inaccurate)

### ables

Adds or removes abilities (properties) from selected entities.

**Parameters:**

- **selector**: targeted entity/actor(s) (see *Selector*)
- **add**: ability to add (chosen from the dropdown list)
- **remove**: ability to remove (chosen from the dropdown list)

### animation

Plays one or more animations on the selected actor.

You can find the complete list of animations here: [Animations list](/animations)

**Parameters:**

- **selector**: actor that plays the animation (see *Selector*)
- **collage**: list of animations to play
- **speed**: animation playback speed
- **cicledelay**: delay between animations
- **delay**: delay after all animations finish
- **totalTime**: total time of the animation sequence
- **flags**: whether animations loop and/or are chosen randomly

### player

Changes which player/side an actor belongs to.

**Parameters:**

- **selector**: actors whose ownership changes (see *Selector*)
- **player**: the new player the actors will belong to

Common use cases: prisoners, defection, interrogation scenarios.

### wait_crew

Makes a selected vehicle wait until required crew/passengers have boarded.

**Parameters:**

- **selector**: the vehicle (see *Selector*)
- **units**: actors that must board (mids listed separated by spaces)

### board

Orders actors to board a vehicle or cannon. (Used at a waypoint.)

**Parameters:**

- **mids**: identifies the vehicle to board
- **place**: seat/role to take (optional):  
  `gunner`, `driver`, `commander`, `charger`  
  If omitted, seat order is determined by default.

### emit

Sets actors down (disembark) at a waypoint.

**Parameters:**

- **selector**: determines where actors get off from (see *Selector*)
- **waypoint (.uid / .name)**: waypoint to disembark at
- **mids**: specific actor mids to set down (optional)
- **emit .mode**: who gets off: `all`, `passengers`, `crew`
- **emit .count**: number of actors to detruck  
  If set to `–1`, then all get off (respecting `emit .mode`)

### air_state

Controls aircraft movement.

**Parameters:**

- **selector**: aircraft (see *Selector*)
- **ground**:
    - `–` normal flight at the assigned altitude
    - `✓` aircraft moves on the ground (altitude becomes irrelevant)
- **altitude**: flight altitude in meters

### talk

Makes an actor speak a phrase or phrase group (displayed above the actor).

**Parameters:**

- **selector**: the speaker (see *Selector*)
- **talk**: phrase group name (from `talk.set`)
- **say**: phrase name (from `say.set`)  
  Multiple variants can exist; one is chosen randomly at runtime.

## Entity Commands

### effect

Invokes a specific scripted effect for the selected entity/actor.

**Parameters:**

- **selector**: target actor/entity (see *Selector*)
- **effect**: effect name  
  (available effects depend on the selected actor/entity)

### inactive

Makes the selected actor/entity inactive (and can re-activate it later).

**Parameters:**

- **selector**: target actor/entity (see *Selector*)
- **on**: toggles inactivity on/off

Used when something should temporarily disappear from the map (e.g., entering/leaving a cellar).

### rt_function

Assigns a specific runtime function to the selected actor/entity.

**Parameters:**

- **selector**: target actor/entity (see *Selector*)
- **name**: function name available for the selected entity  
  (example mentioned: an animation/function like opening gates)
- **params**: parameters for the function (depends on the function; e.g. animation speed)

### tag

Adds or removes tags on actors/entities.

**Parameters:**

- **selector**: target actor/entity (see *Selector*)
- **add**: adds a tag
- **remove**: removes a tag

## Group Commands

### group_state

Changes the state of a group on a waypoint.  
This command affects **all groups** that reach the waypoint where the command is assigned.

**Parameters:**

- **speed**: group speed (`slow`, `normal`, `fast`)
- **mode**: if set to `wait_units`, the group waits until all members arrive before continuing

### group_to_waypoint

Assigns a movement path for a group.

**Parameters:**

- **group**: group name
- **waypoint (.uid / .name)**: destination waypoint
- **inactive_at_startup**: if enabled, the group is absent from the map until the command runs

### group_wait

Stops a group at a waypoint (similar to `wait` for individual actors).

**Parameters:**

- **time**: stop duration in seconds

## Scene Commands

### gameover

Ends the mission with a win/lose outcome.

**Parameters:**

- **result**: `win` or `loose` (spelling as in the manual)
- **mission state**: `mission done` or `mission failed`
- **message**: message shown on mission end
- **teamTag**: multiplayer-only; binds the result to a specific team/player tag

### message

Shows a message on screen.

**Parameters:**

- **text**: message text
- **sound**: sound file (`.wav` or `.ogg`) played with the message
- **delay**: duration in seconds
- **pause**: `on` / `off`  
  If on, the game is paused while the message is displayed.

### music

Controls mission music.

**Parameters / Controls:**

- **Start**: select and start a music file
- **Stop**: stop the selected music
- **Fade**: fade out
- **Loop**: on/off; if enabled, the selected music restarts when it ends

### timer

Adds a mission timer.

**Parameters:**

- **hide**: hide the timer
- **time**: timer duration in seconds
- **title**: timer label/comment
This tutorial explains how to create **continuous enemy attack waves** using the game editor. The focus is on spawning
German machine gunners in repeated intervals while maintaining control over timing, difficulty, and performance. The
method relies on tags, waypoints, triggers, and loop commands to keep the setup efficient and scalable.

The tutorial is based on this YouTube video by SturmfuhrerPK:
@[youtube](UJct3GalzwI)

## 1. Unit Placement and Tagging

Begin by placing the units that will be reused for the attack waves:

- Place German machine gunners on the map
- Select the units and press **Ctrl + T** to assign a tag (for example, `German SMG`)
- Use **Alt + T** to toggle tag visibility and confirm the correct assignment

Tagging allows the same group of units to be referenced repeatedly inside loop commands.

If you are not familiar with the keybindings, be sure to check out the [Keybindings Tutorial](/tutorials/keybindings).

## 2. Waypoint and Behavior Setup

Next, define where and how the units will attack:

- Place a waypoint (commonly *Waypoint 0*) that serves as the spawn or teleport location
- In the command settings, set the **actor state** to `assault`
- Add an additional **attack position waypoint** that defines the target area for the units

This ensures that spawned units immediately behave as attackers instead of remaining idle.

## 3. Trigger and Loop Configuration

Endless waves are controlled through triggers combined with loop commands:

- Create a trigger that starts the attack sequence
- Add one or more **Loop** commands inside the trigger
- Within the loop:
    - Select the tagged units
    - Spawn or teleport them to the waypoint
    - Adjust rotation or approach behavior if needed
    - Insert a **Delay** command to control the interval between waves

Loops allow the same sequence to repeat without manually duplicating commands.

## 4. Timing and Repetition Logic

Two parameters define the behavior of the wave system:

- **Delay** – how much time passes between each wave (for example, 5, 15, or 60 seconds)
- **Loop count** – how many times the wave is repeated (for example, 10, 100, or 1000)

The total duration of the attack is calculated as:

``Delay × Loop Count = Total Duration``

Example:

- 60 seconds delay × 20 loops = 20 minutes of continuous attacks

## 5. Performance Considerations

Spawning large numbers of units can heavily impact performance:

- Hundreds or thousands of active units may cause severe lag or crashes
- Low- to mid-range PCs are especially vulnerable, but high-end systems are not immune
- Endless wave setups should be tested carefully and scaled responsibly

If performance drops significantly, the sequence should be stopped using a **Finish** command.

## Example Loop Configuration

| Parameter      | Description                | Example              |
|----------------|----------------------------|----------------------|
| Delay          | Time between waves         | 5 / 15 / 60 seconds  |
| Loop Count     | Number of wave repetitions | 10 / 100 / 1000      |
| Total Duration | Delay × Loop Count         | 20 minutes (60 × 20) |

## Use Cases

This approach is particularly useful for:

- Attack and defense missions
- Prolonged battles with escalating pressure
- Custom scenarios that require adjustable difficulty and duration

Compared to manually scripting each spawn, loop-based waves are faster to set up and easier to maintain.

## Key Takeaways

- Endless attack waves are created using **triggers and loop commands**
- Tags and waypoints are essential for reusable unit control
- Delay and loop count determine pacing and mission length
- Excessive unit counts can cause performance issues and must be handled carefully
- This system is well suited for dynamic, large-scale combat scenarios
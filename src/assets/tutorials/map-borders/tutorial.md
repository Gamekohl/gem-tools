This tutorial is aimed at **new users of the GEM Editor** and explains how to correctly use and understand **map border lines**. These lines control fog visibility, camera limits, and unit movement, and are essential for creating functional and stable maps and missions.

---

## Overview of Map Border Lines

The editor uses four different colored lines, each with a specific purpose:

| Line Color | Function               | Description                                                                                 |
|------------|------------------------|---------------------------------------------------------------------------------------------|
| Yellow     | Fog Start              | Defines where fog begins. Everything beyond this line is covered by fog.                    |
| Green      | Fog Depth End          | Works together with the yellow line; fog density increases as the green line is approached. |
| Blue       | Camera Boundary        | Limits how far the player camera can move. The camera cannot pass this line.                |
| Purple     | Unit Movement Boundary | Prevents ground units from crossing this line. Does not affect aircraft.                    |

---

## How Each Line Works

#### Yellow Line – Fog Start
The yellow line marks the point where fog begins. Any area beyond this line will be hidden by fog. This line should always be placed first, as it defines the visible play area.

#### Green Line – Fog Depth
The green line works together with the yellow line to control fog intensity. As the camera moves closer to the green line, the fog becomes thicker, creating a smooth visual transition.

#### Blue Line – Camera Boundary
The blue line restricts camera movement. Players cannot move the camera beyond this boundary. For best results, the blue line should be placed **between the yellow and green lines**.

#### Purple Line – Unit Movement Restriction
The purple line is a hard boundary for ground units such as infantry, vehicles, and tanks. These units cannot cross it. Aircraft, however, are not affected and can freely fly over this line.

This line must always be placed **at the very edge of the map**.

---

## Critical Placement Rules

- Place the **yellow line first** to define where fog begins.
- Position the **blue line between the yellow and green lines** to properly limit camera movement.
- Always place the **purple line at the outer edge of the map**.
- Never move the purple line inward, as this can break unit behavior.

Incorrect placement of the purple line can cause serious gameplay issues:
- Units may become stuck and unable to move or retreat
- Reinforcements may fail to enter or behave correctly
- Mission flow can break entirely

---

## Editing Maps and Adding New Sections

When expanding a map or adding new terrain sections (set clips):

- Adjust **only the yellow and blue lines**
- Leave the **purple line unchanged**
- This ensures that unit movement rules remain intact and predictable

---

## Best Practices Summary

- Define fog using the yellow and green lines
- Control camera limits with the blue line
- Restrict ground unit movement using the purple line
- Keep the purple line at the map edge at all times
- Remember that aircraft are not affected by the purple line
- Always test camera movement and unit behavior after adjusting borders

---

## Conclusion

Understanding and correctly placing map border lines is fundamental when working with the GEM Editor. These lines directly affect visibility, camera control, and unit behavior. Proper setup ensures smooth gameplay, functional reinforcements, and reliable mission flow. This tutorial establishes the foundation needed to build stable and well-structured maps, with more beginner-focused guidance planned for future tutorials.

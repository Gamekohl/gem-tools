This tutorial introduces the fundamentals of the **GEM Editor**. It will cover the basic layout of the editor and
provide an overview of the most important menus and features.

## Map Menu
![Map Menu](./images/f2.webp)

This is the first screen you see when launching the editor. On the left side, you will find the minimap.  
On the right side is the **Map Menu**, which contains four tabs:

- **Entity**
- **Land**
- **Clip**
- **Edifice**

While the **Map Menu** is active (F2), you can use the **1–4** number keys to switch between these tabs.

### Entity
![Entity](./images/entity.webp)

The **Entity** tab allows you to place any object, vehicle, human, etc. which is available in the editor. Which entities you can place
depends on the expansions you have purchased for Gates of Hell - Ostfront. Although the entities are still displayed in the drawer, 
they are greyed out and cannot be selected.

At the top you have multiple options to configure the placement of the entity as well as scene related options.

| Option                | Description                                                      | Note        |
|-----------------------|------------------------------------------------------------------|-------------|
| Clip Camera Position  | If checked, the camera will not clip through objects/ground/etc. | -           |
| Random Orientation    | Randomizes the orientation of the entity when placed.            | 0 ≤ x ≤ 360 |
| Random Scale          | Randomizes the scale of the entity when placed.                  | 0 ≤ x ≤ 1   |
| Rotation lock angle   | Locks the rotation of the entity to a specific angle.            | 0 ≤ x ≤ 360 |
| Position lock step    | Locks the position of the entity to a specific step.             | -           |
| Season                | Selects the default season texmod for an entity when placed.     | -           |
| Browse Scene Entities | Restricts the entity placement to entities in the current scene. | -           |

**Note:** The search functionality in the GEM Editor is not perfect. It does not support full text search or partial keyword
matching (e.g., searching for "**_industry**" will not return "**euro_industry_stairs_high_x**").

For that I recommend using the [Editor Objects Search](https://gem-tools.vercel.app/resources) instead.

### Land
![Land](./images/land.webp)

In this tutorial I will just cover the basics of the **Land** tab. If you want a deep dive into the land editing features,
I recommend checking out the **Land Editor Tutorial (coming soon)**.

At the top you have seven different land editing options:
- **Heights**: Adjust the height of the map.
- **Colors**: Paint the map in any color.
- **Polygons**: Select the different polygon sizes you want. There are six different levels to choose from (**0 = least detail, 5 = most detail**).
- **Texures**: Select the different textures for your map.
- **Grass**: Select the different types of grass you want to place in your map.
- **Ocean**: Select whether the ocean should be enabled or not. 

Although the following options are tied to **Heights,** I will still cover them briefly since I think they are quite important.

There are two different sliders. The first one controlling the soft or sharpness of the brush. The second controlling
the speed of the brush.

Below the sliders there are all heightmap related options. In this tutorial I will not cover them in detail in this tutorial, although
**Fixed height** and **Water altitude** are important:
- **Fixed height**: If checked, the brush will set the height of the terrain to the value you set in the input.
- **Water altitude**: Sets the altitude of the water level.
  - **Example**: If you set this to **100** and the **fixed height** below that, all terrain you modify with the brush will be **below** the water line.

If you want to learn more about the heightmap options, check out the **Land Editor Tutorial (coming soon)**.

### Clip
![Clip](./images/clip.webp)

The **Clip** tab allows you to set the following options:
- **Show map borders**: If checked, it will show the different borders of the map, each with a different color.
- **Boundary haze**: If checked, the map will have a haze effect around the edges.
- **Altitude haze**: If checked, and based on **Start** and **End**, the map will have a haze effect around this altitude range.

Below that you have the Presets section. Here you can define different clip presets, or adjust the auto-generated. This works best
with **Show map borders** enabled.

| Border Color | Description                                                                                                                                                                                                                                                            |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Yellow/Green | Connected with each other; **Yellow** represtens the limit of the units movement. Units can't enter the area behind the yellow line. **Green** should remain on the map and as close as possible to the **Purple** line to keep as much space of your map as possible. |
| Purple       | Marks the maps outermost border.                                                                                                                                                                                                                                       |
| Blue         | Represents the limit of the camera center. You can't scroll out of the map further than to the point until your camera center has reached that line.                                                                                                                   |

At the bottom you have different options for the selected preset. (TBE)

The option **Render Minimap** will render a top-down view of the map and in the resolution entered in the input (In this example 4096). The preview will be placed
in the root folder of your saved map. (e.g., _Call to Arms - Gates of Hell\resource\map\test-map_\minimap.png)

### Edifice
![Edifice](./images/edifice.webp)

The **Edifice** panel is used to manage how buildings behave during gameplay. It primarily controls building grouping and special behaviors, such as automatically hiding roofs when units enter a structure.

The building list in the edifice panel (for example **H1**, **H2**, etc.) represents **building groups**.

- Each entry corresponds to a logical building unit.
- A group defines how the editor treats one or more building objects as a single structure.
- These groups are used internally to control effects like roof visibility.

The option **Show Interiors** allows you to toggle to hide or show the roofs of all buildings.

## Mission Menu
![Editor Menu](./images/f3.webp)

The **Mission Menu** can be opened by pressing **F3**. It contains all configuration options for the current mission.  
This menu is divided into eight tabs:

- **View**
- **Entity**
- **Squad**
- **Waypoint**
- **Zone**
- **Trigger**
- **Camera**
- **Cover**

## FX Editor
![FX Editor](./images/f4.webp)

The **FX Editor** is accessible via **F4**. Here, you can create, edit, and manage all visual effects used in the current mission.

## Environment
![Environment](./images/f6.webp)

Press **F6** to open the **Environment Editor**. This section allows you to configure various environmental settings for the mission, including:

- **Light**
- **Wind**
- **Haze**
- **Sky**
- **Weather**
- **Ocean Wave Works**
- **Thunder**
- **Video Overlay**
- **DOF (Depth of Field)**
- **Glow**
- **Render Tweaks**

## Editor Globals
![Editor Globals](./images/f7.webp)

The **Editor Globals** menu can be accessed by pressing **F7**. It allows you to adjust global editor settings, such as the current difficulty level.

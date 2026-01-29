This tutorial provides a practical introduction to mapmaking and scripting, with a clear focus on efficient workflows, clean results, and avoiding unnecessary complexity. The emphasis is on understanding core tools before moving on to advanced settings.

---

## Working with Heights

Heights are the foundation of any map. They define the overall terrain shape, including hills, mountains, valleys, beaches, and lowlands. It is strongly recommended to keep height values **below 20–30%**. Lower values help preserve a soft, natural look and prevent terrain from becoming sharp or overly angular. His approach prioritizes smooth hills and gentle valleys rather than dramatic, pointy mountains.

The **Fixed Height** tool applies a single, uniform height across the entire map. For example, setting it to `50` raises all terrain to that level. Negative values, such as `-50`, are especially useful when creating beaches, coastlines, or areas below sea level.

A critical technique for achieving clean terrain is using **Fixed Height** and **Fixed Relative** together, both set to zero. This combination is primarily used to smooth height transitions and remove jagged or spiky edges. Adive clicking—or even double-clicking—these tools frequently. While this may be slightly demanding on the mouse, it dramatically improves terrain quality and speeds up the smoothing process.

At this stage, advanced height settings should be avoided. Focusing on these basic tools leads to faster results and more consistent maps.

---

## Polygons and Terrain Detail

Polygons define the resolution of the terrain grid and play a major role in how both heights and textures behave.

The size of polygon squares directly affects visual quality:
- **Large polygons** result in sharper, more angular terrain and textures, often producing unwanted pointy edges.
- **Small polygons** create smoother terrain and allow textures to blend more naturally.

For best results, it is recommended using smaller polygon sizes, typically **level 4 or 5**, especially on larger maps. This ensures even texture distribution and smoother height transitions.

The order of operations is important:
1. Set polygon resolution  
2. Adjust terrain heights  
3. Apply textures  

Following this sequence prevents texture issues later in the workflow.

---

## Textures and Environment Setup

When starting a new map, it is best to keep the **default texture** applied. Changing textures too early can make terrain adjustments harder and introduce visual noise.

Likewise, the sky and environment settings should remain unchanged at first. The default black background makes terrain edges, rivers, trenches, and elevation changes easier to see and refine. Environment customization is better handled after the terrain itself is finalized.

---

## Key Takeaways

- Soft, gradual terrain is ideal for beginners and produces more visually pleasing maps.
- Smoothing height transitions using **Fixed Height** and **Fixed Relative** is one of the most important steps in the workflow.
- Polygon resolution should always be set before working on heights and textures.
- Avoid advanced or “pro-level” settings until the core tools are fully understood.
- The workflow is designed for speed and simplicity, reflecting that mapmaking and scripting are done alongside other real-life commitments.

---

## Glossary

| Term           | Description                                                         |
|----------------|---------------------------------------------------------------------|
| Heights        | Numerical values that define terrain elevation                      |
| Fixed Height   | Applies a constant height value across the terrain                  |
| Fixed Relative | Tool used to smooth and soften height transitions                   |
| Polygons       | Grid units that determine terrain resolution and texture detail     |
| Texture        | Surface appearance applied to terrain, such as grass, sand, or rock |
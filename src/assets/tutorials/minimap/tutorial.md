This tutorial explains how to create mini maps for user-made maps in *Call to Arms: Gates of Hell*, *Assault Squad 2*,
and *Gates of Hell: Ostfront*. Make sure to also check out the [Keybindings Tutorial](/tutorials/keybindings)
and the [Editor Basics Tutorial](/tutorials/editor-basics).

The tutorial is based on this YouTube video by SturmfuhrerPK:
@[youtube](LEVCFsy0PoY)

## Overview

Mini maps can be generated directly from the map editor using the **Render Mini Map** feature. This method requires
minimal setup, produces clean results, and avoids manual cropping or complex image preparation.

## Key Points

- The method works for **Gates of Hell (Ostfront)**, **Assault Squad 2**, and **Call to Arms**
- Mini maps are rendered via the editor using **Clip mode (F2)**
- In *Assault Squad 2* and *Call to Arms*, mini maps must also be enabled in the **single-player game**, not only in the
  editor
- Mini maps are generated with a **single click** and are automatically cropped and aligned
- The output file is saved in the map’s main directory
    - e.g., ``Call to Arms - Gates of Hell\resource\map\test-map\minimap.png``
- Rendered mini maps can be further edited in external image editors if needed

## Step-by-Step Process

| Step | Description                                                                  |
|------|------------------------------------------------------------------------------|
| 1    | Open the map in the editor and switch to **Clip mode (F2)**                  |
| 2    | Click **Render Mini Map**                                                    |
| 3    | Exit the editor and locate the generated mini map file in the game directory |
| 4    | Check whether water appears correctly                                        |
| 5    | If water is missing, manually add water surfaces                             |
| 6    | Re-render the mini map                                                       |
| 7    | Rename the file if needed to avoid overwriting                               |
| 8    | Optionally edit the image to improve clarity or reduce file size             |

## Water Rendering Behavior

Water created using **ocean mode** in the editor does **not** appear automatically in the rendered mini map. To ensure
water is visible:

- Add water manually via  
  **Landscape → Water → River**
- Re-render the mini map after adding water surfaces

Once added manually, water will appear correctly in the mini map render.

## File Size Considerations

Rendered mini maps are saved as PNG files and can be relatively large.

| Format | Approximate Size | Notes                          |
|--------|------------------|--------------------------------|
| PNG    | ~20–27 MB        | High quality, large file size  |
| JPEG   | Smaller          | Recommended for size reduction |

Converting the image to JPEG can significantly reduce file size while keeping acceptable visual quality.

## Best Practices

- Always check water visibility after rendering
- Rename mini map files before re-rendering to preserve previous versions
- Convert PNG files to JPEG if file size becomes an issue
- Use an image editor only for minor adjustments, not for cropping
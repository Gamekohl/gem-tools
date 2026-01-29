This tutorial demonstrates how to apply animations to individual soldiers or groups of soldiers using the GEM Editor. The focus is on practical mission scripting techniques, using a surrender scenario with German soldiers as a clear and repeatable example.

---

## Tagging Soldiers

The first step is grouping soldiers through **tags**. By assigning the same tag (for example, `German POWs`) to multiple units, animations can later be applied to the entire group with a single command. Tagging is essential for efficient scripting, especially when working with larger numbers of units.

---

## Finding the Correct Animation Name

To apply an animation, the exact animation name must be known:

- Select a soldier in the editor
- Press **U** to open the **Call Function** menu
- Switch to the **Any Play** tab

Here, available animation names are listed. For surrender scenarios, examples include:
- `stand_giveup_1`
- `stand_giveup_2`

These identifiers are used directly in the animation command.


*Since the integrated list in the GEM-Editor isn't the best, we provided you with a better alternative here: [Animations List](/animations)*

---

## Creating a Trigger

A trigger is used to control *when* the animation plays. In this example, a trigger named **German Surrender** is created. This trigger can be activated by an event, timer, or other mission logic, making the animation part of a larger scripted sequence.

---

## Applying the Animation Command

Animations are assigned using:

**On Actor → Animation**

Key configuration steps:
- Select the soldier tag (e.g. `German POWs`)
- Enter the animation name (e.g. `stand_giveup_1`)
- Set the playback speed (commonly `1`)
- Configure looping and timing options

This setup applies the animation to all soldiers with the selected tag at once.

---

## Understanding Cycle Delay

**Cycle delay** is critical for natural-looking animations:

- A cycle delay of `0` causes the animation to restart immediately after finishing, resulting in unnatural and robotic behavior.
- Increasing the cycle delay (for example, to `1000` or `2000` milliseconds) inserts a pause before the animation repeats.
- This pause improves realism and also gives other scripts time to execute without being blocked by constant animation updates.

---

## Using Multiple Animations

The system allows fine-grained control over individual units:

- Assign a different tag to a single soldier (for example, `German POW2`)
- Apply a different animation, such as `stand_giveup_2`
- This creates variation within the same group and avoids visual repetition

---

## Animation Parameters Overview

| Parameter   | Description                             | Example        |
|-------------|-----------------------------------------|----------------|
| Tag Name    | Identifier for one or more soldiers     | German POWs    |
| Animation   | Name of the animation to play           | stand_giveup_1 |
| Speed       | Playback speed of the animation         | 1              |
| Cycle Delay | Pause before animation repeats (ms)     | 1000           |
| Total Time  | Duration of animation (`-1` = infinite) | -1             |
| Flags       | Additional options such as looping      | Loop enabled   |

---

## Workflow Summary

- Place soldiers in the mission and assign tags
- Look up animation names via the Call Function menu (or via the [Animations List](/animations))
- Create a trigger to control when animations start
- Add an animation command referencing the soldier tag
- Adjust cycle delay to prevent unnatural looping
- Optionally vary animations by using different tags

---

## Key Takeaways

- Tagging is the foundation for efficient animation control
- Cycle delay is essential for believable animation behavior
- Both group-level and individual animation control are supported
- Animations integrate cleanly with larger mission scripts
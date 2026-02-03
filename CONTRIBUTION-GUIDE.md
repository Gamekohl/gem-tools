# Contributing Tutorials

Thank you for your interest in contributing tutorials to **GEM-Tools**.
This document explains **how tutorials are structured**, **how to add new ones**, and **what steps are required on GitHub**.

## Table of Contents

- [Overview](#overview)
- [Step 1: Fork the Repository](#step-1-fork-the-repository)
- [Step 2: Create a Tutorial Folder](#step-2-create-a-tutorial-folder)
  - [Naming rules for `<tutorial-id>`](#naming-rules-for-tutorial-id)
- [Step 3: Add the `tutorial.md`](#step-3-add-the-tutorialmd)
- [Step 4: Add Images (Optional)](#step-4-add-images-optional)
- [Step 5: Add YouTube Videos (Optional)](#step-5-add-youtube-videos-optional)
- [Step 6: Register the Tutorial in `index.json`](#step-6-register-the-tutorial-in-indexjson)
  - [Field explanation](#field-explanation)
- [Step 7: Commit Your Changes](#step-7-commit-your-changes)
- [Step 8: Open a Pull Request](#step-8-open-a-pull-request)
- [Guidelines & Best Practices](#guidelines--best-practices)
- [Need Help?](#need-help)

## Overview

Tutorials are stored as **Markdown files** inside the repository. Each tutorial lives in its own folder and must be registered in a central `index.json` file so it can be displayed on the website.

**Basic structure:**

```
src/assets/tutorials/
├─ index.json
├─ my-first-tutorial/
│  ├─ tutorial.md
│  └─ images/
│     └─ example.png
```

## Step 1: Fork the Repository

1. Go to the **GEM-Tools GitHub repository**
2. Click **Fork** (top right)
3. Clone your fork locally:

```
git clone https://github.com/Gamekohl/gem-tools.git
cd gem-tools
```

## Step 2: Create a Tutorial Folder

Inside `src/assets/tutorials/`, create a new folder:

```
src/assets/tutorials/<tutorial-id>/
```

### Naming rules for `<tutorial-id>`

* lowercase only
* use hyphens instead of spaces
* must be **unique**

**Examples:**

* `mapmaking-basics`
* `scripting-ai-intro`

## Step 3: Add the `tutorial.md`

Inside your tutorial folder, create a file named: **tutorial.md**

This file contains the **full tutorial content** written in Markdown. If you are not familiar with Markdown, be sure to check it out here: [Markdown Cheat-Sheet](https://www.markdownguide.org/cheat-sheet/)

To create a Table of contents be sure to use **##** for **headings** and **###** for **subheadings**. For example:

```
## Heading 1
### Subheading 1

## Heading 2
```

## Step 4: Add Images (Optional)

If your tutorial uses images:

1. Create an `images` folder inside your tutorial directory
2. Reference images **relative to the markdown file**

```
my-tutorial/
├─ tutorial.md
└─ images/
   └─ preview.png
```

```md
![Preview](./images/preview.png)
```

## Step 5: Add YouTube Videos (Optional)

It is also possible to embed YouTube Videos in your tutorial. You can do that by adding:
```
@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
```
or just reference the Video-ID:
```
@[youtube](dQw4w9WgXcQ)
```

## Step 6: Register the Tutorial in `index.json`

Open:

```
src/assets/tutorials/index.json
```

Add a new entry **at the end of the array**:

```json
{
  "author": "YourName",
  "id": "my-first-tutorial",
  "title": "My First Tutorial",
  "subtitle": "An Introduction",
  "difficulty": 1,
  "file": "my-first-tutorial/tutorial.md"
}
```

### Field explanation

| Field        | Description                                           |
| ------------ | ------------------------------------------------------|
| `author`     | Your display name                                     |
| `id`         | Must match the folder name                            |
| `title`      | Main title shown on the website                       |
| `subtitle`   | Short description                                     |
| `difficulty` | `1 = Beginner`, `2 = Intermediate`, or `3 = Advanced` |
| `file`       | Relative path to `tutorial.md`                        |

## Step 7: Commit Your Changes

```bash
git add src/assets/tutorials
git commit -m "Add tutorial: My First Tutorial"
git push origin main
```

## Step 8: Open a Pull Request

1. Go to your fork on GitHub
2. Click **Compare & Pull Request**
3. Provide a short description of your tutorial
4. Submit the PR

Your tutorial will be reviewed and merged if everything looks good.

## Guidelines & Best Practices

* Keep tutorials **focused and beginner-friendly**
* Use clear headings and structure
* Prefer short sections over long text blocks
* Credit sources if you adapt existing material
* Make sure image paths are correct

## Need Help?

If anything is unclear:

* Open a GitHub Issue
* Ask for feedback in your Pull Request

We’re happy to help and review early drafts.

Thanks for contributing to GEM-Tools.

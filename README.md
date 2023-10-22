# notebits Outline

## Overview

This library provides a set of components for creating an outline view. It builds on the tree component from the Angular Material library, aiming to make it easy to add full-fledged outliners to Angular projects.

### Demo

For a demo, please check out the [Maptio project](https://www.maptio.com/), where the outliner is used. I aim to add a demo to this library in the future.

### The notebits project

The library was first created as part of the notebits project, where I have been exploring how a digital platform for
note-taking could best support mental health, neurodiversity, and, in general,
support human minds to flourish. I hope to share more about the project in the future.

### Status

Currently, the library is used in production only in the [Maptio project](https://www.maptio.com/). It works well there, but suffers from being adjusted to the specific needs of that project. Over time, I hope to make it more generic and easier to use in other projects.

It is also worth noting that this codebase was extracted from the wider @notebit/notebits monorepo and so, for now, you may encounter some rough edges if you want to extend the library. My hope is that even in this current form it might be useful to others, even if just as code to be copied and pasted into your own project and amended there.

## Getting started

Install the library:

```sh
npm install @notebits/outline
```

Use it in your project:

```html
<notebits-outline
  [outlineData]="outlineData()"
  [selectedItemId]="selectedInitiativeId()"
  [expandItemId]="expandInitiativeId()"
  (selectedItemIdChange)="onSelectedInitiativeIdChange($event)"
  (itemCreated)="onInitiativeCreate($event)"
  (itemEdited)="onInitiativeEdit($event)"
  (itemMoved)="onInitiativeMove($event)"
  (itemDeleted)="onInitiativeDelete($event)"
></notebits-outline>
```

For more details, check out how the library is used in the [Maptio project](https://github.com/maptio/maptio).

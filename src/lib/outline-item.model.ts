export interface OutlineItem {
  id: string;
  value: string;
  createdAt: Date;
}

export interface OutlineItemEditEvent {
  id: string;
  value: string;
}

export interface OutlineItemMoveEvent {
  id: string;
  oldParentId: string | null;
  newParentId: string | null;
  newIndex: number;
}

export interface NotebitBranch extends OutlineItem {
  branches?: NotebitBranch[];
  parent?: NotebitBranch;
  context?: NotebitBranch[][];
}

/*
 * Flattened tree node that has been created from a NotebitBranch through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface NotebitBranchFlat extends NotebitBranch {
  type: string;
  level: number;
  expandable: boolean;
}

export interface NotebitBranchClipboardCopy {
  value: string;
  branches?: NotebitBranchClipboardCopy[];
}

export interface NotebitsOutlineItem {
  id: string;
  value: string;
  children?: NotebitsOutlineItem[];
}

export type NotebitsOutlineData = NotebitsOutlineItem[];

export interface NotebitsOutlineFlatNode {
  id: string;
  value: string;
  level: number;
  expandable: boolean;
}

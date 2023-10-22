import { EventEmitter, Injectable, signal } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';

import {
  NotebitsOutlineFlatNode,
  OutlineItemEditEvent,
} from './outline-item.model';

@Injectable({
  providedIn: 'root',
})
export class OutlineService {
  selectedItemId = signal<string | null>(null);
  draggedItemId = signal<string | null>(null);

  itemExpansionState = new Map<string, boolean>();

  itemEdited$ = new EventEmitter<OutlineItemEditEvent>();
  itemCreated$ = new EventEmitter<string>();
  itemDeleted$ = new EventEmitter<string>();

  treeControl?: FlatTreeControl<NotebitsOutlineFlatNode>;

  selectItem(id: string | null) {
    this.selectedItemId.set(id);
  }

  editItem(itemNode: NotebitsOutlineFlatNode, value: string) {
    itemNode.value = value;
    this.itemEdited$.emit({ id: itemNode.id, value });
  }

  addNewItem(parentId: string) {
    this.itemCreated$.emit(parentId);
  }

  deleteItem(itemId: string) {
    this.itemDeleted$.emit(itemId);
  }

  setItemExpansionState(id: string, isExpanded: boolean) {
    this.itemExpansionState.set(id, isExpanded);
  }

  startDragging(id: string) {
    this.draggedItemId.set(id);
  }

  stopDragging() {
    this.draggedItemId.set(null);
  }

  findNode(id: string): NotebitsOutlineFlatNode | null {
    return this.treeControl?.dataNodes.find((node) => node.id === id) || null;
  }
}

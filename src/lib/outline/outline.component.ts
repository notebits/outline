import {
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
  effect,
  inject,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  NotebitsOutlineData,
  NotebitsOutlineFlatNode,
  NotebitsOutlineItem,
  OutlineItemMoveEvent,
} from '../outline-item.model';
import { OutlineService } from '../outline.service';
import { SelectionChange } from '@angular/cdk/collections';

enum PositionOverNode {
  Above = 'ABOVE',
  Below = 'BELOW',
  Center = 'CENTER',
}

@Component({
  selector: 'notebits-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss'],
})
export class OutlineComponent {
  outlineService = inject(OutlineService);

  @Input()
  get outlineData(): NotebitsOutlineData {
    return this._outlineData;
  }
  set outlineData(outlineData: NotebitsOutlineData) {
    this._outlineData = outlineData ? outlineData : [];
    this.dataSource.data = this._outlineData;

    // TODO: Move to a separate method
    this.outlineService.itemExpansionState.forEach((value, key) => {
      const expandedItem = this.findNode(key);

      if (!expandedItem) {
        return;
      }

      if (value) {
        this.treeControl.expand(expandedItem);
      } else {
        this.treeControl.collapse(expandedItem);
      }
    });
  }
  private _outlineData: NotebitsOutlineData = [];

  @Input()
  get selectedItemId(): string | null {
    return this.outlineService.selectedItemId();
  }
  set selectedItemId(selectedItemId: string | null) {
    this.outlineService.selectItem(selectedItemId);
  }

  @Input()
  set expandItemId(itemId: string) {
    const expandedItem = this.treeControl.dataNodes.find((node) => {
      return node.id === itemId;
    });

    if (!expandedItem) {
      return;
    }

    this.treeControl.expand(expandedItem);
  }

  @Output() selectedItemIdChange = toObservable(
    this.outlineService.selectedItemId
  );
  @Output() itemEdited = this.outlineService.itemEdited$.pipe(
    debounceTime(750),
    distinctUntilChanged()
  );
  @Output() itemCreated = this.outlineService.itemCreated$;
  @Output() itemDeleted = this.outlineService.itemDeleted$;

  treeControl: FlatTreeControl<NotebitsOutlineFlatNode>;
  treeExpansionModel: Signal<
    SelectionChange<NotebitsOutlineFlatNode> | undefined
  >;
  treeFlattener: MatTreeFlattener<NotebitsOutlineItem, NotebitsOutlineFlatNode>;
  dataSource: MatTreeFlatDataSource<
    NotebitsOutlineItem,
    NotebitsOutlineFlatNode
  >;

  // Drag and drop
  @Output() itemMoved = new EventEmitter<OutlineItemMoveEvent>();
  nodeDragged: NotebitsOutlineFlatNode | null = null;
  nodeUnderNodeDragged: NotebitsOutlineFlatNode | null = null;
  DRAG_OVER_WAIT_TIME = 1000; // ms
  dragOverTimeSpent = 0; // ms
  positionOfNodeDraggedOverNodeUnderneath: PositionOverNode | null = null;

  private _transformer = (node: NotebitsOutlineItem, level: number) => {
    return {
      id: node.id,
      value: node.value,
      level: level,
      expandable: !!node.children && node.children.length > 0,
    };
  };

  constructor() {
    this.treeControl = new FlatTreeControl<NotebitsOutlineFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );
    // TODO: Pass into the service via an injection token instead?
    this.outlineService.treeControl = this.treeControl;

    this.treeExpansionModel = toSignal(this.treeControl.expansionModel.changed);

    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children
    );

    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = [];

    effect(() => {
      // TODO: Move this code to the outline service
      const change = this.treeExpansionModel();

      if (!change) {
        return;
      }

      if (change.added) {
        change.added.forEach((node) => {
          this.outlineService.setItemExpansionState(node.id, true);
        });
      }

      if (change.removed) {
        change.removed.forEach((node) => {
          this.outlineService.setItemExpansionState(node.id, false);
        });
      }
    });

    effect(
      () => {
        this.onDragStart(this.outlineService.draggedItemId());
      },
      // TODO: Consider instead moving all this logic into the service!
      { allowSignalWrites: true }
    );
  }

  hasChild = (_: number, node: NotebitsOutlineFlatNode) => node.expandable;

  onDragStart(nodeId: string | null) {
    if (!nodeId) {
      return;
    }

    const node = this.findNode(nodeId);

    if (!node) {
      return;
    }

    this.nodeDragged = node;
    this.treeControl.collapse(node);
  }

  onDragOver(event: any, node: any) {
    event.preventDefault();

    // Check whether the dragged node continues to be dragged over the same node
    if (this.nodeUnderNodeDragged && node === this.nodeUnderNodeDragged) {
      // Expand node if it has another node dragged over it for a while
      if (Date.now() - this.dragOverTimeSpent > this.DRAG_OVER_WAIT_TIME) {
        if (!this.treeControl.isExpanded(node)) {
          this.treeControl.expand(node);
        }
      }
    } else {
      // Reset when dragged node has moved over to another node
      this.nodeUnderNodeDragged = node;
      this.dragOverTimeSpent = Date.now();
    }

    // Check position of node being dragged relative to the position of the
    // node it's being dragged over
    const percentageY = event.offsetY / event.target.clientHeight;
    if (0 <= percentageY && percentageY <= 0.25) {
      this.positionOfNodeDraggedOverNodeUnderneath = PositionOverNode.Above;
    } else if (1 >= percentageY && percentageY >= 0.75) {
      this.positionOfNodeDraggedOverNodeUnderneath = PositionOverNode.Below;
    } else {
      this.positionOfNodeDraggedOverNodeUnderneath = PositionOverNode.Center;
    }
  }

  onDrop(event: DragEvent, node: any) {
    if (this.nodeDragged === null || this.nodeUnderNodeDragged === null) {
      console.error(
        'Aborting drag and drop: either nodeDragged or nodeUnderNodeDragged are null'
      );
      this.onDragEnd(event);
      return;
    }

    if (node === this.nodeDragged) {
      this.onDragEnd(event);
      return;
    }

    const oldParentId = this.getIdOfParentNode(this.nodeDragged);
    const parentOfNodeUnderNodeDragged = this.getIdOfParentNode(
      this.nodeUnderNodeDragged
    );
    const indexOfNodeUnderNodeDragged = this.getIndexAmongSiblings(
      this.nodeUnderNodeDragged
    );

    let newParentId: string | null;
    let newIndex: number;
    switch (this.positionOfNodeDraggedOverNodeUnderneath) {
      case PositionOverNode.Above:
        newParentId = parentOfNodeUnderNodeDragged;
        newIndex = indexOfNodeUnderNodeDragged;
        break;
      case PositionOverNode.Below:
        if (
          this.nodeUnderNodeDragged.expandable &&
          this.treeControl.isExpanded(this.nodeUnderNodeDragged)
        ) {
          // If the node underneath the node being dragged has children and is
          // expanded, drop the dragged node into the children
          newParentId = this.nodeUnderNodeDragged.id;
          newIndex = 0;
        } else {
          // Otherwise, drop the dragged node as a sibling of the node underneath
          newParentId = parentOfNodeUnderNodeDragged;
          newIndex = indexOfNodeUnderNodeDragged + 1;
        }
        break;
      case PositionOverNode.Center:
        newParentId = this.nodeUnderNodeDragged.id;
        newIndex = 0;
        break;
      default:
        console.error('Unknown position of node dragged over node underneath');
        return;
    }

    console.log(newParentId, newIndex);
    console.log('indexOfNodeUnderNodeDragged', indexOfNodeUnderNodeDragged);
    console.log('this.nodeUnderNodeDragged.id', this.nodeUnderNodeDragged.id);

    // Make sure that the node is not dropped into one of its descendants
    const descendants = this.treeControl.getDescendants(this.nodeDragged);
    if (descendants.includes(node)) {
      console.error(
        'Aborting drag and drop: dropped node into its descendants'
      );
      this.onDragEnd(event);
      return;
    }

    this.itemMoved.emit({
      id: this.nodeDragged.id,
      oldParentId,
      newParentId,
      newIndex,
    });

    // Expand descendants
    const parentNode = this.treeControl.dataNodes.find(
      (dataNode) => dataNode.id === newParentId
    );
    if (parentNode) {
      this.treeControl.expand(parentNode);
    }

    this.onDragEnd(event);
  }

  onDragEnd(event: DragEvent) {
    this.outlineService.stopDragging();

    this.nodeDragged = null;
    this.nodeUnderNodeDragged = null;
    this.dragOverTimeSpent = 0;
    this.positionOfNodeDraggedOverNodeUnderneath = null;

    event.preventDefault();
  }

  getStyle(node: any) {
    if (this.nodeDragged === node) {
      return 'drag-start';
    } else if (this.nodeUnderNodeDragged === node) {
      switch (this.positionOfNodeDraggedOverNodeUnderneath) {
        case PositionOverNode.Above:
          return 'drop-above';
        case PositionOverNode.Below:
          return 'drop-below';
        case PositionOverNode.Center:
          return 'drop-center';
        default:
          // Handle null case...?
          return '';
      }
    } else {
      return '';
    }
  }

  findNode(id: string): NotebitsOutlineFlatNode | null {
    return this.treeControl.dataNodes.find((node) => node.id === id) || null;
  }

  private getIdOfParentNode(node: NotebitsOutlineFlatNode): string | null {
    if (node.level === 0) {
      return null;
    }

    // Get index of node in dataNodes array
    const nodeIndex = this.treeControl.dataNodes.findIndex(
      (dataNode) => dataNode.id === node.id
    );

    // Walk through the data nodes in reverse order starting from the index and
    // find the first node that has a level one less than the node's level
    for (let i = nodeIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level === node.level - 1) {
        return currentNode.id;
      }
    }

    return null;
  }

  /**
   * Get the index of a node in the children array of its parent node
   */
  private getIndexAmongSiblings(node: NotebitsOutlineFlatNode) {
    console.log(this.outlineData);

    // If the node is a root node, we can trivially find its position just by
    // looking at the original (nested) data
    if (node.level === 0) {
      return this.outlineData.findIndex((dataNode) => dataNode.id === node.id);
    }

    // If the node is a child of another node, we can find its position by
    // looking at the data nodes in the tree control
    const nodeIndex = this.treeControl.dataNodes.findIndex(
      (dataNode) => dataNode.id === node.id
    );

    // Walk through the data nodes in reverse order starting from the index and
    // find the first node that has a level one less than the node's level
    let nodeIndexAmongSiblings = 0;
    for (let i = nodeIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level === node.level - 1) {
        break;
      }

      // Only count siblings
      if (currentNode.level === node.level) {
        nodeIndexAmongSiblings++;
      }
    }

    return nodeIndexAmongSiblings - 1;
  }
}

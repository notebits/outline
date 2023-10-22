import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';

import { NotebitBranchFlat } from '../outline-item.model';
import { OutlineService } from '../outline.service';
import { MatMenuTrigger } from '@angular/material/menu';
// import { OutlineViewService } from '../outline-view.service';

@Component({
  selector: 'notebits-outline-item-menu',
  templateUrl: './outline-item-menu.component.html',
  styleUrls: ['./outline-item-menu.component.scss'],
})
export class OutlineItemMenuComponent {
  outlineService = inject(OutlineService);

  @Input() item!: NotebitBranchFlat;
  @Output() editPressed = new EventEmitter<void>();

  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

  editItem(event: Event) {
    this.editPressed.emit();

    event.stopPropagation();
    this.trigger.closeMenu();
  }

  addNewItem() {
    this.outlineService.addNewItem(this.item.id);
  }

  deleteItem() {
    this.outlineService.deleteItem(this.item.id);
  }

  onMenuTriggerClick(event: Event) {
    event.stopPropagation();
  }
}

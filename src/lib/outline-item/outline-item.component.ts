import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import { NotebitBranchFlat } from '../outline-item.model';
import { OutlineService } from '../outline.service';

@Component({
  selector: 'notebits-outline-item',
  templateUrl: './outline-item.component.html',
  styleUrls: ['./outline-item.component.scss'],
})
export class OutlineItemComponent {
  outlineService = inject(OutlineService);

  @Input() notebit!: NotebitBranchFlat;
  @Input() hasChildren = false;
  @Input() isExpanded = false;

  // Focus in on the input when it is created
  @ViewChild('notebitValue') set input(inputElementRef: ElementRef) {
    if (inputElementRef) {
      inputElementRef.nativeElement.focus();
    }
  }

  isBeingEdited = signal(false);
  isDraggable = computed((): boolean => {
    return !this.isBeingEdited();
  });

  isSelected = computed((): boolean => {
    return this.outlineService.selectedItemId() === this.notebit.id;
  });

  onClick() {
    if (this.isSelected()) {
      this.isBeingEdited.set(true);
    } else {
      this.outlineService.selectItem(this.notebit.id);
    }
  }

  // onClickOutside() {
  // console.log('onClickOutside', this.notebit.id);
  // this.isBeingEdited.set(false);
  // }

  onDragStart(event: DragEvent) {
    // Required by Firefox
    // (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer?.setData('foo', 'bar');

    this.outlineService.startDragging(this.notebit.id);
  }

  onBlur(event: FocusEvent) {
    this.isBeingEdited.set(false);
  }

  onEditPressed() {
    this.outlineService.selectItem(this.notebit.id);
    this.isBeingEdited.set(true);
  }

  onKeyup(currentValue: string) {
    this.outlineService.editItem(this.notebit, currentValue);
  }
}

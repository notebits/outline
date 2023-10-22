import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { NgClickOutsideDirective } from 'ng-click-outside2';

import { OutlineComponent } from './outline/outline.component';
import { OutlineItemComponent } from './outline-item/outline-item.component';
import { OutlineItemMenuComponent } from './outline-item-menu/outline-item-menu.component';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    NgClickOutsideDirective,
  ],
  declarations: [
    OutlineComponent,
    OutlineItemComponent,
    OutlineItemMenuComponent,
  ],
  exports: [OutlineComponent],
})
export class OutlineModule {}

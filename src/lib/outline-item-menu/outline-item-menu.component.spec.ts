import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlineItemMenuComponent } from './outline-item-menu.component';

describe('OutlineItemMenuComponent', () => {
  let component: OutlineItemMenuComponent;
  let fixture: ComponentFixture<OutlineItemMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OutlineItemMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OutlineItemMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

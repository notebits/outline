import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlineItemComponent } from './outline-item.component';

describe('OutlineItemComponent', () => {
  let component: OutlineItemComponent;
  let fixture: ComponentFixture<OutlineItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OutlineItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OutlineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

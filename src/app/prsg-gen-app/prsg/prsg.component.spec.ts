import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrsgComponent } from './prsg.component';

describe('PrsgComponent', () => {
  let component: PrsgComponent;
  let fixture: ComponentFixture<PrsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrsgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

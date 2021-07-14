import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrsgGenAppComponent } from './prsg-gen-app.component';

describe('PrsgGenAppComponent', () => {
  let component: PrsgGenAppComponent;
  let fixture: ComponentFixture<PrsgGenAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrsgGenAppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrsgGenAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

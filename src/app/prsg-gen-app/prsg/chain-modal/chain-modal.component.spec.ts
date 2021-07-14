import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainModalComponent } from './chain-modal.component';

describe('ChainModalComponent', () => {
  let component: ChainModalComponent;
  let fixture: ComponentFixture<ChainModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChainModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSection } from './input-section';

describe('InputSection', () => {
  let component: InputSection;
  let fixture: ComponentFixture<InputSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

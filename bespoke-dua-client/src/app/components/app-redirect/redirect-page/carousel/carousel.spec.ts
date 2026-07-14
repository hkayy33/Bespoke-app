import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carousel } from './carousel';

describe('Carousel', () => {
  let component: Carousel;
  let fixture: ComponentFixture<Carousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Carousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goTo should set currentIndex when in range', () => {
    component.goTo(2);
    expect(component.currentIndex).toBe(2);
    component.goTo(-1);
    expect(component.currentIndex).toBe(2);
    component.goTo(99);
    expect(component.currentIndex).toBe(2);
  });
});

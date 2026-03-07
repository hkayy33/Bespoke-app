import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuaResultCard } from './dua-result-card';

describe('DuaResultCard', () => {
  let component: DuaResultCard;
  let fixture: ComponentFixture<DuaResultCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuaResultCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuaResultCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

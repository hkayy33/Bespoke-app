import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuaResultList } from './dua-result-list';

describe('DuaResultList', () => {
  let component: DuaResultList;
  let fixture: ComponentFixture<DuaResultList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuaResultList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuaResultList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

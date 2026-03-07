import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuaResult } from './dua-result';

describe('DuaResult', () => {
  let component: DuaResult;
  let fixture: ComponentFixture<DuaResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuaResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuaResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectPage } from './redirect-page';

describe('RedirectPage', () => {
  let component: RedirectPage;
  let fixture: ComponentFixture<RedirectPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedirectPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedirectPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

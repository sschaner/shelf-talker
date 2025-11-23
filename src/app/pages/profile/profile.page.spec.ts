import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfilePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

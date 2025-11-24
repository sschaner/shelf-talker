import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileEditPage } from './profile-edit.page';

describe('ProfileEditPage', () => {
  let component: ProfileEditPage;
  let fixture: ComponentFixture<ProfileEditPage>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfileEditPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

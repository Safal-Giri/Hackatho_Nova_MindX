import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPersonComponent } from './register-person.component';

describe('RegisterPersonComponent', () => {
  let component: RegisterPersonComponent;
  let fixture: ComponentFixture<RegisterPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

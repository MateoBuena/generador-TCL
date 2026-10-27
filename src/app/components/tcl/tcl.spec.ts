import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TCL } from './tcl';

describe('TCL', () => {
  let component: TCL;
  let fixture: ComponentFixture<TCL>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TCL],
    }).compileComponents();

    fixture = TestBed.createComponent(TCL);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

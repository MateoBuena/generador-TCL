import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonPDF } from './button-pdf';

describe('ButtonPDF', () => {
  let component: ButtonPDF;
  let fixture: ComponentFixture<ButtonPDF>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonPDF],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonPDF);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

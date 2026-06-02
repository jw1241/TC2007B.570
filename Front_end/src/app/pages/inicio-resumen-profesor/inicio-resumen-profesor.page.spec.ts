import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioResumenProfesorPage } from './inicio-resumen-profesor.page';

describe('InicioResumenProfesorPage', () => {
  let component: InicioResumenProfesorPage;
  let fixture: ComponentFixture<InicioResumenProfesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioResumenProfesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

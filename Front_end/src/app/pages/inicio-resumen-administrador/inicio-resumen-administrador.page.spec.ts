import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioResumenAdministradorPage } from './inicio-resumen-administrador.page';

describe('InicioResumenAdministradorPage', () => {
  let component: InicioResumenAdministradorPage;
  let fixture: ComponentFixture<InicioResumenAdministradorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioResumenAdministradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

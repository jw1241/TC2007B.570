import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IniciarSesionPage } from './iniciar-sesion.page';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

describe('IniciarSesionPage', () => {
  let component: IniciarSesionPage;
  let fixture: ComponentFixture<IniciarSesionPage>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      login: jasmine.createSpy('login'),
      logout: jasmine.createSpy('logout'),
      getProfile: jasmine.createSpy('getProfile'),
      redirectByRole: jasmine.createSpy('redirectByRole')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FormsModule, IniciarSesionPage],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IniciarSesionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to register page', () => {
    component.Registro();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/registro']);
  });

  it('should navigate to recover password page', () => {
    component.recuperarcontrasena();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/recuperar-contrasena']);
  });

  it('should alert if login fails', fakeAsync(() => {
    spyOn(window, 'alert');
    authServiceMock.login.and.returnValue(Promise.resolve({ success: false, error: 'Auth failed' }));
    
    component.identifier = 'test@test.com';
    component.password = 'password';
    component.iniciarSesion();
    tick();

    expect(window.alert).toHaveBeenCalledWith('Auth failed');
    expect(component.isLoading).toBeFalse();
  }));

  it('should logout and alert if profile is missing after login', fakeAsync(() => {
    spyOn(window, 'alert');
    authServiceMock.login.and.returnValue(Promise.resolve({ success: true }));
    authServiceMock.getProfile.and.returnValue(Promise.resolve(null));
    authServiceMock.logout.and.returnValue(Promise.resolve());

    component.identifier = 'test@test.com';
    component.password = 'password';
    component.iniciarSesion();
    tick();

    expect(window.alert).toHaveBeenCalledWith('Tu usuario no tiene un perfil asociado. Contacta al administrador.');
    expect(authServiceMock.logout).toHaveBeenCalled();
  }));

  it('should successfully login, store rememberMe, and redirect', fakeAsync(() => {
    authServiceMock.login.and.returnValue(Promise.resolve({ success: true }));
    authServiceMock.getProfile.and.returnValue(Promise.resolve({ id: 'user123', rol_id: 2 }));
    
    component.identifier = 'teacher@test.com';
    component.password = 'pass123';
    component.rememberMe = true;

    component.iniciarSesion();
    tick();

    expect(localStorage.getItem('rememberedEmail')).toBe('teacher@test.com');
    expect(localStorage.getItem('user_id')).toBe('user123');
    expect(authServiceMock.redirectByRole).toHaveBeenCalledWith(2);
    expect(component.isLoading).toBeFalse();
  }));
});

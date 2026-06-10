import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase';
import { ApiService } from './api';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: any;
  let mockSupabase: any;
  let mockApi: any;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockSupabase = {
      supabase: {
        auth: {
          signInWithPassword: jasmine.createSpy('signInWithPassword'),
          getUser: jasmine.createSpy('getUser'),
          signOut: jasmine.createSpy('signOut')
        }
      }
    };

    mockApi = {
      get: jasmine.createSpy('get')
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: SupabaseService, useValue: mockSupabase },
        { provide: ApiService, useValue: mockApi }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return error if Supabase auth fails', async () => {
    const errorMsg = 'Invalid login credentials';
    mockSupabase.supabase.auth.signInWithPassword.and.returnValue(Promise.resolve({
      data: { user: null },
      error: { message: errorMsg }
    }));

    const result = await service.login('test@test.com', 'password');
    expect(result.success).toBeFalse();
    expect(result.error).toBe(errorMsg);
  });

  it('should fetch profile after successful login', async () => {
    mockSupabase.supabase.auth.signInWithPassword.and.returnValue(Promise.resolve({
      data: { user: { id: 'auth-123', email: 'test@test.com' } },
      error: null
    }));

    const mockProfile = { id: 'profile-123', nombre_completo: 'Test User' };
    mockApi.get.and.returnValue(Promise.resolve({ user: mockProfile }));

    const result = await service.login('test@test.com', 'password');
    
    expect(result.success).toBeTrue();
    expect(result.user?.id).toBe('auth-123');
    expect(result.profile).toEqual(mockProfile);
    expect(localStorage.getItem('user_id')).toBe('profile-123');
  });

  it('should clear localStorage and navigate to login on logout', async () => {
    localStorage.setItem('user_id', 'test');
    mockSupabase.supabase.auth.signOut.and.returnValue(Promise.resolve());

    await service.logout();

    expect(mockSupabase.supabase.auth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem('user_id')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/iniciar-sesion'], { replaceUrl: true });
  });

  it('should redirect appropriately based on roles', async () => {
    await service.redirectByRole(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inicio-resumen-administrador']);

    await service.redirectByRole(2);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inicio-resumen-profesor']);

    await service.redirectByRole(3);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/seleccionar-alumno']);

    await service.redirectByRole(99); // default
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/iniciar-sesion']);
  });
});

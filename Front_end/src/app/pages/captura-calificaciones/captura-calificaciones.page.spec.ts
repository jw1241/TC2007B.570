import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CapturaCalificacionesPage } from './captura-calificaciones.page';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

describe('CapturaCalificacionesPage', () => {
  let component: CapturaCalificacionesPage;
  let fixture: ComponentFixture<CapturaCalificacionesPage>;
  let apiServiceMock: any;
  let authServiceMock: any;
  let toastCtrlMock: any;
  let navCtrlMock: any;

  beforeEach(async () => {
    apiServiceMock = {
      get: jasmine.createSpy('get'),
      put: jasmine.createSpy('put'),
      post: jasmine.createSpy('post')
    };

    authServiceMock = {
      getProfile: jasmine.createSpy('getProfile').and.returnValue(Promise.resolve({ id: 'docente123' })),
      logout: jasmine.createSpy('logout')
    };

    toastCtrlMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve() }))
    };

    navCtrlMock = {
      navigateRoot: jasmine.createSpy('navigateRoot')
    };

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FormsModule, CapturaCalificacionesPage],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastController, useValue: toastCtrlMock },
        { provide: NavController, useValue: navCtrlMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CapturaCalificacionesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load materias and periodos on init', fakeAsync(() => {
    apiServiceMock.get.withArgs('/teacher/docente123/clases').and.returnValue(Promise.resolve([{ id: 'm1' }]));
    apiServiceMock.get.withArgs('/periodos').and.returnValue(Promise.resolve([{ id: 'p1' }]));

    component.ngOnInit();
    tick();

    expect(authServiceMock.getProfile).toHaveBeenCalled();
    expect(component.docenteId).toBe('docente123');
    expect(component.materias.length).toBe(1);
    expect(component.periodos.length).toBe(1);
  }));

  it('should load alumnos when a materia and periodo are selected', fakeAsync(() => {
    component.materiaSeleccionada = { materia_id: 'm1', grupo_id: 'g1' };
    component.periodoSeleccionado = { id: 'p1' };
    
    const mockAlumnos = [{ id: 'a1', tareas: [] }];
    apiServiceMock.get.withArgs('/teacher/materia/m1/grupo/g1/periodo/p1').and.returnValue(Promise.resolve(mockAlumnos));
    apiServiceMock.get.withArgs('/teacher/periodos/p1/firmas').and.returnValue(Promise.resolve([]));

    component.seleccionarMateria(component.materiaSeleccionada);
    tick();
    
    expect(component.alumnos).toEqual(mockAlumnos);
  }));

  it('should aggregate put requests when saving changes', fakeAsync(() => {
    component.periodoSeleccionado = { id: 'p1' };
    component.materiaSeleccionada = { materia_id: 'm1' };
    component.alumnos = [
      { id: 'a1', tareas: [{ id: 't1', tarea: 'Examen', nota: 10, comentario: 'Ok' }] }
    ];
    
    apiServiceMock.put.and.returnValue(Promise.resolve());

    component.guardarCambios();
    tick();

    expect(apiServiceMock.put).toHaveBeenCalledWith('/teacher/calificaciones', {
      id: 't1',
      alumno_id: 'a1',
      materia_id: 'm1',
      periodo_id: 'p1',
      tarea: 'Examen',
      nota: 10,
      comentario: 'Ok'
    });
    expect(toastCtrlMock.create).toHaveBeenCalledWith(jasmine.objectContaining({ message: 'Calificaciones guardadas', color: 'success' }));
  }));

  it('should publish boletas and show success toast', fakeAsync(() => {
    component.periodoSeleccionado = { id: 'p1' };
    component.docenteId = 'doc123';
    apiServiceMock.post.and.returnValue(Promise.resolve());

    component.publicarBoletas();
    tick();

    expect(apiServiceMock.post).toHaveBeenCalledWith('/teacher/periodos/p1/publicar', { usuarioId: 'doc123' });
    expect(toastCtrlMock.create).toHaveBeenCalledWith(jasmine.objectContaining({ message: 'Boletas publicadas correctamente', color: 'success' }));
  }));

  it('should add an empty task properly', () => {
    const alumno: any = {};
    component.agregarTarea(alumno);
    
    expect(alumno.tareas.length).toBe(1);
    expect(alumno.tareas[0].nota).toBeNull();
  });
});

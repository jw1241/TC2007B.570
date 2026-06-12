import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoletaPage } from './boleta.page';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student';

// Mock simple de servicios
class MockApiService {
  get() {
    return Promise.resolve({ data: [] });
  }
}

class MockAuthService {
  logout() {
    return Promise.resolve();
  }
}

class MockStudentService {
  getAlumno() {
    return { id: '123', nombre: 'Test' };
  }
}

describe('BoletaPage Unit Tests', () => {
  let component: BoletaPage;
  let fixture: ComponentFixture<BoletaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), BoletaPage],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: StudentService, useClass: MockStudentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoletaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // Más aserciones según los métodos internos de tu página...
  it('debería consultar la boleta al iniciar', async () => {
    const api = TestBed.inject(ApiService);
    spyOn(api, 'get').and.callThrough();
    
    // Suponiendo que llamas a getBoleta en ngOnInit o ionViewWillEnter
    if (component.ngOnInit) {
      await component.ngOnInit();
    }
    
    expect(api.get).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api';
import { environment } from 'src/environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform a GET request and append baseUrl', async () => {
    const mockData = { test: 'value' };
    
    // Call the service method
    const promise = service.get('/test-endpoint');

    // Expect a single request to the constructed URL
    const req = httpMock.expectOne(`${environment.apiUrl}/test-endpoint`);
    expect(req.request.method).toBe('GET');

    // Respond with mock data
    req.flush(mockData);

    // Wait for promise to resolve
    const res = await promise;
    expect(res).toEqual(mockData as any);
  });

  it('should perform a POST request with body', async () => {
    const mockBody = { user: 1 };
    const mockResponse = { success: true };
    
    const promise = service.post('/post-endpoint', mockBody);

    const req = httpMock.expectOne(`${environment.apiUrl}/post-endpoint`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBody);

    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse as any);
  });

  it('should handle HTTP errors gracefully by extracting error message', async () => {
    const errorMessage = 'Invalid credentials';
    
    const promise = service.get('/error-endpoint');

    const req = httpMock.expectOne(`${environment.apiUrl}/error-endpoint`);
    
    req.flush(
      { error: { message: errorMessage } },
      { status: 400, statusText: 'Bad Request' }
    );

    try {
      await promise;
      fail('Promise should have been rejected');
    } catch (err: any) {
      expect(err.message).toBe(errorMessage);
    }
  });
});

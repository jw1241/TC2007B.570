describe('Flujos de UAT - La Luz', () => {

  beforeEach(() => {
    // Interceptamos peticiones a Supabase si queremos mockear 
    // o dejamos que conecte a localhost si levantamos ambos servers.
    // Asumimos que la app corre en localhost:4200 (Angular/Ionic default)
  });

  describe('RF07, RF08, RNF03: Flujo del Padre (Iniciar sesión, descargar y firmar)', () => {
    
    it('Debe permitir iniciar sesión con credenciales válidas y requerir < 3 clics para firmar boleta', () => {
      cy.visit('http://localhost:4200/iniciar-sesion');

      // EP01_InciaSesiónExitosa
      cy.get('input[type="email"]').type('padre@ejemplo.com');
      cy.get('input[type="password"]').type('Password123!');
      cy.get('ion-button').contains('Iniciar Sesión').click();

      // Debería redirigir al resumen del padre / alumno
      cy.url().should('include', '/inicio-resumen-alumno');

      // Click 1: Entrar a la sección de la boleta
      cy.get('ion-item').contains('Boleta de Calificaciones').click();
      cy.url().should('include', '/boleta');

      // Comprobar visualización de boleta
      cy.get('.boleta-container').should('be.visible');

      // Validar RNF03: Firmar con un solo clic adicional desde aquí (Total = 2 interacciones)
      cy.get('ion-button').contains('Firmar de Enterado').click();

      // EP01_FirmaExitosa
      cy.get('.toast-message').should('contain', 'Firma registrada con éxito');
      cy.get('ion-button').contains('Firmar de Enterado').should('be.disabled');
    });

  });

  describe('RF01, RF03, RF04: Flujo del Docente', () => {

    it('Debe permitir al docente iniciar sesión, consultar clases y capturar notas', () => {
      cy.visit('http://localhost:4200/iniciar-sesion');

      // Login Profesor
      cy.get('input[type="email"]').type('profesor@ejemplo.com');
      cy.get('input[type="password"]').type('Password123!');
      cy.get('ion-button').contains('Iniciar Sesión').click();

      cy.url().should('include', '/inicio-resumen-profesor');

      // Consultar Clases (RF03)
      cy.get('ion-item').contains('Captura de Calificaciones').click();
      cy.url().should('include', '/captura-calificaciones');

      // Modificar/Consultar notas (RF04)
      // Seleccionamos un grupo del dropdown/select (ionic-select)
      cy.get('ion-select[name="grupo"]').click();
      cy.get('ion-select-option').contains('1° A').click();

      // Modificamos calificación de un alumno
      cy.get('ion-input[name="calificacion-alumno-1"]').clear().type('9.5');
      cy.get('ion-button').contains('Guardar').click();

      // EP01_RegistroExitoso
      cy.get('.toast-message').should('contain', 'Calificaciones actualizadas');
    });
  });

  describe('Excepciones y Seguridad (UI)', () => {
    it('EEX01_CredencialIncorrecta - Login Fallido', () => {
      cy.visit('http://localhost:4200/iniciar-sesion');

      cy.get('input[type="email"]').type('invalido@ejemplo.com');
      cy.get('input[type="password"]').type('1234');
      cy.get('ion-button').contains('Iniciar Sesión').click();

      cy.get('.error-message').should('contain', 'Credenciales incorrectas');
      cy.url().should('include', '/iniciar-sesion');
    });
  });

});

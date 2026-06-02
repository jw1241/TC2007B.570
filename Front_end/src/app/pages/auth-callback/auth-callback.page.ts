import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';

@Component({
selector: 'app-auth-callback',
templateUrl: './auth-callback.page.html',
styleUrls: ['./auth-callback.page.scss'],
standalone: true,
imports: [
CommonModule,
FormsModule,
IonContent
]
})
export class AuthCallbackPage implements OnInit {

password = '';
confirmPassword = '';

showPassword = false;
showConfirmPassword = false;

loading = false;

passwordRules = {
length: false,
upper: false,
lower: false,
number: false,
special: false
};

constructor(
private supabaseService: SupabaseService,
private router: Router
) {}

async ngOnInit() {

  const { data, error } =
    await this.supabaseService.supabase.auth.getSession();

  if (!data.session) {

    // IMPORTANT: try to recover session from URL
    await this.supabaseService.supabase.auth.exchangeCodeForSession(
      window.location.href
    );
  }

  const { data: userData } =
    await this.supabaseService.supabase.auth.getUser();

  console.log('User:', userData);

}

checkPassword() {


this.passwordRules.length =
  this.password.length >= 12;

this.passwordRules.upper =
  /[A-Z]/.test(this.password);

this.passwordRules.lower =
  /[a-z]/.test(this.password);

this.passwordRules.number =
  /[0-9]/.test(this.password);

this.passwordRules.special =
  /[^A-Za-z0-9]/.test(this.password);


}

validatePassword(): boolean {


return (
  this.passwordRules.length &&
  this.passwordRules.upper &&
  this.passwordRules.lower &&
  this.passwordRules.number &&
  this.passwordRules.special
);

}

async updatePassword() {

  try {

    console.log('STEP 1');

    const supabase =
      this.supabaseService.supabase;

    // CHECK USER
    const {
      data: { user },
      error: userError
    } =
      await supabase.auth.getUser();

    console.log('STEP 2');
    console.log('USER:', user);
    console.log('USER ERROR:', userError);

    if (!user) {

      alert(
        'Sesión inválida.'
      );

      return;
    }

    // PASSWORD MATCH
    if (this.password !== this.confirmPassword) {

      alert(
        'Las contraseñas no coinciden'
      );

      return;
    }

    console.log('STEP 3');

    // UPDATE PASSWORD
    const {
      data: passwordData,
      error: passwordError
    } =
      await supabase.auth.updateUser({

        password: this.password

      });

    const loginTest =
  await supabase.auth.signInWithPassword({

    email: user.email!,
    password: this.password

  });

console.log('LOGIN TEST:', loginTest);

    console.log('STEP 4');
    console.log('PASSWORD DATA:', passwordData);
    console.log('PASSWORD ERROR:', passwordError);

    const sessionCheck =
  await supabase.auth.getSession();

console.log(sessionCheck);

    if (passwordError) {

      alert(
        passwordError.message
      );

      return;
    }

    console.log('STEP 5');

    // UPDATE PROFILE
    const {
      data: updatedUser,
      error: updateError
    } =
      await supabase
        .from('usuarios')
        .update({

          activo: true,
          activado_en:
            new Date().toISOString()

        })
        .eq('id', user.id)
        .select();

    console.log('STEP 6');
    console.log('UPDATED USER:', updatedUser);
    console.log('UPDATE ERROR:', updateError);

    alert(
      'Cuenta activada correctamente'
    );

    await supabase.auth.signOut();

    this.router.navigate([
      '/iniciar-sesion'
    ]);

  } catch (err) {

    console.error(
      'FULL ERROR:',
      err
    );

  }

}

}

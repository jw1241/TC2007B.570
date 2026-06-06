import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';

import { ApiService } from '../../services/api';

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
    private router: Router,
    private api: ApiService
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

    // UPDATE PASSWORD VIA SECURE BACKEND API
    await this.api.post('/auth/update-password', {
      newPassword: this.password
    });

    console.log('STEP 4');

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

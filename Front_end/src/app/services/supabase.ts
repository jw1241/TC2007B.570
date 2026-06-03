import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://gdfdagwhzxkmjolamyvf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZmRhZ3doenhrbWpvbGFteXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDYzODYsImV4cCI6MjA5NDcyMjM4Nn0.i91yfqoBiMkdt4UL9YMf4lRkBtkStOjxBzGxx7DcPXI'
    );

  }

}
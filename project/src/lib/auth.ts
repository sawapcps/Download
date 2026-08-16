import { supabase } from './supabase';

export const auth = {
  async signUpCustomer(email: string, password: string, phone: string, fullName: string, city: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'customer', phone, full_name: fullName, city }
      }
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        phone,
        full_name: fullName,
        city
      });
    }

    return data;
  },

  async signUpDriver(email: string, password: string, phone: string, fullName: string, city: string, vehicleInfo?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'driver', phone, full_name: fullName, city }
      }
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('drivers').insert({
        id: data.user.id,
        email,
        phone,
        full_name: fullName,
        city,
        vehicle_info: vehicleInfo || ''
      });
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

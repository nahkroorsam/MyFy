import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Profile } from '../types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Failed to load profile');
    } else {
      setProfile(data as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateIncome = async (monthly_income: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ monthly_income })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update income');
    } else {
      setProfile(prev => prev ? { ...prev, monthly_income } : prev);
      toast.success('Income updated!');
    }
  };

  return { profile, loading, updateIncome };
}

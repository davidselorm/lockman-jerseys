import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { StoreSettings } from '@/types';

export async function GET() {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, settings: data });
      }
    }
  }

  return NextResponse.json({ success: true, mode: 'local' });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (!supabase) {
        return NextResponse.json({ error: 'Supabase unavailable' }, { status: 500 });
      }

      // Check if a row exists in store_settings
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let savedSettings: StoreSettings;

      if (existing) {
        const { data: updated, error: updateErr } = await supabase
          .from('store_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateErr) {
          throw updateErr;
        }
        savedSettings = updated;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('store_settings')
          .insert({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr) {
          throw insertErr;
        }
        savedSettings = inserted;
      }

      return NextResponse.json({ success: true, settings: savedSettings });
    }

    return NextResponse.json({ success: true, mode: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

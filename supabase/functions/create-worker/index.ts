import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { request_id, worker_email, worker_temp_password, worker_full_name, jefe_id } = await req.json()

    if (!request_id || !worker_email || !worker_temp_password || !worker_full_name || !jefe_id) {
      throw new Error("Faltan parámetros requeridos en la solicitud.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Crear el nuevo usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: worker_email,
      password: worker_temp_password,
      email_confirm: true,
      user_metadata: {
        full_name: worker_full_name,
      }
    })

    if (authError) throw authError

    const newUserId = authData.user.id

    // 2. Obtener el nombre del comercio del jefe para heredarlo
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('commerce_name')
      .eq('id', jefe_id)
      .single()
    
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw profileError;
    }
    
    if (!profileData) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error(`No se encontró el perfil para el jefe con ID: ${jefe_id}`);
    }

    // 3. Crear el perfil del nuevo usuario en la tabla 'profiles'
    const { error: insertProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        full_name: worker_full_name,
        role: 'cajero',
        commerce_name: profileData.commerce_name
      })

    if (insertProfileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw insertProfileError;
    }

    // 4. Actualizar el estado de la solicitud a 'approved'
    const { error: requestError } = await supabaseAdmin
      .from('worker_requests')
      .update({ status: 'approved' })
      .eq('id', request_id)

    if (requestError) {
      console.warn(`No se pudo actualizar el estado de la solicitud ${request_id}: ${requestError.message}`);
    }

    return new Response(JSON.stringify({ message: 'Trabajador creado con éxito' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
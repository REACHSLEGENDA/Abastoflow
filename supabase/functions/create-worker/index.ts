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

    // 1. Obtener el nombre del comercio del jefe.
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('commerce_name')
      .eq('id', jefe_id)
      .single()
    
    if (profileError || !profileData) {
      throw profileError || new Error(`No se encontró el perfil para el jefe con ID: ${jefe_id}`);
    }

    // 2. Intentar crear el nuevo usuario.
    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: worker_email,
      password: worker_temp_password,
      email_confirm: true,
      user_metadata: {
        full_name: worker_full_name,
        commerce_name: profileData.commerce_name,
        role: 'cajero'
      }
    })

    // Si el error es que el usuario ya existe ("User already registered"), lo ignoramos y continuamos.
    // Si es cualquier otro error, lo lanzamos para que falle la función.
    if (authError && !authError.message.includes('User already registered')) {
      throw authError
    }

    // 3. Actualizar el estado de la solicitud a 'approved'
    const { error: requestError } = await supabaseAdmin
      .from('worker_requests')
      .update({ status: 'approved' })
      .eq('id', request_id)

    if (requestError) {
      console.error(`Error al actualizar la solicitud ${request_id}: ${requestError.message}`);
    }

    return new Response(JSON.stringify({ message: 'Trabajador creado y aprobado con éxito' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Devolvemos el mensaje de error real para un mejor diagnóstico en el cliente.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
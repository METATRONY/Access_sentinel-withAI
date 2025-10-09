import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { method, action, policyData } = await req.json()

    if (method === 'GET') {
      const { data: policies, error } = await supabaseClient
        .from('content_policies')
        .select(`
          *,
          categories:policy_categories(*),
          keywords:policy_keywords(*),
          domains:policy_domains(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ policies }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'POST') {
      const { data: policy, error: policyError } = await supabaseClient
        .from('content_policies')
        .insert({
          user_id: user.id,
          name: policyData.name,
          description: policyData.description,
          is_active: policyData.is_active,
        })
        .select()
        .single()

      if (policyError) throw policyError

      if (policyData.categories) {
        const categories = policyData.categories.map((cat: any) => ({
          policy_id: policy.id,
          ...cat
        }))
        await supabaseClient.from('policy_categories').insert(categories)
      }

      return new Response(JSON.stringify({ policy }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'PUT') {
      await supabaseClient
        .from('content_policies')
        .update({
          name: policyData.name,
          description: policyData.description,
          is_active: policyData.is_active,
        })
        .eq('id', policyData.id)
        .eq('user_id', user.id)

      await supabaseClient.from('policy_categories').delete().eq('policy_id', policyData.id)
      
      if (policyData.categories) {
        const categories = policyData.categories.map((cat: any) => ({
          policy_id: policyData.id,
          ...cat
        }))
        await supabaseClient.from('policy_categories').insert(categories)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (method === 'DELETE') {
      await supabaseClient
        .from('content_policies')
        .delete()
        .eq('id', policyData.id)
        .eq('user_id', user.id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid method')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

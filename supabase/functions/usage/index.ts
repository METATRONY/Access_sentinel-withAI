import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user } } = await supabaseClient.auth.getUser(token)
    if (!user) throw new Error('Unauthorized')

    const { feature_used, tokens_used } = await req.json()

    // Check current usage
    const today = new Date().toISOString().split('T')[0]
    const { data: todayUsage } = await supabaseClient
      .from('usage_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', today)

    // Check subscription
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const dailyLimit = subscription?.plan_type === 'premium' ? 1000 : 10
    const currentDailyUsage = todayUsage?.length || 0

    if (currentDailyUsage >= dailyLimit) {
      return new Response(JSON.stringify({ error: 'Daily limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log usage
    await supabaseClient.from('usage_logs').insert({
      user_id: user.id,
      feature_used,
      tokens_used,
      timestamp: new Date().toISOString()
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
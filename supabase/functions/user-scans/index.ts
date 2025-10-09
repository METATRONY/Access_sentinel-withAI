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

    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get user scans with pagination
    const { data: scans, error, count } = await supabaseClient
      .from('user_scans')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('scan_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw error
    }

    // Get user stats
    const { data: stats } = await supabaseClient
      .from('user_scans')
      .select('total_cost, images_analyzed, text_analyzed')
      .eq('user_id', userId)

    const totalScans = count || 0
    const totalCost = stats?.reduce((sum, scan) => sum + (scan.total_cost || 0), 0) || 0
    const totalImages = stats?.reduce((sum, scan) => sum + (scan.images_analyzed || 0), 0) || 0
    const totalTexts = stats?.reduce((sum, scan) => sum + (scan.text_analyzed || 0), 0) || 0

    return new Response(JSON.stringify({
      scans: scans || [],
      pagination: {
        page,
        limit,
        total: totalScans,
        pages: Math.ceil(totalScans / limit)
      },
      stats: {
        totalScans,
        totalCost,
        totalImages,
        totalTexts
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('User scans error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
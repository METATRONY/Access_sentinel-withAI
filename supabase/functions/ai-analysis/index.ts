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

    const { content, type } = await req.json()

    // Call Google Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: type === 'image' 
              ? `Analyze this image for AI-generated content indicators: ${content}`
              : `Analyze this text for factual accuracy and AI generation: ${content}`
          }]
        }]
      })
    })

    const result = await geminiResponse.json()
    const analysis = result.candidates[0].content.parts[0].text

    // Save scan result
    await supabaseClient.from('scan_results').insert({
      user_id: user.id,
      content_type: type,
      original_content: content,
      analysis_result: analysis,
      confidence_score: Math.random() * 100, // Mock confidence
      timestamp: new Date().toISOString()
    })

    return new Response(JSON.stringify({ 
      analysis,
      confidence_score: Math.random() * 100
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
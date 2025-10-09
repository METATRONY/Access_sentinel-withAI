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

    const { url, content, userId, policyId } = await req.json()

    console.log('Received request:', { url, contentLength: content?.length, userId, policyId })

    if (!url || !content) {
      return new Response(JSON.stringify({ 
        error: 'URL and content are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let totalCost = 0
    const scores: Record<string, number> = {
      fake_info: 0,
      violence: 0,
      drugs: 0,
      guns: 0,
      ai_generated: 0,
      nudity: 0
    }

    // Analyze text content with Gemini Pro
    if (content && content.trim()) {
      try {
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) {
          console.error('GEMINI_API_KEY not set')
          throw new Error('API key not configured')
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this webpage content and provide risk scores (0-100) for each category. Higher scores mean higher risk.
                
Categories:
1. fake_info: Misinformation, false claims, conspiracy theories
2. violence: Violent content, gore, disturbing imagery descriptions
3. drugs: Drug-related content, substance abuse
4. guns: Weapons, firearms content
5. ai_generated: AI-generated or synthetic content indicators
6. nudity: Adult or sexual content

Webpage content: "${content.substring(0, 2000)}"

Respond with ONLY a JSON object like: {"fake_info": 15, "violence": 5, "drugs": 0, "guns": 0, "ai_generated": 20, "nudity": 0}`
              }]
            }]
          })
        })

        if (response.ok) {
          const result = await response.json()
          const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
          
          console.log('Gemini response:', analysisText)
          
          try {
            const jsonMatch = analysisText.match(/\{[^}]+\}/);
            if (jsonMatch) {
              const geminiScores = JSON.parse(jsonMatch[0]);
              Object.assign(scores, geminiScores);
            }
          } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
          }

          totalCost += 0.001
        } else {
          console.error('Gemini API error:', await response.text())
        }
      } catch (error) {
        console.error('Error analyzing text:', error);
      }
    }

    // Calculate overall score (average of all categories)
    const overallScore = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
    )

    // Save scan to database
    try {
      await supabaseClient.from('user_scans').insert({
        user_id: userId,
        website_url: url,
        scan_date: new Date().toISOString(),
        categories: Object.entries(scores).map(([category, score]) => ({
          category,
          score
        })),
        total_cost: totalCost
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    return new Response(JSON.stringify({
      success: true,
      scores: scores,
      overall_score: overallScore,
      totalCost: totalCost
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Page scanner error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

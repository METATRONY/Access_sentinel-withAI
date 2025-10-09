import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, text, type, userId } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let result;

    if (type === 'image' && imageUrl) {
      result = await analyzeImage(imageUrl, apiKey);
    } else if (type === 'text' && text) {
      result = await factCheckText(text, apiKey);
    } else {
      throw new Error('Invalid request: must provide imageUrl or text with type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeImage(imageUrl: string, apiKey: string) {
  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    // Detect MIME type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `Analyze this image for inappropriate content. Check for:
- Violence or gore
- Sexual or adult content
- Hate symbols or extremism
- Dangerous activities
- Misinformation or fake content

Provide a JSON response with:
{
  "safe": boolean,
  "categories": ["category1", "category2"],
  "severity": "low|medium|high",
  "description": "brief description",
  "recommendation": "allow|warn|block"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: contentType,
                  data: base64Image
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      safe: true, 
      description: text,
      recommendation: 'allow'
    };

    return {
      type: 'image',
      analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}

async function factCheckText(text: string, apiKey: string) {
  const prompt = `Fact-check the following text. Analyze for accuracy, misinformation, and credibility:

"${text}"

Provide a JSON response with:
{
  "credible": boolean,
  "confidence": "low|medium|high",
  "issues": ["issue1", "issue2"],
  "explanation": "detailed explanation",
  "sources": ["suggested sources to verify"]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('No response from Gemini');
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
    credible: true,
    explanation: responseText
  };

  return {
    type: 'text',
    analysis,
    timestamp: new Date().toISOString()
  };
}

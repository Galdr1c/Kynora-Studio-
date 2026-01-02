import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ColorPalette, BrandTheme, BrandTone, TargetAudience, BrandGuideline, BrandMission, LogoLayer, DesignSuggestion, BrandKitAsset, LogoVariant, LogoEffectivenessReport } from "../types";

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const applyArtisticStyle = async (
  logoUrl: string,
  styleId: string,
  intensity: number,
  brandName: string
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = logoUrl.includes(',') ? logoUrl.split(',')[1] : logoUrl;
    
    const stylePrompts: Record<string, string> = {
      'bauhaus': `Apply Bauhaus artistic movement to this logo for '${brandName}'. Use primary colors (red, blue, yellow), bold geometric shapes, and a minimalist clean grid. Intensity: ${intensity}%.`,
      'artdeco': `Apply Art Deco style to this logo. Use elegant symmetrical geometric lines, high-end gold accents, and a luxurious vintage aesthetic. Intensity: ${intensity}%.`,
      'swiss': `Apply Swiss Design style. Extreme focus on grid systems, clean typography, and objective clarity. High-end modernism. Intensity: ${intensity}%.`,
      'memphis': `Apply 80s Memphis style. Playful, vibrant, colorful patterns with random geometric shapes and high energy. Intensity: ${intensity}%.`,
      'brutalism': `Apply Graphic Brutalism. Stark, raw, bold shapes, high contrast, and industrial textures. No-nonsense aesthetic. Intensity: ${intensity}%.`,
      'glass': `Apply Glassmorphism visual effect. Translucent frosted glass texture, soft multi-colored background blur, and glossy reflections. Intensity: ${intensity}%.`,
      'neon': `Transform this logo into a realistic Neon sign. Glowing electric tubes, vibrant light bloom, and a subtle dark environment. Intensity: ${intensity}%.`,
      '3d': `Apply 3D Extrusion. Add depth, realistic perspective, and soft studio lighting to create a physical dimensional object. Intensity: ${intensity}%.`,
      'mesh': `Apply Gradient Mesh effect. Smooth, complex fluid color transitions and organic liquid-like gradients. Intensity: ${intensity}%.`,
      'riso': `Apply Risograph print texture. Authentic vintage ink grain, overlapping colors, and beautiful print imperfections. Intensity: ${intensity}%.`,
      'embossed': `Apply Embossed/Debossed effect. The logo should look physically pressed into or raised out of a premium matte paper surface. Intensity: ${intensity}%.`,
      'metallic': `Apply Metallic simulation. Transform the logo into polished Gold/Chrome material with realistic reflections and specular highlights. Intensity: ${intensity}%.`,
      'wooden': `Apply realistic Wooden texture. Fine wood grain, organic carving details, and natural material warmth. Intensity: ${intensity}%.`,
      'fabric': `Apply Embroidered fabric effect. Detailed thread stitching, textile texture, and realistic cloth fibers. Intensity: ${intensity}%.`,
      'watercolor': `Apply Watercolor painting style. Soft pigment bleeds, paper texture, and artistic hand-painted transparency. Intensity: ${intensity}%.`,
      'sketch': `Apply Hand-drawn charcoal sketch style. Rough artistic lines, hatching shadows, and professional graphite drawing feel. Intensity: ${intensity}%.`
    };

    const prompt = stylePrompts[styleId] || `Apply a unique artistic transformation to this logo for '${brandName}'. Intensity: ${intensity}%.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Style transfer synthesis failed.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  });
};

export const analyzeLogoEffectiveness = async (
  logoUrl: string,
  brandName: string,
  industry: string = "Culinary Tech"
): Promise<LogoEffectivenessReport> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = logoUrl.includes(',') ? logoUrl.split(',')[1] : logoUrl;
    
    const prompt = `Perform an advanced expert brand identity audit for '${brandName}' in the '${industry}' industry.
    Evaluate the attached logo based on professional design principles.
    
    Analysis Requirements:
    1. Visual Complexity: Balance of elements.
    2. Memorability: Distinctiveness and recall potential.
    3. Versatility: Performance across mediums.
    4. Uniqueness: Contrast against common industry tropes.
    5. Industry Fit: Alignment with target audience expectations.
    6. Cultural Sensitivity: Check for negative connotations.
    7. Trend Alignment: Modernity vs Longevity.
    
    Return the report as a strictly valid JSON object matching the LogoEffectivenessReport interface.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_score: { type: Type.NUMBER },
            complexity: { 
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
              required: ['score', 'feedback']
            },
            memorability: { 
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
              required: ['score', 'feedback']
            },
            versatility: { 
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
              required: ['score', 'feedback']
            },
            uniqueness: { 
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
              required: ['score', 'feedback']
            },
            industry_fit: { 
              type: Type.OBJECT,
              properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
              required: ['score', 'feedback']
            },
            cultural_sensitivity: { 
              type: Type.OBJECT,
              properties: { feedback: { type: Type.STRING } },
              required: ['feedback']
            },
            trend_alignment: { 
              type: Type.OBJECT,
              properties: { feedback: { type: Type.STRING } },
              required: ['feedback']
            },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['overall_score', 'complexity', 'memorability', 'versatility', 'uniqueness', 'industry_fit', 'cultural_sensitivity', 'trend_alignment', 'suggestions']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  });
};

export const optimizePaletteForAccessibility = async (
  currentPalette: ColorPalette,
  brandName: string
): Promise<ColorPalette> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const colorsStr = JSON.stringify(currentPalette.colors.map(c => ({ name: c.name, hex: c.hex, type: c.type })));
    
    const prompt = `Analyze this color palette for brand '${brandName}': ${colorsStr}.
    Your task:
    1. Check WCAG 2.1 AA contrast ratios for each color against White (#FFFFFF) and Dark Slate (#0F172A).
    2. If a color fails (contrast < 4.5:1), shift its hue/saturation/value slightly to PASS the requirement while keeping the brand's original aesthetic intent.
    3. Ensure the primary color is distinguishable from the background in grayscale.
    
    Return the optimized palette as a strictly valid JSON object with the 'colors' array.
    Each color must have 'name', 'hex', 'darkHex', and 'type'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  darkHex: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['primary', 'secondary', 'accent', 'neutral'] }
                },
                required: ['name', 'hex', 'darkHex', 'type']
              }
            }
          },
          required: ['colors']
        }
      }
    });

    return JSON.parse(response.text || '{"colors": []}');
  });
};

export const generateLogoVariant = async (
  baseLogo64: string,
  variantType: LogoVariant['type'],
  brandName: string,
  style: string,
  primaryColor: string,
  isDark: boolean
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = baseLogo64.includes(',') ? baseLogo64.split(',')[1] : baseLogo64;
    
    const bgColor = isDark ? "#0F172A" : "#FFFFFF";
    
    const variantPrompts: Record<string, string> = {
      'icon': `Render ONLY the graphical icon/symbol from this logo. Remove ALL text and slogans. Solid ${bgColor} background. Maintain the original icon's ${primaryColor} color and geometry exactly.`,
      'text': `Render ONLY the brand name wordmark " ${brandName} ". Remove all icons and symbols. High-end typography, solid ${bgColor} background. Text color should be ${isDark ? '#FFFFFF' : '#1D2B3A'}.`,
      'monochrome': `Render a monochrome version of the full logo. Every element (icon and text) must be exactly ONE color: ${isDark ? '#FFFFFF' : '#000000'}. No gradients. Solid ${bgColor} background.`,
      'inverted': `Render a high-contrast negative space version. Swap primary colors. Solid ${bgColor} background.`,
      'stacked': `Re-render the logo in a STACKED vertical layout. The icon is placed centrally ABOVE the brand name. Solid ${bgColor} background.`,
      'horizontal': `Re-render the logo in a wide HORIZONTAL layout. The icon is placed to the LEFT of the brand name. Solid ${bgColor} background.`,
      'compact': `Synthesize a ultra-compact FAVICON version. Simplified icon geometry for small sizes. Square aspect ratio. Solid ${bgColor} background.`,
      'watermark': `Render a monochrome version of the logo at 30% opacity on a solid ${bgColor} background. Ghosted effect.`
    };

    const prompt = variantPrompts[variantType] || `Re-render this logo for brand ${brandName} with a ${variantType} variation. Style: ${style}. Solid ${bgColor} background.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Variant synthesis failed.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  });
};

export const generateBrandKitAsset = async (
  logoBase64: string,
  brandName: string,
  assetType: BrandKitAsset['type'],
  label: string,
  primaryColor: string
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const logoData = logoBase64.includes(',') ? logoBase64.split(',')[1] : logoBase64;
    
    const promptMap: Record<string, string> = {
      'business-card': `High-end professional business card mockup for ${brandName}. Front and back view lying on a premium stone surface. The card has a subtle matte texture. Logo from [IMAGE] is elegantly embossed on the front. Use ${primaryColor} for the edges and accent details. Cinematic soft lighting, realistic shadows, 4k resolution.`,
      'social': `A complete social media identity kit composite. Displays a circular Instagram profile avatar, a wide LinkedIn banner, and a Facebook cover. All assets features the logo [IMAGE] centered on a sophisticated background gradient using ${primaryColor}. Modern SaaS aesthetic.`,
      'product': `Studio product mockup of a premium ${label}. Features the brand logo [IMAGE] cleanly printed/engraved on the item. High-quality materials (organic cotton for totes, matte ceramic for mugs, high-grade plastic for phone cases). Realistic reflections, shadows, and studio lighting.`,
      'print': `A professional ${label} (like a brochure or flyer) layout mockup. Clean grid system, modern typography, with the logo from [IMAGE] placed at the top. The design uses ${primaryColor} as the primary brand color. Shown in a realistic studio environment.`,
      'presentation': `Professional 16:9 presentation slide deck template. Includes a title slide with a large logo [IMAGE] and an internal content slide with clean charts and brand accents in ${primaryColor}. Minimalist business style.`,
      'stationery': `An A4 Letterhead and envelope mockup for ${brandName}. Elegant placement of the logo [IMAGE] in the header. Use ${primaryColor} for the footer details. High-quality paper texture, professional lighting.`,
      'guidelines': `A beautiful double-page spread of a Brand Guidelines manual for ${brandName}. Shows the logo [IMAGE] variations, typography samples, and the color palette including ${primaryColor}. Clean editorial layout.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: logoData, mimeType: 'image/png' } },
          { text: promptMap[assetType] || `Professional high-resolution mockup of ${label} for brand ${brandName} using this logo [IMAGE]. Realistic shadows and premium lighting.` }
        ]
      },
      config: { 
        imageConfig: { 
          aspectRatio: "16:9"
        } 
      }
    });

    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Mockup synthesis failed.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  });
};

export const analyzeDesignAndSuggest = async (
  brandName: string,
  slogan: string,
  layers: LogoLayer[],
  palette: ColorPalette,
  currentStyle: string
): Promise<DesignSuggestion[]> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const layerSummary = layers.map(l => ({
      id: l.id,
      type: l.type,
      x: l.x,
      y: l.y,
      scale: l.scale
    }));

    const prompt = `Analyze this logo design for '${brandName}'. 
    Current Style: ${currentStyle}. 
    Layers: ${JSON.stringify(layerSummary)}. 
    Colors: ${JSON.stringify(palette.colors.map(c => c.hex))}.
    
    Suggest 5 specific improvements for layout, color harmony, typography pairings, and modern appeal. 
    Return as strictly valid JSON array of objects. 
    Each object must have: 
    - "id": unique string 
    - "title": short catchy title 
    - "description": why this works 
    - "type": "layout", "color", "typography", "accessibility", or "style"
    - "layerUpdates": a mapping of layer IDs to the partial properties to change (x, y, scale, rotation, fontFamily, fontSize)
    - "globalUpdates": optional properties like "primaryColor" or "style"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['layout', 'color', 'typography', 'accessibility', 'style'] },
                  layerUpdates: { type: Type.OBJECT },
                  globalUpdates: { 
                    type: Type.OBJECT,
                    properties: {
                      primaryColor: { type: Type.STRING },
                      style: { type: Type.STRING }
                    }
                  }
                },
                required: ['id', 'title', 'description', 'type', 'layerUpdates']
              }
            }
          },
          required: ['suggestions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"suggestions": []}');
    return parsed.suggestions;
  });
};

export const differentiateFromCompetitor = async (
  base64Logo: string,
  base64Competitor: string
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const logoData = base64Logo.includes(',') ? base64Logo.split(',')[1] : base64Logo;
    const compData = base64Competitor.includes(',') ? base64Competitor.split(',')[1] : base64Competitor;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: logoData, mimeType: 'image/png' } },
          { inlineData: { data: compData, mimeType: 'image/png' } },
          { text: "Compare my logo (first image) with this competitor logo (second image). Suggest 3 visual ways to differentiate and stand out in this market. Focus on color psychology, symbolic contrast, and layout. Keep it concise." }
        ]
      }
    });
    return response.text || "Focus on unique geometry and a distinct secondary color palette.";
  });
};

export const extractBrandInfoFromImage = async (base64Image: string): Promise<{ 
  name: string; 
  style: string; 
  slogan: string;
  layers: { type: 'icon' | 'text' | 'slogan'; x: number; y: number; scale: number }[] 
}> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/png' } },
          { 
            text: `Analyze this logo image with EXTREME precision. Your task:

1. **Brand Name Detection**: Extract the main text/brand name. If unclear, return "Imported Brand".

2. **Component Layer Detection**: Identify ALL visual elements and classify them:
   - "icon": Any graphical symbol, illustration, or decorative element
   - "text": The main brand name text
   - "slogan": Any tagline, subtitle, or secondary text
   
3. **Spatial Analysis**: For EACH detected component, determine:
   - X position: Horizontal center point (0-100 percentage from left)
   - Y position: Vertical center point (0-100 percentage from top)
   - Scale: Relative size (0.5 = half size, 1.0 = normal, 2.0 = double size)

4. **Style Classification**: Categorize the design style as one of:
   - "modern": Clean, geometric, contemporary
   - "minimalist": Simple, sparse, essential
   - "luxury": Premium, elegant, sophisticated
   - "tech": Futuristic, digital, innovative
   - "vintage": Retro, classic, nostalgic
   - "playful": Fun, colorful, dynamic

5. **Slogan Extraction**: If there's a tagline or subtitle, extract it. Otherwise return empty string.

Return ONLY valid JSON with this exact structure:
{
  "name": "Brand Name Here",
  "style": "modern",
  "slogan": "Tagline here or empty string",
  "layers": [
    { "type": "icon", "x": 50, "y": 30, "scale": 1.2 },
    { "type": "text", "x": 50, "y": 65, "scale": 1.0 },
    { "type": "slogan", "x": 50, "y": 80, "scale": 0.7 }
  ]
}

CRITICAL: Be precise with positioning. X:50 Y:50 is dead center. X:0 Y:0 is top-left corner.` 
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            style: { type: Type.STRING, enum: ['modern', 'minimalist', 'luxury', 'tech', 'vintage', 'playful'] },
            slogan: { type: Type.STRING },
            layers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['icon', 'text', 'slogan'] },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  scale: { type: Type.NUMBER }
                },
                required: ['type', 'x', 'y', 'scale']
              }
            }
          },
          required: ['name', 'style', 'slogan', 'layers']
        }
      }
    });
    
    const result = JSON.parse(response.text || '{"name": "Imported Brand", "style": "modern", "slogan": "", "layers": []}');
    
    // Validation: Ensure at least one layer exists
    if (!result.layers || result.layers.length === 0) {
      result.layers = [
        { type: 'icon', x: 50, y: 40, scale: 1.0 },
        { type: 'text', x: 50, y: 65, scale: 1.0 }
      ];
    }
    
    return result;
  });
};

export const recomposeLogo = async (
  base64Image: string,
  brandName: string,
  layout: 'horizontal' | 'vertical' | 'avatar' | 'header',
  layers: LogoLayer[],
  style: string,
  primaryColor: string,
  isDark: boolean,
  extraConfig?: {
    slogan?: string;
    morphLevel?: number;
    strokeWidth?: number;
    strokeStyle?: 'solid' | 'dashed' | 'dotted';
    moodStyle?: string;
  }
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const bgColor = isDark ? "#0F172A" : "#FFFFFF";
    const textColor = isDark ? "#F8FAFC" : "#1D2B3A";
    
    const invisibleLayers = layers.filter(l => !l.isVisible).map(l => l.type.toUpperCase());
    const visibilityInstruction = invisibleLayers.length > 0 
      ? `CRITICAL NEGATIVE CONSTRAINT: DO NOT render any ${invisibleLayers.join(' or ')}. These elements MUST be completely erased and replaced with the background color ${bgColor}.`
      : "";

    const visibleLayerDirectives = layers.filter(l => l.isVisible).map(l => {
      const content = l.type === 'text' ? brandName : (l.type === 'slogan' ? (extraConfig?.slogan || "Tagline") : "Main Icon");
      return `- Layer ${l.type.toUpperCase()}: Content "${content}". Placement: X:${Math.round(l.x)}%, Y:${Math.round(l.y)}%. Transformation: Scale:${l.scale}x, Rot:${l.rotation}deg, FlipX:${l.flipX}, FlipY:${l.flipY}. Visual: Opacity:${l.opacity}%, Color:${primaryColor}.`;
    }).join('\n');

    const prompt = `Professional Brand Identity Re-rendering.
    Source: attached image.
    Instruction: Synthesize a high-fidelity vector-style render.
    
    ${visibilityInstruction}
    
    Composition Architecture:
    ${visibleLayerDirectives}
    
    Target Aesthetic: ${style}, high-end SaaS quality, geometric perfection.
    Environment: Solid ${bgColor}. Asset Main Color: ${primaryColor}. Typography Color: ${textColor}.
    Constraint: FLAT DESIGN. No raster noise. High-definition vector-like paths. No traces of hidden elements.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content.parts.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Synthesis failed.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  });
};

export const generateKitchaLogo = async (
  userPrompt: string, 
  brandName: string,
  showName: boolean,
  layout: 'horizontal' | 'vertical' | 'avatar' | 'header',
  primaryColor: string = "#E2725B", 
  style: BrandTheme = 'modern',
  tone: BrandTone = 'sophisticated',
  audience: TargetAudience = 'luxury',
  isDark: boolean = false,
  referenceImage?: string 
): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const bgColor = isDark ? "#0F172A" : "#FFFFFF";
    
    let parts: any[] = [];
    if (isDark && referenceImage) {
      const base64Data = referenceImage.includes(',') ? referenceImage.split(',')[1] : referenceImage;
      parts.push({ inlineData: { mimeType: 'image/png', data: base64Data } });
      parts.push({ text: `Transform this logo to high-fidelity Dark Mode. Background: ${bgColor}. Maintain exact shapes. Colors should be ${primaryColor} and white.` });
    } else {
      parts.push({ text: `Create a minimalist premium logo for '${brandName}'. Object: ${userPrompt}. Style: ${style}. Palette: ${primaryColor} on ${bgColor}. Flat vector style.` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Synthesis failed.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  });
};

export const generateBrandStrategy = async (brandName: string, prompt: string, style: string): Promise<{guidelines: BrandGuideline[], mission: BrandMission}> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate brand mission and guidelines for '${brandName}' as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mission: {
              type: Type.OBJECT,
              properties: {
                statement: { type: Type.STRING },
                values: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['statement', 'values']
            },
            guidelines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillar: { type: Type.STRING },
                  description: { type: Type.STRING },
                  rules: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['pillar', 'description', 'rules']
              }
            }
          },
          required: ['mission', 'guidelines']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const analyzeLogoPalette = async (base64Image: string): Promise<ColorPalette> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageData } },
          { text: "Extract 4-color palette as JSON." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  darkHex: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['primary', 'secondary', 'accent', 'neutral'] },
                },
                required: ['name', 'hex', 'darkHex', 'type'],
              },
            },
          },
          required: ['colors'],
        },
      },
    });
    return JSON.parse(response.text || '{"colors": []}');
  });
};

export const editLogoImage = async (base64Image: string, editPrompt: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType: 'image/png' } },
          { text: `Edit: ${editPrompt}. Keep original logo spirit.` },
        ],
      },
    });
    const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Edit failed.");
    return `data:image/png;base64,${imagePart.inlineData.data}`;
  });
};

export const suggestLogoPrompt = async (brandName: string, style: string, audience: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a visual prompt for a logo of brand '${brandName}' in '${style}' style.`,
    });
    return response.text?.trim() || "minimalist geometric icon";
  });
};

export const generateBrandVoice = async (text: string): Promise<string> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Voice for brand manifesto: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Voice failed.");
    return `data:audio/pcm;base64,${base64Audio}`;
  });
};

export const generateBrandReveal = async (brandName: string, style: string, logoBase64: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A professional cinematic brand reveal motion graphic for '${brandName}'.`,
    image: {
      imageBytes: logoBase64.includes(',') ? logoBase64.split(',')[1] : logoBase64,
      mimeType: 'image/png',
    },
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
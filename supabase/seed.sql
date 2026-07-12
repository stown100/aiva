-- AIVA — style catalog seed (15 styles).
-- Localized names/descriptions live in the app dictionaries (messages/*.json)
-- keyed by style id; the database owns categories, ordering and prompts.
-- `on conflict do nothing` so prompts edited live in the DB are never clobbered.

insert into public.styles (id, category, prompt_template, prompt_version, sort_order) values

-- ===== TRENDING =====
('anime-dream', 'trending',
 'Transform this person into a high-quality anime character in a modern Japanese animation style: large expressive eyes, clean cel shading, vibrant saturated colors, detailed glossy hair. Dreamy background with soft bokeh light and drifting sakura petals. Preserve the person''s identity, facial features, expression, pose and framing. Polished key-visual quality.',
 1, 10),

('pixar-character', 'trending',
 'Transform this person into a charming 3D animated movie character in the style of a modern family CG film: soft rounded features, expressive slightly oversized eyes, smooth stylized skin with subtle subsurface scattering, warm cinematic lighting, colorful friendly background. Preserve the person''s identity, facial features, expression, pose and framing. Feature-film render quality.',
 1, 20),

('cinematic-movie', 'trending',
 'Transform this photo into a dramatic still frame from a Hollywood blockbuster: moody cinematic color grading with teal and orange tones, shallow depth of field, subtle anamorphic lens flare, fine film grain, dramatic key lighting. Preserve the person''s identity, facial features, expression, pose and framing. 4K movie-still quality.',
 1, 30),

('luxury-magazine', 'trending',
 'Transform this photo into a high-fashion luxury magazine cover portrait: flawless studio beauty lighting, refined editorial retouching, elegant styling, rich minimal backdrop, glossy premium finish. Preserve the person''s identity, facial features, expression, pose and framing. Vogue-level editorial quality.',
 1, 40),

('vintage-film', 'trending',
 'Transform this photo into a nostalgic 1970s analog film photograph: warm faded colors, gentle film grain, soft vignette, golden-hour glow, subtle retro wardrobe styling. Preserve the person''s identity, facial features, expression, pose and framing. Authentic vintage film-stock look.',
 1, 50),

-- ===== CREATIVE =====
('cyberpunk', 'creative',
 'Transform this person into a cyberpunk character in a neon-lit futuristic city at night: vivid magenta and cyan neon reflections on skin, holographic signs, futuristic jacket with glowing accents, light rain and atmospheric haze. Preserve the person''s identity, facial features, expression, pose and framing. Cinematic sci-fi concept-art quality.',
 1, 10),

('fantasy-hero', 'creative',
 'Transform this person into an epic fantasy hero: ornate armor or an enchanted cloak, mystical glowing atmosphere, dramatic painterly lighting, ancient castle or enchanted forest in the background. Preserve the person''s identity, facial features, expression, pose and framing. Epic fantasy book-cover quality.',
 1, 20),

('comic-book', 'creative',
 'Transform this photo into classic American comic book art: bold black ink outlines, halftone dot shading, flat vivid colors, dynamic dramatic framing with an action-burst background. Preserve the person''s identity, facial features, expression, pose and framing. Printed comic-page look.',
 1, 30),

('watercolor', 'creative',
 'Transform this photo into a delicate watercolor painting: soft translucent washes, gentle color bleeding, visible paper texture, loose artistic edges, airy light palette. Preserve the person''s identity, facial features, expression, pose and framing. Hand-painted gallery watercolor quality.',
 1, 40),

('oil-painting', 'creative',
 'Transform this photo into a classical oil painting portrait in the manner of the old masters: rich visible brushstrokes, deep warm tones, dramatic chiaroscuro lighting, subtle canvas texture. Preserve the person''s identity, facial features, expression, pose and framing. Museum-quality fine art.',
 1, 50),

-- ===== PROFESSIONAL =====
('linkedin-portrait', 'professional',
 'Transform this photo into a polished professional business headshot: clean soft studio lighting, smart business attire, neutral softly blurred office background, confident approachable expression, crisp corporate photography finish. Preserve the person''s identity, facial features and framing. Premium headshot quality.',
 1, 10),

('startup-founder', 'professional',
 'Transform this photo into a modern startup founder portrait: smart-casual outfit, bright airy loft or modern office background, natural confident pose, clean editorial lighting in the style of a tech magazine feature. Preserve the person''s identity, facial features, expression and framing. Editorial portrait quality.',
 1, 20),

('influencer-style', 'professional',
 'Transform this photo into a glossy social-media influencer portrait: golden-hour glow, flawless natural skin retouching, trendy outfit, aesthetic lifestyle background, vibrant feed-ready color grading. Preserve the person''s identity, facial features, expression, pose and framing. Top-creator content quality.',
 1, 30),

-- ===== FUN =====
('retro-90s', 'fun',
 'Transform this photo into a playful 1990s studio portrait: bold geometric laser backdrop, saturated colors, direct flash aesthetic, authentic 90s fashion touches like denim, windbreakers and funky patterns. Preserve the person''s identity, facial features, expression, pose and framing. Nostalgic mall-studio photo vibe.',
 1, 10),

('game-character', 'fun',
 'Transform this person into a AAA video game character: stylized realistic 3D render, detailed outfit and gear, dramatic rim lighting, epic game-cover composition with atmospheric particle effects. Preserve the person''s identity, facial features, expression, pose and framing. Next-gen game key-art quality.',
 1, 20)

on conflict (id) do nothing;

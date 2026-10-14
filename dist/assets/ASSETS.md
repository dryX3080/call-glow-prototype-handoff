# Original call assets

Source: Figma `p7896b2XIPGOtu6JO7G3h6`, section `3534:3308`. `assets-manifest.json` supplies semantic aliases relative to `dist`, intrinsic SVG/PNG dimensions, original node IDs, and position/crop metadata. Original SVG files are whole Figma exports, with original paths, paint and effects preserved.

## Glow placement

Active call frame is402×874. Controls at x20,y726,362×98. The four69px columns have x7,100,193,286. Microphone button occupies controls-local x195.5,y0,64×64; its circle center is(227.5,32). Original Glow group is x187,y-9,82×82.

Original render origins relative to Controls:

- `glow-shape-1.svg`: x186.189,y-9.432, root84×83. Opacity0.24 and Gaussian blur are baked.
- `glow-shape-2.svg`: x187.756,y-7.682, root81×81. Opacity0.7, original rotation/skew and blur are baked; do not rotate a second time.
- `glow-button.png`: x117.773,y-81.260. Original layer3524:2894 is63.104×65.496 but effects expand rendering to225.088×227.479. The PNG is an unmodified Figma export at2× (451×455); render at226×228. It avoids the original SVG conic fill's foreignObject restriction in img elements. `glow-button.svg` remains preserved as a whole SVG.

White microphone circle, original25×25 icon and click target remain fixed; animate these Glow assets outside the button clipping container. Do not add opacity0.2 again to the bloom because it is baked in.

## Photos

Local original camera photo is679×452, source image hash `eca2dc46b2aff4879daa14b3cce52403a41592ab`. Use object-fit cover into135×180, centered. Original crop transform is[[0.4992636144,0,0.2503681779],[0,1,0]]. Place x20,y508 in own-camera-only audio layout and x20,y136 in both-cameras layout; radius24.

Peer original camera photo is1072×1908, source image hash `e4b80e72e7659dc3747fb9060f0063a3880cc26b`. Original frame402×873 clips a child at x-54,y-12,w498,h885. Preserve that crop rather than fitting the whole photo to402×874.

## Light and mask

`lightTexture` alias uses the freshly downloaded active-frame export `light-texture-2.png`,1024×1024. Original image hash is `2a3fd1d45b1a12fd3e6d8913cfd5618b0d307408`. Texture layer3522:1804 is816×682.336, opacity0.32, Color dodge, exposure-0.07. Source layer is vertically flipped in the original group. `lightMask` alias is the fresh active `light-mask-2.svg`,582×868, preserving24px feather padding around original534×820 mask. Keep its shape and placement fixed during motion.

`grainGold` and `grainLavender` point to the same original Light layer09 image bundle1024×576. Its source includes the original grain/image paint plus screen light paint. Gold or lavender tint is a separate hard-light composition paint in Figma. Original size448×536.905, blur94px CSS equivalent; per-state palette/tint remains outside the bitmap.

## Fonts and preparation illustration

The five provided Gerbera OTF files are copied verbatim into fonts/, for CSS weights300/400/500/700/900. Preparation dots whole SVG has root170×58 including effects, while node is136×24 at x133,y425. Its original render position is x116,y416. Keep SVG root dimensions natural.

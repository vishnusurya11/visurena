## Why this question

Every episode leaves the renderer at 768 × 768 and ships at 3072 × 3072, so the last step is an upscaler. On 2026-10-14 the studio replaced a plain Lanczos resize with RTX Video Super Resolution. The bench that day measured sharpness: RTX VSR made ink lines 1.9–2.7x crisper on a Laplacian ruler for under half a minute per episode, with no ringing. It was adopted.

Four days later the walls and cobbles in every shot were visibly *boiling*. The sharpness ruler could not see it, because it scores single frames. The question became: **which local, free upscaler keeps the background still and the faces sharp, in about ten minutes an episode on one RTX 4090?**

## Setup

- **Inputs:** three takes from the same look, 124 frames each at 24 fps. **C** a close face with a lamp and wall behind, **M** a two-shot medium, **W** a wide street.
- **Arms:** eight chains, from the Lanczos source reference to RTX VSR in two modes, Real-ESRGAN with and without a temporal prefilter, a 35 % blend of the two, and SeedVR2 3B (a diffusion upscaler).
- **Jitter ruler:** camera motion is removed with DIS optical flow measured once on the source. On a background mask (pixels that pass a forward–backward flow check, move with the frame's median motion and sit outside the faces) the ruler is the mean absolute difference between a frame and the previous frame warped onto it. Lower is steadier.
- **Shimmer ruler:** the same residual on a band-pass image, divided by the band-pass detail: flicker per unit of detail.
- **Face ruler:** 95th-percentile Sobel on MTCNN face crops (21, 29 and 13 crops), resized to 512.
- Every arm is measured on one 1536 grid, so a sharper arm cannot win by resolution alone.

## Results

| Arm | Jitter C / M / W | vs RTX VSR | Face crispness C / M / W | Time per episode |
|---|---|---|---|---|
| Lanczos (source reference) | 0.362 / 0.526 / 0.479 | −51 / −46 / −50 % | 181 / 64 / 59 | — |
| RTX VSR 4x ULTRA (adopted 10-14) | 0.742 / 0.972 / 0.952 | 0 | 208 / 89 / 69 | ~4.6 min |
| RTX VSR 4x HIGHBITRATE_ULTRA | 0.432 / 0.663 / 0.649 | −42 / −32 / −32 % | 197 / 97 / 69 | — |
| Real-ESRGAN animevideov3 x4 | 0.369 / 0.534 / 0.466 | −50 / −45 / −51 % | 248 / 117 / 92 | ~4.8–5 min |
| **hqdn3d (temporal 4) + animevideov3 x4** | **0.309 / 0.477 / 0.418** | **−58 / −51 / −56 %** | **252 / 119 / 92** | **~4.6–4.8 min** |
| SeedVR2 3B at 1536 (C only) | 0.397 | −46 % | 245 | ~5.5 h |

**Why RTX VSR jitters.** It is stateless and runs per frame. It treats the renderer's frame-to-frame grain as detail and sharpens it, about 2x on the rulers: 1.85–2.05x the source's own jitter.

**Why the winner is steadier than the source.** The temporal prefilter (`hqdn3d=0:0:4:4`, no spatial blur) removes part of that grain *before* the upscaler sees it. The chain lands 9–15 % below plain Lanczos.

**Cost.** Both fast arms are bound by the x264 encode, not the GPU (RTX VSR 2 ms a frame, Real-ESRGAN 20–25 ms). SeedVR2 has strong faces but runs at 0.18 fps, about 5.5 hours an episode, and invents scratchy texture.

## Decision taken

On 2026-10-18 the studio's master upscale became the denoise + animevideov3 chain, with the prefilter run **per shot** so that no frame blends across a hard cut. On a three-shot proof cut there was no ghosting at either cut. RTX VSR and Lanczos stay selectable as fallbacks.

## The lesson

The first benchmark was not wrong; it measured the wrong thing. A per-frame sharpness metric rewards exactly the artefact that ruins video: amplified grain that changes every frame. **Any upscaler comparison for generated video needs a temporal ruler next to the sharpness ruler.**

## Reproduce

The rulers, the arm runner and the measurement scripts live with the studio's audit notes; the per-take numbers are attached below as `rulers_*.json` and `timings.jsonl`. The models are public: Real-ESRGAN `realesr-animevideov3.pth` (BSD-3) and NVIDIA's `nvidia-vfx` package.

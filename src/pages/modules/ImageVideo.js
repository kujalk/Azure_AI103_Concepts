import { useState } from 'react';
import ModulePage from '../../components/ModulePage';
import { C, Callout, Code, H2, H3, OL, P, Panel, Table, UL } from '../../components/ui';

const MaskDemo = () => {
  const [show, setShow] = useState('mask');
  const views = { input: 'Original image', mask: 'Mask PNG', output: 'Edited result' };
  return (
    <Panel title="How a mask selects the edit area">
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(views).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={show === k} onClick={() => setShow(k)}
            className={`rounded-full border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 ${show === k ? 'border-azure-500 bg-azure-500 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{label}</button>
        ))}
      </div>
      <svg viewBox="0 0 320 180" role="img" aria-label={`${views[show]} of a tent in a landscape`} className="w-full max-w-md rounded-lg border border-slate-200">
        <defs>
          <pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#cbd5e1" /><rect x="8" y="8" width="8" height="8" fill="#cbd5e1" /><rect x="8" width="8" height="8" fill="#f1f5f9" /><rect y="8" width="8" height="8" fill="#f1f5f9" />
          </pattern>
        </defs>
        <rect width="320" height="120" fill={show === 'output' ? '#fb923c' : '#7dd3fc'} />
        {show === 'output' && <circle cx="250" cy="115" r="30" fill="#fde047" />}
        <rect y="115" width="320" height="65" fill="#4ade80" />
        <polygon points="110,140 160,70 210,140" fill="#b91c1c" />
        {show === 'mask' && (
          <>
            <path d="M0 0H320V115H0Z" fill="url(#checker)" />
            <text x="160" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">Transparent: alpha 0</text>
            <text x="160" y="60" textAnchor="middle" fontSize="12" fill="#0f172a">The model edits here</text>
            <rect y="115" width="320" height="65" fill="#475569" />
            <polygon points="110,140 160,70 210,140" fill="#475569" />
            <text x="160" y="160" textAnchor="middle" fontSize="12" fill="#fff">Opaque: kept as it was</text>
          </>
        )}
      </svg>
      <p className="mt-3 text-sm leading-6 text-slate-700">Prompt: "Change the sky to a sunset". Only the transparent pixels are meant to change, so the tent and grass stay as they were.</p>
    </Panel>
  );
};

const Images = () => (
  <>
    <H2>Choose an image model</H2>
    <Table head={['Model', 'Character', 'Use when']} rows={[
      ['gpt-image-2.5-sunburst', 'Highest fidelity, optimized for editing precision', 'Precise edits and the best quality'],
      ['gpt-image-2.5-flare', 'Optimized for speed and cost', 'High-quality, everyday generation'],
      ['gpt-image-2', 'Realism-optimized, higher latency and cost. low quality suits latency-sensitive work', 'Realistic images and face preservation'],
      ['gpt-image-1.5', 'More efficient than gpt-image-1', 'Realism with improved latency'],
      ['gpt-image-1-mini', 'Cost-efficient and fast, no dedicated face preservation', 'Large-scale or iterative non-portrait work'],
    ]} />
    <H2>Generate from a prompt</H2>
    <Code title="Python: generate an image" code={`
import base64

result = client.images.generate(
    model="gpt-image-2",      # your deployment name
    prompt="Studio photo of a red hiking boot on a white background",
    size="1024x1024",
    quality="medium",
    n=1,                      # 1 to 10 images per request
)

with open("boot.png", "wb") as f:
    f.write(base64.b64decode(result.data[0].b64_json))
`} />
    <H2>Controls to know</H2>
    <Table head={['Control', 'Effect']} rows={[
      [<C>quality</C>, 'low, medium or high, and newer models add more levels. Lower is faster and cheaper'],
      [<C>size</C>, 'Output dimensions'],
      [<C>n</C>, 'Number of images, from 1 to 10'],
      [<C>output_format</C>, 'Such as PNG or JPEG'],
      [<><C>background</C>: transparent</>, 'Transparent background. GPT-image-1 only, and needs PNG output'],
      [<C>output_compression</C>, 'A level from 0 to 100, for JPEG output'],
      [<><C>stream</C> with <C>partial_images</C></>, 'Returns 1 to 3 partial images as it generates, which improves perceived speed'],
      ['Input fidelity (edits)', 'Preserves faces and detail more accurately. Not supported by gpt-image-1-mini'],
    ]} />
  </>
);

const Editing = () => (
  <>
    <H2>Editing images</H2>
    <Table head={['Edit type', 'You provide', 'Use it for']} rows={[
      ['Prompt-driven', 'Image + prompt', 'Whole-image changes, or using a reference image'],
      ['Inpainting (mask-based)', 'Image + mask + prompt', 'Changing one region while leaving the rest alone'],
      ['Variations', 'Image', 'Different takes on the same image'],
    ]} />
    <MaskDemo />
    <Callout kind="exam" title="Exam focus: mask rules">
      The mask must be a <strong>PNG</strong> with the <strong>same dimensions</strong> as the input. <strong>Fully transparent pixels (alpha of zero)</strong> mark the area to edit. People often assume black or white marks it, which is the trap.
    </Callout>
    <Code title="Python: inpainting with a mask" code={`
result = client.images.edit(
    model="gpt-image-2",
    image=open("tent.png", "rb"),
    mask=open("sky_mask.png", "rb"),     # PNG, same size, transparent where you want edits
    prompt="Change the sky to a sunset",
)
`} />
    <H2>Responsible AI for generation</H2>
    <UL>
      <li>Prompts and outputs go through the content filter. A prompt it flags as harmful doesn't produce an image.</li>
      <li>Azure-specific safeguards also include abuse monitoring.</li>
      <li>Apply your own brand and policy checks after generation, since a filter doesn't know your rules.</li>
    </UL>
  </>
);

const Video = () => (
  <>
    <H2>Video generation with Sora 2</H2>
    <Callout kind="preview">Sora 2 is in preview in Azure. The study guide says the exam may include preview features if they're commonly used, and video generation is a named skill.</Callout>
    <Table head={['Capability', 'Detail']} rows={[
      ['Input types', 'Text to video, image to video, and generated video to video'],
      ['Audio', 'Generated in the output video'],
      ['Remix', 'Targeted changes to an existing video instead of starting over'],
      ['API', 'The v1 API, using the standard OpenAI client'],
      ['Billing', 'Per second of video'],
      ['Blocked', 'IP and photorealistic content'],
    ]} />
    <H2>It's an asynchronous job</H2>
    <OL>
      <li>Create the job, which returns an ID with status <C>queued</C>.</li>
      <li>Poll until it completes or fails.</li>
      <li>Download the finished video.</li>
    </OL>
    <Code title="Python: create, poll and download" code={`
import time

video = client.videos.create(
    model="sora-2",     # your deployment name
    prompt="A hiker walks through a misty forest at sunrise",
    size="1280x720",
    seconds="8",
)

while video.status in ("queued", "in_progress"):
    time.sleep(10)
    video = client.videos.retrieve(video.id)

if video.status == "completed":
    client.videos.download_content(video.id).write_to_file("hike.mp4")
else:
    print("Failed:", video.error)
`} />
    <H2>Edit a generated video with remix</H2>
    <P>Remix keeps the original's framework, scene transitions and layout, while applying your change. It references the ID of a <strong>successfully completed</strong> video.</P>
    <Code title="Python: remix" code={`
video = client.videos.remix(
    video_id="<previous_video_id>",
    prompt="Shift the color palette to teal, sand, and rust, with a warm backlight.",
)
`} />
    <Callout kind="exam">
      Limit each remix to <strong>one clearly described adjustment</strong>. Narrow edits stay closer to the source and are less likely to introduce visual defects. To make several changes, remix several times.
    </Callout>
    <H3>Choosing a method</H3>
    <Table head={['Goal', 'Use']} rows={[
      ['A new clip from a description', 'Text to video'],
      ['Animate a product photo or keep a style', 'Image to video with a reference'],
      ['Change the colours in a clip you generated', 'Remix'],
      ['Analyse what\'s in an existing video', 'Not generation. See Content Understanding'],
    ]} />
  </>
);

export default function ImageVideo() {
  return (
    <ModulePage id="image-video"
      intro="Generate and edit images and video from prompts and reference media, and pick the right controls for quality, cost and speed."
      tabs={[
        { id: 'images', label: 'Generate images', content: <Images /> },
        { id: 'editing', label: 'Edit images', content: <Editing /> },
        { id: 'video', label: 'Video', content: <Video /> },
      ]}
      sources={[
        ['Azure OpenAI image generation models', 'https://learn.microsoft.com/azure/foundry/openai/how-to/dall-e'],
        ['Video generation with Sora 2', 'https://learn.microsoft.com/azure/foundry/openai/concepts/video-generation'],
        ['Foundry Models sold by Azure', 'https://learn.microsoft.com/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure'],
        ['Content filtering for Foundry Models', 'https://learn.microsoft.com/azure/foundry-classic/foundry-models/concepts/content-filter'],
      ]} />
  );
}

import ModulePage from '../../components/ModulePage';
import { C, Callout, Flow, Grid, Card, H2, H3, OL, P, Table, UL } from '../../components/ui';

const Basics = () => (
  <>
    <H2>Azure Speech in Foundry Tools</H2>
    <Table head={['Capability', 'What it does']} rows={[
      ['Speech to text', 'Transcribes audio, in real time or in batches'],
      ['Text to speech', 'Natural-sounding speech from text, including MAI-Voice models'],
      ['Speech translation', 'Real-time speech-to-text and speech-to-speech translation'],
      ['Language identification', 'Detects which language is being spoken'],
      ['Custom speech', 'Trains recognition on your vocabulary and audio conditions'],
      ['Custom voice', 'A unique, private brand voice (limited access)'],
      ['Text to speech avatar', 'A synthetic video of a person speaking'],
      ['Pronunciation assessment', 'Feedback on accuracy and fluency'],
    ]} />
    <H2>Improving recognition</H2>
    <Table head={['Problem', 'Use']} rows={[
      ['A few product names or terms get misheard', 'A phrase list: lightweight and just in time, with no training'],
      ['Heavy jargon, accents or noisy audio', 'A custom speech model: more work but more accurate'],
      ['You need a recognisable brand voice for output', 'Custom voice. Requires applying for access'],
    ]} />
    <Callout kind="exam">
      Start with the <strong>phrase list</strong>, because it needs no training. Move to a <strong>custom speech model</strong> when that isn't enough. Note that custom speech improves <em>recognition</em> (input), and custom voice changes <em>synthesis</em> (output).
    </Callout>
    <H2>Translating speech</H2>
    <Table head={['Option', 'Use it for']} rows={[
      ['Speech translation', 'Speech to text in other languages, or speech to speech'],
      ['Live Interpreter', 'Low-latency speech to speech that continuously identifies the language and preserves style and tone, without you setting an input language'],
      ['Speech translation + Custom Translator', 'Domain terminology, using a multi-service resource'],
      ['Transcribe, translate with an LLM, then synthesize', 'Custom logic at each step, at the cost of more latency'],
    ]} />
  </>
);

const Voice = () => (
  <>
    <H2>Two ways to build a voice agent</H2>
    <Grid>
      <Card title="Cascaded">
        Separate stages: speech recognition, then a text model, then speech synthesis. You can choose each part, like a custom voice or a specific text model.
      </Card>
      <Card title="Speech to speech">
        One model takes audio in and produces audio out, such as GPT-Realtime. Fewer stages to manage.
      </Card>
    </Grid>
    <P>Choose based on your latency, model, voice and language requirements.</P>
    <Flow steps={[
      { title: 'Microphone', sub: 'User audio' },
      { title: 'Voice Live', sub: 'Noise, echo, turn detection' },
      { title: 'Model or agent', sub: 'Instructions and tools' },
      { title: 'Speech out', sub: 'Voice, optional avatar' },
    ]} />
    <H2>Voice Live API</H2>
    <P>Voice Live gives you one interface to what you'd otherwise assemble yourself. It connects over <strong>WebSocket</strong> and is designed to be compatible with the Azure OpenAI Realtime API.</P>
    <UL>
      <li><strong>No audio model to deploy:</strong> it's fully managed.</li>
      <li><strong>Conversation features:</strong> noise suppression, echo cancellation, interruption detection and end-of-turn detection.</li>
      <li><strong>Customisation:</strong> phrase lists, custom speech and custom voice.</li>
      <li><strong>Models:</strong> a choice including GPT-5, GPT-4.1, GPT-4o and Phi.</li>
      <li><strong>Function calling:</strong> external actions, and grounded answers through the VoiceRAG pattern.</li>
      <li><strong>Avatars:</strong> standard or custom.</li>
    </UL>
    <Table head={['Need', 'Do it yourself', 'Voice Live']} rows={[
      ['Broad language coverage', '✓', '✓'],
      ['Brand voice', '✓', '✓'],
      ['Choice of models', '✓', '✓'],
      ['Built-in conversation enhancements', '✗', '✓'],
      ['Low engineering cost', '✗', '✓'],
      ['Low perceived latency', '✗', '✓'],
    ]} />
    <H2>Which voice option?</H2>
    <Table head={['Scenario', 'Choose']} rows={[
      ['New managed voice agent, with no orchestration to host', 'Voice-based prompt agent'],
      ['Connect voice to an existing text agent', 'Voice Live with Foundry Agent Service'],
      ['Set the prompt per session, with fine-grained control', 'Voice Live directly with a model'],
      ['Transcribe recordings only, with no conversation', 'Speech to text'],
    ]} />
    <Callout kind="preview">
      Voice-based prompt agents are in preview. They support speech-to-speech and text models, with built-in telephony and voice-pipeline tracing. Microsoft suggests starting with them for new voice experiences.
    </Callout>
    <H3>Estimating cost</H3>
    <P>Voice Live bills by tokens, which you can estimate from audio length. Azure OpenAI models use about <strong>10 tokens per second of input audio</strong> and <strong>20 per second of output</strong>. Phi models use about 12.5 for input and 20 for output. Cached inputs, including the prompt and conversation context, are also charged.</P>
  </>
);

const Audio = () => (
  <>
    <H2>Multimodal reasoning from audio</H2>
    <P>Instead of transcribing first, an audio-capable model can reason over the sound directly.</P>
    <Table head={['Approach', 'Good for', 'Trade-off']} rows={[
      ['Transcribe, then use a text model', 'Exact wording, search, audit trail', 'Loses tone and background sounds'],
      ['Audio-capable model', 'Tone, emotion and non-speech sounds', 'Less choice of models'],
      ['Content Understanding on audio', 'Fixed fields from calls, such as call center analytics', 'Needs an analyzer schema'],
    ]} />
    <P>Examples of audio-capable models are the GPT-4o audio models, GPT-Realtime and <C>Phi-4-multimodal-instruct</C>, which accepts text, images and audio.</P>
    <H2>Add speech to an agent</H2>
    <OL>
      <li>Build and test the agent in text first, including its tools and evaluation.</li>
      <li>Choose an approach: voice-based prompt agent or Voice Live with your agent.</li>
      <li>Customise recognition with a phrase list or custom speech.</li>
      <li>Keep responses short. People can't skim speech.</li>
      <li>Evaluate it, as Voice Live evaluations can use audio input datasets.</li>
    </OL>
    <H2>Evaluating voice agents</H2>
    <P>The Voice Live evaluation guidance recommends <strong>response completeness, groundedness and relevance</strong> as primary metrics. Built-in evaluators are selectable, but custom evaluators aren't currently supported in that harness.</P>
    <Callout kind="trap" title="Common trap: guardrails and transcription">
      The guardrail system doesn't apply to prompts and completions of <strong>audio transcription models</strong>. If transcribed text feeds a model, apply your guardrails at the step where that text enters it.
    </Callout>
    <H3>Speech as an agent tool</H3>
    <P>The Foundry portal also offers a <strong>Speech MCP server</strong>, so agents can use speech capabilities as a tool rather than a modality.</P>
  </>
);

export default function Speech() {
  return (
    <ModulePage id="speech"
      intro="Turn speech into text and back, build real-time voice agents, and reason directly over audio."
      tabs={[
        { id: 'basics', label: 'Speech services', content: <Basics /> },
        { id: 'voice', label: 'Voice agents', content: <Voice /> },
        { id: 'audio', label: 'Audio in agents', content: <Audio /> },
      ]}
      sources={[
        ['What is Azure Speech?', 'https://learn.microsoft.com/azure/ai-services/speech-service/overview'],
        ['Voice Live API for real-time voice agents', 'https://learn.microsoft.com/azure/ai-services/speech-service/voice-live'],
        ['How to customize Voice Live input and output', 'https://learn.microsoft.com/azure/ai-services/speech-service/voice-live-how-to-customize'],
        ['Quickstart: Voice-based prompt agent', 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-voice-agent'],
        ['Quickstart: Voice Live with Agent Service', 'https://learn.microsoft.com/azure/ai-services/speech-service/voice-live-agents-quickstart'],
        ['How to recognize and translate speech', 'https://learn.microsoft.com/azure/ai-services/speech-service/how-to-translate-speech'],
        ['How to evaluate Voice Live agents', 'https://learn.microsoft.com/azure/ai-services/speech-service/how-to-voice-live-evaluate'],
        ['Guardrails and controls overview', 'https://learn.microsoft.com/azure/foundry/guardrails/guardrails-overview'],
      ]} />
  );
}

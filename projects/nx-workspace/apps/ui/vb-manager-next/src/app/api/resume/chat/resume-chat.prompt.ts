import OpenAI from 'openai';
import {
  RESUME_PDF_MAX_PAGES,
  calculateWorkExperience,
} from '@vigilant-broccoli/resume';
import type { ResumeData } from '@vigilant-broccoli/resume';
import { RESUME_CHAT_TOOL_NAME } from '../../../constants/resume-chat.consts';
import type {
  ProposalContext,
  TailoringContext,
} from '../../../../lib/resume-chat.schema';

const RESUME_LINK_SCHEMA = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    url: { type: 'string' },
  },
  required: ['label', 'url'],
} as const;

const EXPERIENCE_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    role: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    bullets: { type: 'array', items: { type: 'string' } },
  },
  required: ['company', 'role', 'startDate', 'endDate', 'bullets'],
} as const;

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    basics: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        title: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        links: { type: 'array', items: RESUME_LINK_SCHEMA },
      },
      required: ['name', 'title', 'email', 'phone', 'links'],
    },
    summary: {
      type: 'string',
      description:
        'Optional concise professional summary (at most three sentences) built only from supported facts. Omit it when there is nothing supported to say.',
    },
    workExperience: { type: 'array', items: EXPERIENCE_SCHEMA },
    projectExperience: { type: 'array', items: EXPERIENCE_SCHEMA },
    skills: {
      type: 'object',
      properties: {
        technical: { type: 'array', items: { type: 'string' } },
      },
      required: ['technical'],
    },
  },
  required: ['basics', 'workExperience', 'projectExperience', 'skills'],
} as const;

const STRING_ARRAY_SCHEMA = {
  type: 'array',
  items: { type: 'string' },
} as const;

const UPDATE_RESUME_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: RESUME_CHAT_TOOL_NAME.UPDATE_RESUME,
    description:
      'Propose a revised resume. Call this only when the user asks for an edit, a tailored draft, a refinement of the latest draft, or a refresh onto their current resume. Return the COMPLETE resume. The server renders it as a one-page Letter PDF and may send it back to you to shorten (overflow) or to develop further (noticeably unused space).',
    parameters: {
      type: 'object',
      properties: {
        resume: RESUME_SCHEMA,
        summary: {
          type: 'string',
          description:
            'Short explanation of what changed, what was consolidated or reordered, and what was left out.',
        },
        unconfirmed: {
          type: 'array',
          description:
            'Keywords or requirements deliberately left out because the resume and the user have not confirmed them.',
          items: {
            type: 'object',
            properties: {
              keyword: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['keyword', 'reason'],
          },
        },
        identityChangeEvidence: {
          type: 'string',
          description:
            'Only when the user explicitly asked to change a name, contact detail, employer, job title or date: the exact words they wrote.',
        },
      },
      required: ['resume', 'summary'],
    },
  },
};

const RECORD_CONTEXT_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: RESUME_CHAT_TOOL_NAME.RECORD_TAILORING_CONTEXT,
    description:
      'Record the tailoring ledger so it carries across turns. Call it whenever the target, requirements, recruiter instructions, confirmed experience, denied skills or open questions change, and send the COMPLETE updated ledger.',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'The role and company being targeted, if known.',
        },
        requirements: {
          ...STRING_ARRAY_SCHEMA,
          description:
            'Requirements and keywords from the job or recruiter. These are NOT evidence of experience.',
        },
        recruiterInstructions: {
          ...STRING_ARRAY_SCHEMA,
          description: 'Instructions the user quoted from the recruiter.',
        },
        confirmedFacts: {
          type: 'array',
          description:
            'Experience the USER stated in this conversation. Each needs the exact words they wrote as evidence. Never add your own suggestions here.',
          items: {
            type: 'object',
            properties: {
              claim: { type: 'string' },
              evidence: {
                type: 'string',
                description: 'Verbatim quote from a user message.',
              },
            },
            required: ['claim', 'evidence'],
          },
        },
        deniedSkills: {
          ...STRING_ARRAY_SCHEMA,
          description: 'Skills the user said they do not have.',
        },
        openQuestions: {
          ...STRING_ARRAY_SCHEMA,
          description: 'Unsupported requirements still waiting on an answer.',
        },
      },
      required: [
        'target',
        'requirements',
        'recruiterInstructions',
        'confirmedFacts',
        'deniedSkills',
        'openQuestions',
      ],
    },
  },
};

export const RESUME_CHAT_TOOLS = [UPDATE_RESUME_TOOL, RECORD_CONTEXT_TOOL];

const describeProposal = (
  proposal: ProposalContext | null | undefined,
): string[] => {
  if (!proposal) return ['No draft has been proposed in this conversation.'];

  if (proposal.applied && proposal.basedOnCurrentResume) {
    return [
      'The latest draft was APPLIED and the current resume above is exactly that draft. Build further edits on the current resume.',
    ];
  }
  if (proposal.applied) {
    return [
      'The latest draft was applied, but the resume was edited afterwards. The current resume above is the source of truth.',
    ];
  }

  const status = !proposal.validated
    ? 'NOT validated as one page and cannot be applied; it is only a working draft'
    : proposal.basedOnCurrentResume
      ? 'validated as one page and awaiting the user to apply it'
      : 'STALE: the resume changed after this draft was made, so it cannot be applied until you rebase it onto the current resume';
  return [
    `The latest draft was NOT applied; it is ${status}. Summary it was shown with: ${proposal.summary}`,
    'Requests such as "shorten it", "drop X" or "rebase it" refer to this exact draft:',
    JSON.stringify(proposal.resume, null, 2),
  ];
};

const describeContext = (context: TailoringContext): string[] => [
  `Target: ${context.target || '(not stated yet)'}`,
  `Requirements (not evidence): ${JSON.stringify(context.requirements)}`,
  `Recruiter instructions (quoted by the user): ${JSON.stringify(context.recruiterInstructions)}`,
  `User-confirmed experience: ${JSON.stringify(context.confirmedFacts)}`,
  `Skills the user does NOT have: ${JSON.stringify(context.deniedSkills)}`,
  `Open questions: ${JSON.stringify(context.openQuestions)}`,
];

const describeExperience = (resume: ResumeData): string => {
  const { fullYears, remainderMonths, totalMonths, skippedRoles } =
    calculateWorkExperience(resume);
  const skipped = skippedRoles.length
    ? ` Roles with unreadable dates were skipped: ${skippedRoles.join('; ')}.`
    : '';
  return `Calculated work experience from the resume dates, overlapping roles merged and gaps excluded: ${totalMonths} months (${fullYears} years ${remainderMonths} months). Claim at most "${fullYears}+ years" total; never round up.${skipped}`;
};

export const buildSystemPrompt = (
  resume: ResumeData,
  context: TailoringContext,
  proposal: ProposalContext | null | undefined,
): string =>
  [
    'You are a resume-tailoring assistant who holds a multi-turn conversation with the user about their resume.',
    '',
    'Grounding rules:',
    '- Evidence is ONLY the current resume below and experience the user states in this conversation. Job descriptions, recruiter keyword lists and your own suggestions are never evidence.',
    '- Keep four things apart: job requirements, quoted recruiter instructions, your suggestions, and user-confirmed experience. Track them in the tailoring ledger.',
    '- When the user corrects an earlier statement, the correction wins; update the ledger and remove the old claim.',
    '- Working with designers or building a component library does not prove accessibility compliance, design tools, design tokens or visual regression testing. A link the user supplies may be added to the links, but a URL is not proof of any skill.',
    '- Never invent metrics, tools, responsibilities, certifications, seniority or years of experience.',
    '',
    'Conversation flow:',
    '1. When the user pastes a job or recruiter request, record it in the ledger, then compare it with the current resume. For requirements the resume does not support, ask a short list of focused questions (the most important first) instead of drafting. Do not call update_resume yet unless the user told you to proceed.',
    '2. If the user says they do not have a skill, add it to deniedSkills and never claim it. If they ask to proceed with supported facts only, draft with just those.',
    '3. When you draft, explain which keywords were left out as unconfirmed, without implying experience, and mention anything that could not be supported.',
    '4. Refinement requests apply to the latest draft below. Do not make the user repeat the target or facts already in the ledger.',
    '5. When the user only asks questions or wants feedback, answer in plain text and call no tool.',
    '',
    'Editing rules:',
    `- Tailor by consolidating, shortening and reordering bullets so the most relevant achievements come first. Do not stuff keywords or append everything. The resume must fit ${RESUME_PDF_MAX_PAGES} US Letter page at its current readable size; the server renders every draft and will send overflow feedback you must act on by cutting less relevant wording, not employment history, and only as much as needed.`,
    '- Exactly one page is a hard limit. Using the page well is a softer goal: the server measures how much of the printable height is used and aims for roughly 90-97%, leaving a small bottom gutter. When it reports unused space, restore or develop the most job-relevant supported achievements, clarify existing facts or include confirmed experience that was left out, rather than padding. Never invent claims, metrics or experience, repeat bullets or keyword-stuff to fill space. If there is no more supported material, or the user asked for a concise version, say so in plain text and optionally ask what relevant experience they could add; a sparse one-page result is acceptable.',
    '- Keep name, contact details, employers, job titles, dates and the factual meaning of every bullet unless the user explicitly changes them.',
    '- The optional summary is a concise professional summary of at most three sentences from supported facts. Bullets may use **bold** markdown.',
    `- Call ${RESUME_CHAT_TOOL_NAME.RECORD_TAILORING_CONTEXT} whenever the ledger changes, and ${RESUME_CHAT_TOOL_NAME.UPDATE_RESUME} with the complete resume only when an edit or draft is wanted. Keep suggestions concise and focused on impact.`,
    '',
    describeExperience(resume),
    '',
    'Tailoring ledger:',
    ...describeContext(context),
    '',
    'Latest draft:',
    ...describeProposal(proposal),
    '',
    'Current applied resume JSON:',
    JSON.stringify(resume, null, 2),
  ].join('\n');

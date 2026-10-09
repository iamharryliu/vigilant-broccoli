import OpenAI from 'openai';
import {
  RESUME_PDF_MAX_PAGES,
  RESUME_PDF_FILL_TARGET,
  RESUME_PDF_MIN_LAST_LINE_RATIO,
  calculateWorkExperience,
} from '@vigilant-broccoli/resume';
import type { ResumeData } from '@vigilant-broccoli/resume';
import { RESUME_CHAT_TOOL_NAME } from '../../../constants/resume-chat.consts';
import type {
  ProposalContext,
  TailoringContext,
} from '../../../../lib/resume-chat.schema';
import type { SkillsNote } from '../../../../lib/resume-chat.skills-note';

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
        'Optional follow-up for the professional summary (one or two sentences) built only from supported facts about the work most relevant to the target. Do not write the opening role-and-years sentence: the server prepends "ROLE with N years of experience in software development." itself. Omit it when there is nothing supported to say.',
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
      'Propose a revised resume when the user supplies a job or recruiter request, asks for an edit or improvement, refines the latest draft, or requests a refresh onto their current resume. Draft immediately from supported facts and report unsupported requirements in unconfirmed alongside the draft. Return the COMPLETE resume. The server renders it as a one-page Letter PDF and may send it back to you to shorten (overflow) or to develop further (noticeably unused space).',
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
            'All keywords or requirements left out because the current resume, career note and user-confirmed facts do not support them, each with a reason. Return an empty array when there are no gaps. Keep these gaps with every revision instead of waiting for answers before drafting.',
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
      required: ['resume', 'summary', 'unconfirmed'],
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
            'Requirements and keywords from the job or recruiter, most important first: required before nice-to-have, each skill or technology as its own short entry (for example "Java", "Spring Boot", "RabbitMQ"). The skills line is ordered by this order. These are NOT evidence of experience.',
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

const PERCENT = 100;

const describeSkillsNote = (skillsNote?: SkillsNote): string[] =>
  skillsNote
    ? [
        "Skills note (the user's own record; a skill listed here counts as genuinely used and may be claimed):",
        `Confirmed skills: ${JSON.stringify(skillsNote.skills)}`,
        `Allowed titles (basics.title may only ever be one of these): ${JSON.stringify(skillsNote.titles)}`,
        'A keyword with no row in the skills note is unconfirmed: leave it out of the draft and list it in unconfirmed without delaying edits based on supported facts. After returning the draft, optionally ask where they used it; if they confirm, suggest the row to add to the skills note before claiming it.',
        `Detail on where each confirmed skill was used: ${skillsNote.skillsText}`,
        ...(skillsNote.experience.length > 0
          ? [
              `Job experience record (the user's own account of each job; use it as the source of truth for what was done there when rewording or adding bullets for that company, never place work under a different company): ${JSON.stringify(skillsNote.experience)}`,
            ]
          : []),
        ...(skillsNote.languages.length > 0
          ? [
              `Confirmed spoken and written languages (proficiency is already known, so never ask the user about these): ${JSON.stringify(skillsNote.languages)}`,
            ]
          : []),
      ]
    : [
        'No skills note is available, so skills are supported only by the current resume and the conversation, and the title cannot change.',
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
  skillsNote?: SkillsNote,
): string =>
  [
    'You are a resume-tailoring assistant who holds a multi-turn conversation with the user about their resume.',
    '',
    'Grounding rules:',
    '- Evidence is ONLY the current resume, the career note below and experience the user states in this conversation. Job descriptions, recruiter keyword lists and your own suggestions are never evidence.',
    '- Keep four things apart: job requirements, quoted recruiter instructions, your suggestions, and user-confirmed experience. Track them in the tailoring ledger.',
    '- When the user corrects an earlier statement, the correction wins; update the ledger and remove the old claim.',
    '- Working with designers or building a component library does not prove accessibility compliance, design tools, design tokens or visual regression testing. A URL the user supplies is not proof of any skill. Never claim accessibility compliance (WCAG) unless the skills note or the user confirms it.',
    '- Never invent metrics, tools, responsibilities, certifications, seniority or years of experience. Keep figures faithful to the current resume, the skills note or what the user said; the server rejects drafts that claim more years than the dates support.',
    '',
    'Conversation flow:',
    '1. When the user supplies a job or recruiter request, or asks to edit, improve or tailor the resume, record the target and requirements in the ledger and call update_resume in the same turn using supported facts. Treat a pasted job request as a request to tailor unless the user explicitly asks for discussion or feedback only. Do not wait for permission to draft or for answers about unsupported requirements.',
    '2. If the user says they do not have a skill, add it to deniedSkills and never claim it. Unknown or denied requirements are gaps, not blockers: omit them and still draft using the experience you know. Keep any unanswered questions in the ledger for later refinement.',
    '3. Return the edited resume with a concise explanation of changes and the unconfirmed gap list, including a reason for each omission. Include all gaps in update_resume.unconfirmed on every revision, using an empty array when none remain. Optional focused questions come after the draft and gap notes; do not make questions the only output when supported edits are possible.',
    '4. Refinement requests apply to the latest draft below. Do not make the user repeat the target or facts already in the ledger.',
    '5. When the user explicitly asks only questions, a review or feedback without edits, answer in plain text without calling update_resume. Ask before drafting only if an essential choice cannot be inferred and no useful supported edit is possible.',
    '',
    'Editing rules:',
    '- Preserve the current resume. Tailoring means rewording, reordering and emphasising, not deleting: keep every existing bullet and skill unless the page is over one page, and then remove the minimum, starting with the least relevant. Condense a bullet before removing it. If the server reports unused space after a draft, restore the bullets you removed.',
    `- Tailor by consolidating, shortening and reordering bullets so the most relevant achievements come first. Do not stuff keywords or append everything. The resume must fit ${RESUME_PDF_MAX_PAGES} US Letter page at its current readable size; the server renders every draft and will send overflow feedback you must act on by cutting less relevant wording, not employment history, and only as much as needed.`,
    `- Exactly one page is a hard limit. Using the page well is a softer goal: the server measures how much of the printable height is used and aims for ${Math.round(RESUME_PDF_FILL_TARGET.MIN_RATIO * PERCENT)}-${Math.round(RESUME_PDF_FILL_TARGET.MAX_RATIO * PERCENT)}%, leaving a small bottom gutter. When it reports unused space, restore or develop the most job-relevant supported achievements, clarify existing facts or include confirmed experience that was left out, rather than padding. Never invent claims, metrics or experience, repeat bullets or keyword-stuff to fill space. If there is no more supported material, or the user asked for a concise version, say so in plain text and optionally ask what relevant experience they could add; a sparse one-page result is acceptable.`,
    '- Keep name, contact details, employers, job roles, dates and the factual meaning of every bullet unless the user explicitly changes them.',
    '- Never add, remove or change basics.links; return them exactly as in the current resume. The user edits links outside this editor.',
    '- Update the experience lines for the target, not only the skills line. For each requirement that has a row in the skills note, make sure the entries named in its "Used In" column show it: reword an existing bullet there to name the skill, or add a new bullet only if the page has room, using the row\'s Note detail for specifics. If the Note is empty, only name the skill inside an existing bullet\'s real work (for example "Java and Spring Boot" in a Capco banking API bullet) and invent no project, metric or outcome. Never put a skill under an employer its "Used In" column does not list; the server rejects it.',
    '- Tailor the summary to the target role as well as the skills: write only the follow-up after the opening role-and-years sentence the server adds, covering the experience most relevant to the target using only supported facts, instead of keeping a generic or previous framing. Bold target keywords in it with **double asterisks**.',
    '- basics.title may be changed to suit the target role, but only to one of the allowed titles in the skills note; otherwise leave it as is.',
    '- The skills line sits at the bottom of the resume. Aim for a single line: put the most job-relevant confirmed skills first, then keep every other skill already on the line; remove one only if the line would otherwise wrap, and then only the least relevant.',
    `- Every wrapped line (bullet, summary, skills) should end at least ${Math.round(RESUME_PDF_MIN_LAST_LINE_RATIO * PERCENT)}% full. A bullet whose last line is only a few words should be tightened to one line or extended with supported detail; the server reports these lines and you must fix them.`,
    '- When over one page, trim in this order: condense older or less relevant bullets first, then drop the least relevant bullets of the earliest roles. Keep every employer and role, and the bullets that match the target.',
    '- When there is unused space, first restore material that was on the earlier resume or in the skills note and is relevant, before writing anything new. Prefer a full one-line bullet to a half-empty wrapped one.',
    '- When the calculated experience is just under a whole number of years, write "nearly N years" rather than rounding up.',
    '- The optional summary is a concise professional summary of at most three sentences from supported facts. Bullets may use **bold** markdown.',
    `- Call ${RESUME_CHAT_TOOL_NAME.RECORD_TAILORING_CONTEXT} whenever the ledger changes, and ${RESUME_CHAT_TOOL_NAME.UPDATE_RESUME} with the complete resume only when an edit or draft is wanted. Keep suggestions concise and focused on impact.`,
    '',
    describeExperience(resume),
    '',
    ...describeSkillsNote(skillsNote),
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

const CLASSNAME_ATTRIBUTE = 'className';
const CLASS_HELPERS = new Set(['cn', 'clsx']);
const LIGHT_ONLY_PATTERN = /^(bg)-(white|gray-\S+)$|^(border|text)-gray-\S+$/;
const DARK_PROPERTIES = ['bg', 'border', 'text'];
const NODE_TYPE = {
  JSX_ATTRIBUTE: 'JSXAttribute',
  CALL_EXPRESSION: 'CallExpression',
  LITERAL: 'Literal',
  TEMPLATE_ELEMENT: 'TemplateElement',
};

const getProperty = utility => utility.slice(0, utility.indexOf('-'));

const getStaticStrings = (node, visitorKeys) => {
  if (!node) return [];
  if (node.type === NODE_TYPE.LITERAL)
    return typeof node.value === 'string' ? [{ node, text: node.value }] : [];
  if (node.type === NODE_TYPE.TEMPLATE_ELEMENT)
    return [{ node, text: node.value.cooked ?? '' }];
  return (visitorKeys[node.type] ?? []).flatMap(key =>
    [node[key]].flat().flatMap(child => getStaticStrings(child, visitorKeys)),
  );
};

const isClassNameAttribute = node =>
  node.type === NODE_TYPE.JSX_ATTRIBUTE &&
  node.name.name === CLASSNAME_ATTRIBUTE;

const isClassHelperCall = node =>
  node.type === NODE_TYPE.CALL_EXPRESSION &&
  CLASS_HELPERS.has(node.callee.name);

const isInsideClassName = ancestors => ancestors.some(isClassNameAttribute);

const toUtilities = strings =>
  strings.flatMap(({ text }) => text.split(/\s+/)).filter(Boolean);

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      missingDark:
        '`{{utility}}` is light-only. Use Card/CardContainer or a ThemeScope token (e.g. bg-[var(--gray-3)]), or add a `dark:{{property}}-*` utility.',
    },
  },
  create: context => {
    const { sourceCode } = context;
    const { visitorKeys } = sourceCode;

    const check = root => {
      const strings = getStaticStrings(root, visitorKeys);
      const utilities = toUtilities(strings);
      const darkProperties = new Set(
        DARK_PROPERTIES.filter(property =>
          utilities.some(utility => utility.startsWith(`dark:${property}-`)),
        ),
      );
      strings.forEach(({ node, text }) =>
        text
          .split(/\s+/)
          .filter(
            utility =>
              LIGHT_ONLY_PATTERN.test(utility) &&
              !darkProperties.has(getProperty(utility)),
          )
          .forEach(utility =>
            context.report({
              node,
              messageId: 'missingDark',
              data: { utility, property: getProperty(utility) },
            }),
          ),
      );
    };

    return {
      JSXAttribute: node => {
        if (isClassNameAttribute(node)) check(node.value);
      },
      CallExpression: node => {
        if (
          isClassHelperCall(node) &&
          !isInsideClassName(sourceCode.getAncestors(node))
        )
          check(node);
      },
    };
  },
};

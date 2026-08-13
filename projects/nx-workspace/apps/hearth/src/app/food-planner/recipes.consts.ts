export type MockRecipe = {
  id: string;
  title: string;
  description: string;
  markdown: string;
};

export const MOCK_RECIPES: MockRecipe[] = [
  {
    id: 'pork-stir-fry',
    title: 'Ginger Pork Stir Fry',
    description: 'Quick weeknight stir fry with lean pork and crisp veg.',
    markdown: `# Ginger Pork Stir Fry

A fast, savoury stir fry that comes together in under 20 minutes.

## Ingredients
- 500g lean pork, thinly sliced
- 2 tbsp soy sauce
- 1 tbsp oyster sauce
- 1 thumb fresh ginger, grated
- 3 cloves garlic, minced
- 1 red bell pepper, sliced
- 2 spring onions, chopped
- 1 tbsp vegetable oil
- 200g jasmine rice

## Method
1. Marinate the pork in soy and oyster sauce for 10 minutes.
2. Heat the oil, fry ginger and garlic until fragrant.
3. Add pork and sear until browned, then toss in the pepper.
4. Finish with spring onions and serve over steamed rice.`,
  },
  {
    id: 'tomato-basil-pasta',
    title: 'Tomato & Basil Pasta',
    description: 'A simple weeknight pasta with a bright tomato sauce.',
    markdown: `# Tomato & Basil Pasta

Comforting and vegetarian, ready in half an hour.

## Ingredients
- 400g spaghetti
- 800g canned chopped tomatoes
- 4 cloves garlic, sliced
- 1 small bunch fresh basil
- 3 tbsp olive oil
- 1 tsp sugar
- 50g parmesan, grated
- Salt and pepper to taste

## Method
1. Cook the spaghetti until al dente.
2. Gently fry the garlic in olive oil, add tomatoes and sugar.
3. Simmer 15 minutes, season, then stir through torn basil.
4. Toss with pasta and top with parmesan.`,
  },
  {
    id: 'chickpea-curry',
    title: 'Coconut Chickpea Curry',
    description: 'Creamy, warming curry that is naturally vegan.',
    markdown: `# Coconut Chickpea Curry

A pantry-friendly curry with a rich coconut base.

## Ingredients
- 2 cans chickpeas, drained
- 400ml coconut milk
- 1 onion, diced
- 3 cloves garlic, minced
- 2 tbsp curry powder
- 1 can chopped tomatoes
- 200g fresh spinach
- 1 tbsp coconut oil
- 250g basmati rice

## Method
1. Soften the onion in coconut oil, add garlic and curry powder.
2. Stir in tomatoes and coconut milk, then the chickpeas.
3. Simmer 20 minutes, wilt in the spinach.
4. Serve over basmati rice.`,
  },
  {
    id: 'breakfast-oats',
    title: 'Overnight Oats',
    description: 'No-cook breakfast you prep the night before.',
    markdown: `# Overnight Oats

Prep a jar tonight for an easy grab-and-go breakfast.

## Ingredients
- 100g rolled oats
- 250ml milk
- 2 tbsp Greek yoghurt
- 1 tbsp chia seeds
- 1 tbsp honey
- 1 handful blueberries
- 1 banana, sliced

## Method
1. Combine oats, milk, yoghurt, chia and honey in a jar.
2. Refrigerate overnight.
3. Top with blueberries and banana before eating.`,
  },
  {
    id: 'roast-chicken',
    title: 'Herb Roast Chicken',
    description: 'A classic Sunday roast with lemon and thyme.',
    markdown: `# Herb Roast Chicken

A simple whole roast chicken with plenty of flavour.

## Ingredients
- 1 whole chicken (about 1.5kg)
- 50g butter, softened
- 1 lemon, halved
- 4 sprigs fresh thyme
- 6 cloves garlic
- 800g potatoes, quartered
- 2 tbsp olive oil
- Salt and pepper to taste

## Method
1. Rub the chicken with butter, salt and pepper, stuff with lemon and thyme.
2. Scatter potatoes and garlic around, drizzle with olive oil.
3. Roast at 200C for 80 minutes until cooked through.
4. Rest 10 minutes before carving.`,
  },
];

# Swedish Grammar

## Table of Contents

- [Terms](#terms)
- [Huvudsats and Bisats Structure](#huvudsats-and-bisats-structure)
- [Rak ordföljd (Straight Word Order)](#rak-ordföljd-straight-word-order)
- [Omvänd ordföljd (Inverted Word Order)](#omvänd-ordföljd-inverted-word-order)
  - [Time first](#time-first)
  - [Location first](#location-first)
  - [Question with a question word](#question-with-a-question-word)
  - [Yes/no question](#yesno-question)
- [Possessive](#possessive)

## Terms

| **Term** | **Description** | **Example** |
| --- | --- | --- |
| **Huvudsats (Main Clause)** | A main clause that can stand alone as a complete sentence. Contains a subject and a verb. | "Jag gillar att läsa." |
| **Bisats(Subordinate Clause)** | A subordinate clause that cannot stand alone and depends on the main clause. Often begins with a conjunction like "att," "om," or "för att." | "Jag gillar att läsa när jag har tid." |
| **[Satsadverbial (Sentence Adverbial)](./swedish-verbs/swedish-satsadverbial.md)** | A word that modifies the entire sentence, often expressing negation, probability, or emphasis.<br/>It appears **before the verb in a bisats** and **after the first element in a huvudsats**. | "Jag gillar **inte** att läsa på kvällen." (Main clause) <br> "Jag gillar att läsa när jag **inte** är trött." (Subordinate clause) |
| **[Hjälpverb (Auxiliary Verb)](./swedish-verbs/swedish-auxiliary-verbs.md)** | An auxiliary verb that combines with a main verb to form different tenses, moods, or aspects. | "Jag **ska** läsa en bok." (Future) <br> "Jag **har** läst den boken." (Perfect) <br> "Jag **kan** läsa svenska." (Ability) |
| **Huvudverb (Main Verb)** | The main action or state in the sentence. It carries the primary meaning and can often stand alone without an auxiliary verb. | "Jag **läser** en bok." <br> "Hon **springer** varje morgon." <br> "Vi **tänker** på dig." |

## Huvudsats and Bisats Structure

A huvudsats stands alone; a bisats depends on it and is introduced by a conjunction. Both can sit in one sentence: _Jag gillar att läsa när jag inte är trött._

```mermaid
flowchart TB
    subgraph SENT["Sentence: Jag gillar att läsa när jag inte är trött"]
        direction TB
        subgraph H["Huvudsats (main clause)"]
            direction LR
            H1["First element<br/>Jag"] --> H2["Verb<br/>gillar"] --> H3["Satsadverbial<br/>(inte)"] --> H4["Rest<br/>att läsa"]
        end
        subgraph B["Bisats (subordinate clause)"]
            direction LR
            B1["Conjunction<br/>när"] --> B2["Subject<br/>jag"] --> B3["Satsadverbial<br/>inte"] --> B4["Verb<br/>är"] --> B5["Rest<br/>trött"]
        end
        H -->|"adds information to the huvudsats"| B
    end
```

## Rak ordföljd (Straight Word Order)

The subject comes first, then the verb in position 2, then the rest. Used in a huvudsats that starts with the subject.

```mermaid
flowchart LR
    S["Subject<br/>Jag"] --> V["Verb<br/>gillar"] --> A["Satsadverbial<br/>inte"] --> R["Rest<br/>att läsa på kvällen"]
```

## Omvänd ordföljd (Inverted Word Order)

Something other than the subject comes first (often time or place), so the verb stays in position 2 and the subject moves after it.

### Time first

```mermaid
flowchart LR
    F["First element<br/>På kvällen"] --> V["Verb<br/>läser"] --> S["Subject<br/>jag"] --> A["Satsadverbial<br/>inte"] --> R["Rest<br/>så mycket"]
```

_In the evening I don't read so much._

### Location first

```mermaid
flowchart LR
    F["First element<br/>I Stockholm"] --> V["Verb<br/>bor"] --> S["Subject<br/>jag"] --> A["Satsadverbial<br/>inte"] --> R["Rest<br/>längre"]
```

_I don't live in Stockholm anymore._

### Question with a question word

```mermaid
flowchart LR
    F["Question word<br/>Var"] --> V["Verb<br/>bor"] --> S["Subject<br/>du"] --> R["Rest<br/>nu"]
```

_Where do you live now?_

### Yes/no question

```mermaid
flowchart LR
    V["Verb<br/>Läser"] --> S["Subject<br/>du"] --> R["Rest<br/>varje dag"]
```

_Do you read every day?_

## Possessive

[subject]s [noun]

# Productivity

## Eisenhower Decision Matrix

- Q1 - Important and urgent.
- Q2 - Important and not urgent.
- Q3 - Not important and urgent.
- Q4 - Not important and not urgent.

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'quadrant1Fill':'#e8f5e9', 'quadrant2Fill':'#ffebee', 'quadrant3Fill':'#fff3e0', 'quadrant4Fill':'#f3e5f5'}}}%%
quadrantChart
    title Eisenhower Decision Matrix
    x-axis Urgent --> Not Urgent
    y-axis Important --> Not Important

    quadrant-2 Q1 - Important & Urgent
    quadrant-1 Q2 - Important & Not Urgent
    quadrant-3 Q3 - Not Important & Urgent
    quadrant-4 Q4 - Not Important & Not Urgent

```

### Q2 Deep Dive

- What we can't afford not to do Q2 tasks!
- Q2 negative vs Q2 positive
- Rest and recovery exists in Q2
  - Q4 activities that are actually Q2 activities
  - Ideally avoid Q4 activities or turn Q4 activities into Q2 activities. 
- Learning also lives in Q2
```mermaid
flowchart TD

Q1[Q1 Activities]
Q3[Q3 Activities]

subgraph C[Capacity]
  Time[Time]
  Energy[Energy]
  Motivation[Motivation]
  Resources[Available Resources]
end 

subgraph E[Capacity Consumers]
  Q1[Q1 Activities]
  Q2N[Q2 Negative Activities]
  Q3[Q3 Activities]
  Q4[Q4 Activities]
end

subgraph Q2P[Q2 Positive Activities ]
  Q21[Rest]
end

SC[Surplus Capacity]


C --> E
E --> RC
RC[Remaining Capacity]
RC --> Q2P
Q2P --> SC
```

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart TD
    Output --> CAP
    CONSUMERS --> |Consumes| CAP
    P --> |Consumes| CAP
    O --> |Consumes| CAP
    CAP --> |determines| F[Degrees of Freedom]
    F --> Freetime
    CAP --> |When depleted| CON

    subgraph CONSUMERS[Q3 Consumers]
       C1[Entertainment]
       C2[Social media]
       C3[Eating]
    end

    subgraph P[Q2 Negative]
        P1[Concerns/Anxieties]
        P2[Uncontrollable Problems]
    end

    subgraph O[Q1 Responsibilities]
        Work[Work]
        Chores[Chores]
        Food[Food]
        Rel[Relationship]
        Dog[Taking care of dog]
    end

    subgraph CAP[Available Capacity]
        Time[Time]
        Energy[Energy]
        Motivation[Motivation]
        Resources[Available Resources]
    end


    subgraph Freetime[Freetime]
      Hobbies
      Wellbeing
      Social
      Rest
      Reflection
    end


    subgraph CON[Consequences]
        Stress[Stress]
        Crashing[Crash out]
    end

    style P fill:#ffcccc
    style O fill:#fff4cc
    style CAP fill:#ccf2ff
    style F fill:#d4f4dd
    style CON fill:#ffcccc
```
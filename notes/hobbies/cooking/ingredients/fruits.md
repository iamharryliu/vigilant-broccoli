# Fruits

Peak season for a temperate Northern Hemisphere climate (e.g. the continental US); actual availability varies by region and is wider wherever imports or greenhouse growing are common. The hearth app reads the Seasonal Timeline below to build its In Season card, so the gantt format must stay parseable.

## Table of Contents

- [Seasonality](#seasonality)
  - [Seasonal Timeline](#seasonal-timeline)

## Seasonality

### Seasonal Timeline

Grouped by each fruit's first-listed season; a bar split in two means the peak window wraps across the new year (e.g. Orange peaks Dec–Apr, drawn as Jan–Apr plus Dec). Dates use an arbitrary year — only the month position matters.

```mermaid
gantt
    title Fruits In Season
    dateFormat YYYY-MM-DD
    axisFormat %b
    todayMarker off

    section Spring
    Pineapple  :2024-03-01, 2024-07-31
    Rhubarb    :2024-04-01, 2024-06-30
    Strawberry :2024-04-01, 2024-06-30

    section Summer
    Apricot        :2024-06-01, 2024-07-31
    Blackberry     :2024-06-01, 2024-08-31
    Blueberry      :2024-06-01, 2024-08-31
    Cantaloupe     :2024-06-01, 2024-08-31
    Cherry         :2024-05-01, 2024-07-31
    Fig            :2024-06-01, 2024-09-30
    Honeydew Melon :2024-06-01, 2024-08-31
    Lime           :2024-06-01, 2024-08-31
    Mango          :2024-05-01, 2024-08-31
    Nectarine      :2024-06-01, 2024-08-31
    Peach          :2024-06-01, 2024-08-31
    Plum           :2024-06-01, 2024-09-30
    Raspberry      :2024-06-01, 2024-09-30
    Watermelon     :2024-06-01, 2024-08-31

    section Fall
    Apple       :2024-09-01, 2024-11-30
    Cranberry   :2024-10-01, 2024-11-30
    Grape       :2024-08-01, 2024-10-31
    Kiwi        :2024-01-01, 2024-03-31
    Kiwi        :2024-10-01, 2024-12-31
    Pear        :2024-09-01, 2024-11-30
    Persimmon   :2024-10-01, 2024-12-31
    Pomegranate :2024-09-01, 2024-11-30

    section Winter
    Avocado              :2024-01-01, 2024-04-30
    Grapefruit            :2024-01-01, 2024-04-30
    Lemon                 :2024-01-01, 2024-05-31
    Orange                :2024-01-01, 2024-04-30
    Orange                :2024-12-01, 2024-12-31
    Tangerine / Mandarin  :2024-01-01, 2024-02-29
    Tangerine / Mandarin  :2024-11-01, 2024-12-31
```

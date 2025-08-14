```
concept Interpretation [Property, Community]
purpose ground actions, properties, and satisfaction in shared background meaning
principle
  if parties share enough background, conditions of satisfaction can be declared and accepted
state
  sharedMeaning: Community -> set Property
actions
  addShared (c: Community, p: Property)
    sharedMeaning[c] += p
```
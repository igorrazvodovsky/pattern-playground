```
concept InnovationViaConversationDesign [Conversation]
purpose expand possibilities by introducing new conversations or reconfiguring existing ones
principle
  if new links or types of requests are introduced,
  the organisation can create new domains of action
state
  newTypes: set ConversationType
actions
  introduceType (ct: ConversationType)
    newTypes += ct
```
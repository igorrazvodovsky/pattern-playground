<!-- TODO: currency -->

# Shopping cart

## Purpose

Manage user's pending purchase

## State
- user
- items
  - quantity
  - price
- derived

## Actions
- create
- add
- change quantity
- remove
- checkout
- change price

## Synchronizations

### Syncs with Catalogue

- When an item is added/removed, the corresponding catalogue stock should be updated.
- Price of the item should be set to the price of the item in the catalogue

### Syncs with Order

When an order is fulfilled, the cart should be emptied.

### Syncs with Discount

When a discount is applied to an item in the cart, the price of
that item should be updated
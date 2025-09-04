concept User [U]
purpose
  to associate identifying information with users
state
  users: set U
  name: U -> string
  email: U -> string
actions
  register [
    user: U ;
    name: string ;
    email: string ] => [ user: U ]
    associate user with users
    associate name and email unique + valid
    return the user reference
  register [
    user: U ;
    name: string ;
    email: string ] => [ error: string ]
    if either name/email is invalid or !unique
    return the error description
  update [ user: U ; name: string ] => [ user: U ]
    if name is unique, update user's name
    return the user reference
  update [ user: U ; name: string ]
    => [ error: string ]
    if name is not-unique, describe error
    return the error description
  update [ user: U ; email: string ]
    => [ user: U ]
    if email is unique + valid, update id's email
    return the user reference
  update [ user: U ; email: string ]
    => [ error: string ]
    if email is not-unique or invalid
    return the error description
operational principle
  after register [] => [ user: x ]
  and update [ name: "xavier" ] => [ user: x ]
  for any ?u such that ?u.name = "xavier", ?u = x
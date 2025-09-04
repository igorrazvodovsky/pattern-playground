<!-- Create a concept for Profile, where the purpose is to associate descriptive information with an individual. A profile consists of a bio and an image (can be a string storing a URL). -->

concept Profile [P, U]
purpose
  to associate descriptive information with users
state
  profiles: set P
  profile: U -> P
  bio: P -> string
  image: P -> string
actions
  register [ profile: P ; user: U ]
    => [ profile: P ]
    add profile to profiles
    associate user with profile
    add a default blank bio and image to profile
    return profile
  update [ profile: P ; bio: string ]
    => [ profile: P ]
    update profile with bio
    return profile
  update [ profile: P ; image: string ]
    => [ profile: P ]
    if image is valid (URL, base64, etc.)
    update profile with image
    return profile
  update [ profile: P ; image: string ]
    => [ error: string ]
    if image is invalid, describe error
    return error
operational principle
  after register [ profile: p ; user: u ]
  => [ profile: p ]
  and update [ profile: p ; bio: "Hello world" ]
  => [ profile: p ]
  and update [ profile: p ; image: "pic.jpg" ]
  => [ profile: p ]
  the profile p contains both the updated bio
  "Hello world" and original image "pic.jpg"
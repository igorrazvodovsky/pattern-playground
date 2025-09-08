<!-- Most of the actions have empty argument lists, since the synchronization depends only on awaiting their successful completion and then formulating a response from the resulting state of their respective concepts. -->

sync RegistrationResponse
when {
  Web/request: [ method: "register" ]
    => [ request: ?request ]
  User/register: [] => [ user: ?user ]
  Profile/register: [] => [ profile: ?profile ]
  Password/set: [] => [ user: ?user ]
  JWT/generate: [] => [] }
where {
  User: {
    ?user
      name: ?username ;
      email: ?email }
  Profile: {
    ?profile
      bio: ?bio ;
      image: ?image }
  JWT: { ?user token: ?token } }
then {
  Web/respond: [
    request: ?request ;
    body: [
      user: [
        username: ?username ;
        email: ?email ;
        bio: ?bio ;
        image: ?image ;
        token: ?token ] ] ] }
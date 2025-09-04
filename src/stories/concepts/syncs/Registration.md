<!-- when a Web request for register occurs for some ?usernameand ?email, binda new uuid()as ?user, and register a new user with that ?user identifier, and with a name of ?username and an email of ?email. -->

sync Registration
when {
  Web/request: [
    method: "register" ;
    username: ?username ;
    email: ?email ]
    => [] }
where { bind ( uuid() as ?user) }
then {
  User/register: [
    user: ?user ;
    name: ?username ;
    email: ?email ] }

sync NewPassword
when {
  Web/request: [
    method: "register" ;
    password: ?password ]
    => []
  User/register: []
    => [ user: ?user ] }
then {
  Password/set: [
    user: ?user ;
    password: ?password ] }

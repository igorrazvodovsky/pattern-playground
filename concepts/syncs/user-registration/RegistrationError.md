sync RegistrationError
when {
  Web/request: []
    => [ request: ?request ]
  User/register: []
    => [ error: ?error ] }
then {
  Web/respond: [
    request: ?request ;
    error: ?error ;
    code: 422 ] }


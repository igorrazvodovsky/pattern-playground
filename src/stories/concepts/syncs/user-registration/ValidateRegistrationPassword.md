sync ValidateRegistrationPassword
when {
  Web/request: [
    method: "register" ;
    password: ?password ]
    => [ request: ?request ]}
then { Password/validate: [ password: ?password ] }


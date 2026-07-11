sync CreateProfile
when {
  User/register: []
    => [ user: ?user ] }
where { bind ( uuid() as ?profile ) }
then {
  Profile/register: [
    profile: ?profile ;
    user: ?user ] }
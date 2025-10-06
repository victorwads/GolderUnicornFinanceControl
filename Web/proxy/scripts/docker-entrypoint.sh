yarn install

cmd="proxy"
[ "${DEBUG:-false}" = "true" ] && cmd="proxy:debug"

exec yarn "$cmd"

## Installation

You should run the script `init_dependencies.bash` in order to download and compile `dnsmasq` binary in `bin/dnsmasq`. This has to be done only once.

## Configuration

You may adapt `dnsmasq.conf` file to your needs.

Be sure to deactivate other DHCP services, like the one provided by the wifi router. It may give different IP to clients and may also point the clients to other DNS.

To be sure to use you own DNS locally, you can not rely on DHCP. you should change your network configuration. Even better create a new one.

For the *first* network interface, the one used to send queries, change the DNS settings.

1. Your static IP should come first (192.168.1.100). It will forward queries when running. Otherwise, the queries will resolve using the following order.
2. Your home DNS (192.168.1.1)
3. Your secondary home DNS (192.168.1.254)
4. Your workplace DNS should come last if not available from outside, to avoid time-outs (Ircam: 129.102.2.10).
5. Your secondary workplace DNS, if any (Ircam: 129.102.10.11)
6. etc.

## Run

Start DNS and DHCP with `DNS_run.command`. It will ask a password for sudo operations, and will keep running.

- DHCP service
- DNS service
  - forward queries to upstream DNS
  - listen to static IP and localhost

## Use in another application

Make sure to add the dnsmasq submodule:
`git submodule add https://github.com/imp/dnsmasq.git dns/dnsmasq`

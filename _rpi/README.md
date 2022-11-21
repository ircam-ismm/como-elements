# experience-como-embedded

## filesysytem

```
/home/pi/
  /como-elements
  /certs
```

## prepare RPi using soundpi

```sh
./1-init-rpi -p como-elements
```

## Connect with RJ45 and check connection

```sh
ssh como-elements-0[10-14].local
ping google.com
```

## Install certs

from own computer

```sh
scp -r /path/to/certs pi@como-elements-xxx.local:/home/pi/certs
```

_**valid until 19/01/2023**_

## install como-elements

_**branch develop**_


```sh
# install como-elements
cd /home/pi
git clone https://github.com/ircam-ismm/como-elements.git
cd como-elements
npm install
npm run build

# configure elements and daemon
node _rpi/create-config-files.js
./_rpi/install-daemon.sh

# check service
systemctl status como-elements-daemon.service

sudo shutdown now
```

- mount the case, then

```sh
# install argon one pi 4
cd /home/pi
curl https://download.argon40.com/argon1.sh | bash

# reboot
sudo reboot now
```

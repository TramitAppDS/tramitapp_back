#!/bin/bash
ls
cd /tramitapp_back
ls
sudo apt-get update

sudo amazon-linux-extras install docker #! ?

sudo apt install docker.io

sudo service docker start #! ?

sudo usermod -a -G docker ec2-user #! ?

sudo curl -SL https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo chmod 666 /var/run/docker.sock

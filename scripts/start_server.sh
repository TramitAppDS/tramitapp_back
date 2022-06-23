#!/bin/bash
ls
cd /tramitapp_back
sudo docker-compose down
sudo docker-compose build
sudo docker-compose up -d

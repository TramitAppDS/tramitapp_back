#!/bin/bash
ls
cd /tramitapp_back
sudo docker-compose stop
sudo docker-compose up --build -d

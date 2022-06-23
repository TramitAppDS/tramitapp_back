#!/bin/bash
ls
cd /tramitapp_back
docker system prune -f
sudo docker-compose down
sudo docker-compose up --build -d

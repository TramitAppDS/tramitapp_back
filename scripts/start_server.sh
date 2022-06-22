#!/bin/bash
cd tramitapp_back
sudo docker-compose stop
docker-compose up --build -d
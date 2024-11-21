#!/bin/bash

docker stop node-webapp-template_dev
docker rm node-webapp-template_dev
docker stop node-webapp-template_dev_db
docker rm node-webapp-template_dev_db
docker volume rm $(docker volume ls -qf "name=node-webapp-template_dev_*")
docker network rm node-webapp-template_dev

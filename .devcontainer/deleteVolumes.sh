#!/bin/bash

docker stop next-app-template_dev
docker rm next-app-template_dev
docker stop next-app-template_dev_db
docker rm next-app-template_dev_db
docker volume rm $(docker volume ls -qf "name=next-app-template_dev_*")

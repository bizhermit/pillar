#!/bin/bash

docker stop pillar_dev
docker rm pillar_dev
docker stop pillar_dev_db
docker rm pillar_dev_db
docker volume rm $(docker volume ls -qf "name=pillar_dev_*")
docker network rm pillar_dev

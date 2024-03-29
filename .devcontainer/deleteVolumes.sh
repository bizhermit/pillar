#!/bin/bash

docker stop pillar_dev pillar_dev_db
docker rm pillar_dev pillar_dev_db
docker volume rm $(docker volume ls -qf "name=pillar_dev_*")

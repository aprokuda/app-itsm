#!/bin/bash


cp /home/docker/projects/.env /home/docker/projects/app-itsm/

cp /home/docker/projects/app-itsm/infra/Dockerfile /home/docker/projects/app-itsm/

cd home/docker/projects/app-itsm

docker build . -t back-itsm

docker tag back-itsm 10.33.133.101:5000/back-itsm

docker push 10.33.133.101:5000/back-itsm

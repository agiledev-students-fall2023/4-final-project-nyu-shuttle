#!/bin/bash
hostname=$(curl http://169.254.169.254/metadata/v1/hostname)
docker run -d -p 80:8080 --name nyushuttle-"$hostname" agiledev-students-fall2023/4-final-project-nyu-shuttle:"$hostname"
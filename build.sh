#!/bin/bash

NAME="gopher-proxy"
echo $NAME
docker build --progress plain -t $NAME .

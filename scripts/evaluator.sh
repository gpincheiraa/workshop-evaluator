#!/bin/bash
#REPOSITORY_URL=https://github.com/gpincheiraa/workshop2016-nodeconfar-angular
REPOSITORY_URL=$1

#Descarga la rama y consigue las métricas de evaluación
( echo "Cloning the repository: $1" && \
  git clone $REPOSITORY_URL scripts/workshop && \
  cd scripts/workshop && \
  git checkout master && \
  echo "Enter on the workshop repository: $(pwd)" && \
  echo "Install dependencies. (maybe take a while)" && \
  npm install --depth=0 && \
  echo "Testing repository source and calculating results" && \
  #Agregar resultados de los test
  npm run test-ci 2>/dev/null
  #TODO Calidad de código con sonar
)
mv scripts/workshop/.evaluation/evaluation.json scripts/evaluation.json
rm -rf scripts/workshop

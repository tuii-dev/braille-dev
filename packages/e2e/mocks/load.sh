#!/bin/bash
curl \
  --header "Content-Type: application/x-yaml" \
  --data-binary "@auth0.yml" \
  --insecure \
  "https://localhost:44301/mocks"

sleep 5
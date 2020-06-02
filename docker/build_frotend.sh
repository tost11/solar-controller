docker run -it --rm \
  -v ../solar-frontend:/proj \
  -w /proj \
  node:8.16	 \
  /bin/bash -c "npm install && npm run build"

docker run -it --rm \
  -v ../backend:/usr/src/mymaven \
  -w /usr/src/mymaven \
  -v /tmp/maven_solar:/root/.m2 \
  maven:3.6-jdk-11 \
  mvn clean install

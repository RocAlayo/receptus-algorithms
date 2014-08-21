# DOCKER-VERSION 1.0.0
FROM debian:latest

#repos mongo and node
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
RUN apt-get update

#install nodejs and mongodb
RUN clean=no apt-get install mongodb-org mysql-server -y

# mysql port and mongodb port
EXPOSE 54000 55000

CMD tail -f /var/log/dmesg
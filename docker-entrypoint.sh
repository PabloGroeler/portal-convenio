#!/bin/sh
set -e
mkdir -p /var/uploads/documentos-institucionais
mkdir -p /var/uploads/documentos-pessoais
chmod -R 777 /var/uploads
echo Upload dirs ready
exec /opt/jboss/container/java/run/run-java.sh

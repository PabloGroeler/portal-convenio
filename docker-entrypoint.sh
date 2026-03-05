#!/bin/sh
set -e

# Use UPLOAD_DIR env var if set, otherwise default to /var/uploads
UPLOAD_DIR=${UPLOAD_DIR:-/var/uploads}

# Create required directories for uploads
mkdir -p "$UPLOAD_DIR/documentos-institucionais"
mkdir -p "$UPLOAD_DIR/documentos-pessoais"
chmod -R 777 "$UPLOAD_DIR"

echo "📁 Criando diretórios de upload em $UPLOAD_DIR..."

echo "✅ Diretórios prontos. Iniciando aplicação..."

exec /opt/jboss/container/java/run/run-java.sh

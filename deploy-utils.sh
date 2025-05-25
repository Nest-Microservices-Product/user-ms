#!/bin/bash

install_node_and_pm2() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo 'Node.js o npm no están instalados. Instalando...'
    sudo apt update
    sudo apt upgrade -y
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt install nodejs -y
  fi

  if ! command -v pm2 >/dev/null 2>&1; then
    sudo npm install -g pm2
  fi

  if ! command -v nest >/dev/null 2>&1; then
    echo 'NestJS CLI no está instalado. Instalando...'
    sudo npm install -g @nestjs/cli
  fi
}

ensure_remote_path() {
  local path=""
  while [[ $# -gt 0 ]]; do
    case $1 in
      --path)
        path="$2"
        shift 2
        ;;
      *)
        echo "Unknown parameter: $1"
        return 1
        ;;
    esac
  done

  if [ -z "$path" ]; then
    echo "Error: --path es requerido"
    return 1
  fi

  if [ ! -d "$path" ]; then
    mkdir -p "$path"
  fi
}

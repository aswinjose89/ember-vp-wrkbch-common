#!/bin/bash
set -e
alias jq=~/bin/jq

echo "Installing ${package.full-name}"

if ! type "jq" > /dev/null; then
  echo "-----"
  echo "Error : jq command not found"
  echo "Please download and add it to ~/bin/"
  echo "-----"
  exit 1
fi

config_file=~/wb-config.json

echo "-----"
#Init from config file
if [ ! -f $config_file ]; then
  echo "Config file NOT available at $config_file, please create the config file"
  exit 1
fi

echo "checking the config file  : $config_file"
cat $config_file

apache_dir=$(jq -r ".apache_dir" $config_file)
if [ $apache_dir == null ]; then
  echo "apache_dir path not configured"
  exit 1
fi

environment=$(jq -r ".environment" $config_file)
if [ $environment == null ]; then
  echo "environment not configured"
  exit 1
fi

deploy_dir=$(jq -r ".deploy_dir" $config_file)
if [ $deploy_dir == null ]; then
  echo "deploy_dir not configured"
  exit 1
fi

echo "Pre-install checks successful"

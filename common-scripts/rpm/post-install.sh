#!/bin/bash
set -e
alias jq=~/bin/jq

config_file=~/wb-config.json

echo "-----"
echo "Loading the config file  : $config_file"

apache_dir=$(jq -r ".apache_dir" $config_file)
environment=$(jq -r ".environment" $config_file)
deploy_dir=$(jq -r ".deploy_dir" $config_file)
current_version_dir=$deploy_dir/${package.name}/${package.version}

app_dir=$apache_dir/${package.name}
echo "Apache http directory : $apache_dir"
echo "App softlink : $app_dir"
echo "App deploy directory : $current_version_dir"
echo "-----"

rm -f $app_dir
ln -s $current_version_dir $app_dir
echo "Softlink updated to the new package"

cd $current_version_dir

apps=(
  'ecdd-plus'
  'workbench'
)

module_info_file="$app_dir/module-info.json"
echo "Processing module-info : $module_info_file"
echo "-----"
echo "Updating apps..."
backup_dir="$deploy_dir/backup"

for i in "${apps[@]}"
do
  app=$i
  app_config_file="$apache_dir/$app-config.json"

  if [ -f $app_config_file -a -f $module_info_file ]; then
    echo "Updating module.json : $app_config_file"

    jq 'del(.modules["${package.name}"])' $app_config_file > temp.json
    jq -s '.[0] * .[1]' temp.json $module_info_file > temp2.json
    jq '.modules["${package.name}"].version="${package.version}"' temp2.json > result.json

    mkdir -p $backup_dir
    now=$(date +%Y_%m_%d_%H_%M)
    backup_file=$backup_dir/$app-module_$now.json

    cp -f $app_config_file $backup_file
    echo "old module.json backed up to $backup_file"

    cp -f result.json $app_config_file
    rm -f result.json temp.json temp2.json
  fi

done

echo "Apps updated"
echo "-----"

index_file="$app_dir/index.html"
if [ -f $index_file ]; then
  echo "Setting the current environment meta tag in index.html"
  sed -i "s/\@\@CURRENT_ENVIRONMENT/$environment/g" $index_file
else
  echo "index.html not available to update"
fi

echo "-----"
echo "${package.full-name} installed successful"
echo "-----"

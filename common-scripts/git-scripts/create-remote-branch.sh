#!/bin/sh

if [ $# -ne 2 ]; then
    echo 1>&2 Usage: $0 src_branch new_branch
    echo 1>&2 Eg : $0 master release/2.0
    exit 127
fi

src_branch=$1
new_branch=$2

REPOS=(
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-base-pom.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-feature-base.git"
    "ssh://git@10.23.186.11:7999/ecdd-plus/wb-lib-cdd-ds.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-lib-commons.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-lib-excel.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-lib-mstr.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-lib-fap.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-lib-formservices.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-lib-opa.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-svc-auditfeed.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-svc-cache.git"
    "ssh://git@10.23.186.11:7999/ecdd-plus/wb-svc-cdd.git"
    "ssh://git@10.23.186.11:7999/ecdd-plus/wb-svc-cdd-dcf.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-svc-core.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-svc-notification.git"
    "ssh://git@10.23.186.11:7999/wb2/wb-svc-prospect.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-svc-rdm.git"
    "ssh://git@10.23.186.11:7999/ecdd-plus/wb-svc-rpdm.git"
    "ssh://git@10.23.186.11:7999/wb2-foundation/wb-svc-sso.git"
)

cd ./temp_repo/
git remote add origin http://temp

set -e
for repo in "${REPOS[@]}"
do
    echo "Processing : ${repo}"
    git remote set-url origin ${repo}
    git fetch --prune
    git checkout ${src_branch}
    git reset --hard origin/${src_branch}
    git push origin ${src_branch}:refs/heads/${new_branch}
    echo "-----"
done

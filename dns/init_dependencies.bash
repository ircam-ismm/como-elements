#!/bin/bash

old_pwd="$(pwd)"

clean_up() {
    cd "$old_pwd" || exit 0
}
trap clean_up SIGINT SIGTERM


cd "$(dirname "$0")" || clean_up

base_pwd="$(pwd)"

echo "###########################"
echo "### init git submodules ###"
echo "###########################"
echo ""

git submodule update --init --recursive

echo "###############"
echo "### dnsmasq ###"
echo "###############"
echo ""

cd "${base_pwd}/dnsmasq" || clean_up

make clean all -j
mkdir -p "${base_pwd}/bin"
mv src/dnsmasq "${base_pwd}/bin"

make clean

echo "-----------------------------------------------------------------------"
echo "${base_pwd}/bin/dnsmasq is ready "
echo "-----------------------------------------------------------------------"
echo ""

clean_up

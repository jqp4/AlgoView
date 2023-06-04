#!/bin/bash

function draw_info_box() {
    local date=$(date +%Y-%m-%d)
    local time=$(date +%H:%M:%S)
    local info="    [$date $time] $*    "

    tput setaf 3

    echo "┏${info//?/━}┓"
    echo "┃$(tput setaf 4)$info$(tput setaf 3)┃"
    echo "┗${info//?/━}┛"

    tput sgr 0
}

draw_info_box "start run.sh $1"
cd ./scripts

# удаляем старые файлы
rm -rf ../public/AlgoViewCode/data/*
rm -rf output.json

# input.xml --> output.json
draw_info_box "run main $1"
./main $1

# output.json --> jsonGraphData.js
echo "\n"
draw_info_box "run python3 json2js.py output.json ../public/AlgoViewCode/data/jsonGraphData.js"
mkdir -p ../public/AlgoViewCode/data
python3 json2js.py output.json ../public/AlgoViewCode/data/jsonGraphData.js

draw_info_box "done!"
